
var express = require("express");
var router = express.Router();
var Post  = require("../models/Post");
var util  = require("../util");

// Index
router.get("/", function(req,res){
  //Model.find는 조건에 맞는 결과를 모두 찾아 array로 전달
  Post.find({})
  .populate("author")  //.populate()함수는 relationship이 형성되어 있는 항목의 값을 생성해 줍니다. 
                      //현재 post의 author에는 user의 id가 기록되어 있는데, 이 값을 바탕으로 실제 user의 값을 author에 생성하게 됩니다
  .sort("-createdAt")
  .exec(function(err, posts){
    if(err) return res.json(err);
    res.render("posts/index", {posts:posts});
  });

  //sort를 이용해서 생성된 data가 위로 오도록 정렬합니다
  /*
  .sort()함수는 string이나 object를 받아서 데이터 정렬방법을 정의하는데요,
  문자열로 표현하는 경우 정렬할 항목명을 문자열로 넣으면 오름차순으로 정렬하고,
  내림차순인 경우 -를 앞에 붙여줍니다. 두가지 이상으로 정렬하는 경우 빈칸을 넣고 각각의 항목을 적어주면 됩니다.
  object를 넣는 경우 {createdAt:1}(오름차순), {createdAt:-1}(내림차순) 이런식으로 넣어주면 됩니다.
   */
});

//New
router.get("/new", function(req, res){
  var post = req.flash("post")[0] || {};
  var errors = req.flash("errors")[0] || {};

  res.render("posts/new",{ post:post, errors:errors });
});

// create
router.post("/", function(req, res){
  req.body.author = req.user._id;
  Post.create(req.body, function(err, post){
    if(err) {
      req.flash("post", req.body);
      req.flash("errors", util.parseError(err));
      return res.redirect("/posts/new");
    }
    res.redirect("/posts");
  });
});

//show
router.get("/:id", function(req, res){
 //Model.findOne은 DB에서 해당 model의 document를 하나 찾는 함수입니다
 Post.findOne({_id:req.params.id}) 
 .populate("author")               
 .exec(function(err, post){        
  if(err) return res.json(err);
  res.render("posts/show", {post:post});
 });

});

// edit
router.get("/:id/edit", function(req, res){
  var post = req.flash("post")[0];
  var errors = req.flash("errors")[0] || {};  
  if(!post) {
    Post.findOne({_id:req.params.id}, function(err, post){
      if(err) return res.json(err);
      res.render("posts/edit", {post:post, errors:errors});
    });
  } else {
    post._id = req.params.id;
    res.render("posts/edit", { post:post, errors:errors });
  }  
});


// update
router.put("/:id", function(req, res){
 req.body.updatedAt = Date.now(); //data의 수정이 있는 경우 수정된 날짜를 업데이트 합니다.
 //Model.findOneAndUpdate는 DB에서 해당 model의 document를 하나 찾아 그 data를 수정하는 함수입니다
 Post.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true}, function(err, post){
  //findOneAndUpdate는 기본설정이 schema에 있는 validation이 작동하지 않도록 되어 있기때문에 option을 통해서 validation이 작동하도록 설정해 주어야 합니다.
  if(err) {
    req.flash("post", req.body);
    req.flash("errors", util.parseError(err));
    return res.redirect("/posts/"+req.params.id+"/edit");
  }
  res.redirect("/posts/"+req.params.id);
 });
});

// destroy
router.delete("/:id", function(req, res){
 //Model.remove는 DB에서 해당 model의 document를 하나 찾아 삭제하는 함수입니다
 Post.remove({_id:req.params.id}, function(err){
  if(err) return res.json(err);
  res.redirect("/posts");
 });
});


module.exports = router;
