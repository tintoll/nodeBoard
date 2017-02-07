var express = require("express");
var router = express.Router();
var passport= require("../config/passport");

//home
router.get("/", function(req,res){
  res.render("home/welcome");
});
router.get("/about", function(req,res){
  res.render("home/about");
});




/*
실제 로그인이 일어날때 코드의 진행순서입니다
1. 로그인 버튼이 클릭되면 routes/home.js의 post /login route의 코드가 실행됩니다.
2. 다음으로 config/passport.js의 local-strategy의 코드가 실행됩니다.
3. 로그인이 성공하면 config/passport.js의 serialize코드가 실행됩니다.
4. 마지막으로 routes/home.js의 post /login route의 successRedirect의 route으로 redirect가 됩니다.
5. 로그인이 된 이후에는 모든 신호가 config/passport.js의 deserialize코드를 거치게 됩니다.
 */
//Login
router.get("/login",function(req,res){  
  var username = req.flash("username")[0];
  var errors = req.flash("errors")[0] || {};
  res.render("home/login", {
    username:username,
    errors:errors
  });
});

/*
첫번째 callback은 보내진 form의 validation을 위한 것으로 에러가 있으면 flash를 만들고 login view로 redirect합니다. 
두번째 callback은 passport local strategy를 호출해서 authentication(로그인)을 진행합니다. 
*/
router.post("/login", function(req,res,next) {
    var errors = {};
    var isValid = true;
    if(!req.body.username){
      isValid = false;
      errors.username = "username is required!";
    }
    if(!req.body.password){
      isValid = false;
      errors.password = "password is required!";
    }
    if(isValid){
    next();
    } else {
    req.flash("errors",errors);
    res.redirect("/login");
    }
  },
  passport.authenticate("local-login", {
    successRedirect : "/",
    failureRedirect : "/login"
  }

));

// passport에서 제공된 req.logout함수를 사용하여 로그아웃하고 "/"로 redirect합니다. 
router.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");  
});


module.exports = router;
