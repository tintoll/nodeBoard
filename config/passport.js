var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var User = require("../models/User");

/*
serialize는 login시에 DB에서 발견한 user를 어떻게 session에 저장할지를 정하는 부분입니다.
 user정보 전체를 session에 저장할 수도 있지만, session에 저장되는 정보가 너무 많아지면 사이트의 성능이 떨어질 수 있고, 
 user object가 변경되면 변경된 부분이 반영되지 못하므로 user의 id만 session에 저장합니다.
*/
passport.serializeUser(function(user,done){
    done(null, user.id);
});
/*
deserialize는 request시에 session에서 어떻게 user object를 만들지를 정하는 부분입니다. 
매번 request마다 user정보를 db에서 새로 읽어오는데, user가 변경되면 바로 변경된 정보가 반영되는 장점이 있습니다. 
다만 매번 request마다 db를 읽게 되는 단점이 있는데.. 선택은 그때 그때 상황에 맞게 하시면 됩니다.
*/
passport.deserializeUser(function(id,done){
    User.findOne({_id:id},function(err,user){
        done(err,user);
    });
});

//local strategy를 설정
passport.use("local-login",
    new LocalStrategy(
        {
            usernameField : "username",
            passwordField : "password",
            passReqToCallback : true            
        }, 
        //로그인 시에 이 함수가 호출됩니다.
        /*
        DB에서 해당 user를 찾고, user model에 설정했던 user.authenticate 함수를 사용해서 입력받은 password와 저장된 password hash를 비교해서 값이 일치하면 해당 user를 done에 담아서 return하고 (return done(null, user);),
        그렇지 않은 경우 username flash와 에러 flash를 생성한 후 done에 false를 담아 return합니다.(return done(null, false);)
        user가 전달되지 않으면 local-strategy는 실패(failure)로 간주됩니다
        */
        function(req,username,password, done) {
            User.findOne({username:username})
                .select({password:1})
                .exec(function(err,user){
                    if(err) return done(err);
                    if(user && user.authenticate(password)) {
                        return done(null, user);
                    } else {
                        req.flash("username",username);
                        req.flash("errors",{login:"Incorret username or password"});
                        return done(null,false); //done 함수의 첫번째 parameter는 항상 error를 담기 위한 것으로 error가 없다면 null을 담습니다.
                    }
                });
        }
    )
);

module.exports = passport;