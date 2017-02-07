var express = require("express");
var router = express.Router();
var User = require("../models/User");
var util  = require("../util");

//Index
router.route("/").get(function(req,res){
    User.find({})
        .sort({username:1}) //callback 함수가 없는 이유는 sort()함수를 사용하기 위해서
        .exec(function(err,users){ //exec 에 callback 함수를 지정
            if(err) return res.json(err);
            res.render("users/index", {users:users});
        });
});


//신규 유저 작성 폼 
router.get("/new", function(req,res){

    var user = req.flash("user")[0] || {};
    var errors = req.flash("errors")[0] || {};

    res.render("users/new",{user:user,errors:errors});
});

// 신규 유저 생성
router.post("/",function(req,res){
    User.create(req.body, function(err, user){
        if(err) {
           req.flash("user", req.body);
           req.flash("errors", util.parseError(err));
           return res.redirect("/users/new");;
        }
        res.redirect("/users");
    });
});


// 사용자 정보보기
router.get("/:username",function(req,res){
    User.findOne({username:req.params.username},function(err,user){
        if(err) return res.json(err);
        res.render("users/show",{user:user});
    });
});


//사용자 수정화면 호출
router.get("/:username/edit",function(req,res){
    var user = req.flash("user")[0];
    var errors = req.flash("errors")[0] || {};
    if(!user){
        User.findOne({username:req.params.username},function(err,user){
            if(err) return res.json(err);
            res.render("users/edit",{username:req.params.username, user:user, errors:errors });
        });
    } else {
        res.render("users/edit",{username:req.params.username, user:user, errors:errors });
    }
    
});

//사용자 정보 수정
router.put("/:username",function(req,res,next){       
    User.findOne({username:req.params.username})  
        .select({password:1}) //패스워드를 가져오도록 선택해준다. - 를 붙이면 안읽어옵니다.//여러개를 가져올려면 ("password -name")                                
        .exec(function(err,user){            
            if(err) return res.json(err);

            user.originalPassword = user.password;
            user.password = req.body.newPassword? req.body.newPassword : user.password;
            for(var p in req.body){ //각 항목을 덮어씌운다.
                user[p] = req.body[p];
            }
            
            user.save(function(err,user){
                if(err){
                    req.flash("user", req.body);
                    req.flash("errors", util.parseError(err));
                    return res.redirect("/users/"+req.params.username+"/edit");
                }

                res.redirect("/users/"+req.params.username);
            });

        });
});

module.exports = router;



