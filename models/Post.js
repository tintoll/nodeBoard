var mongoose = require("mongoose");
var util  = require("../util");
//schema
// Post의 schema는 title, body, createdAt, updatedAt으로 구성이 되어 있습니다.
// 타입에 대해서는 http://mongoosejs.com/docs/schematypes.html 에서 참조 
var postSchema = mongoose.Schema({
  title : {type:String, required:[true,"Title is required!"]}, 
  body : {type:String, required:[true,"Body is required!"]},
  author:{type:mongoose.Schema.Types.ObjectId, ref:"user", required:true},
  createdAt : {type:Date, default:Date.now},
  //default 항목으로 기본 값을 지정할 수 있습니다. 함수명을 넣으면 해당 함수의 return이 기본값이 됩니다. Date.now는 현재시간
  updatedAt : {type:Date}
}, {
  toObject:{virtuals:true}
  //virtual들을 object에서 보여주는 mongoose schema의 option입니다.
});

// virtuals
/*
postSchema.virtual함수를 이용해서 createdDate, createdTime, updatedDate, updatedTime의 virtuals(가상 항목들)을 설정해 주었습니다.
virtuals은 실제 DB에 저장되진 않지만 model에서는 db에 있는 다른 항목들과 동일하게 사용할 수 있는데, get, set함수를 설정해서 어떻게 해당 virtual 값을 설정하고 불러올지를 정할 수 있습니다.
createdAt, updatedAt은 Data 타입으로 설정되어 있는데 javascript은 Data 타입에 formatting 기능
(시간을 어떠한 형식으로 보여줄지 정하는 것, 예를 들어 2017-01-02로 할지, 01-02-2017로 할지 등등)을 따로 설정해 주어야 하기 때문에 이와 같은 방식을 택했습니다.
 */
postSchema.virtual("createdDate").get(function(){
  return util.getDate(this.createdAt);
});
postSchema.virtual("createdTime").get(function(){
  return util.getTime(this.createdAt);
});
postSchema.virtual("updatedDate").get(function(){
  return util.getDate(this.updatedAt);
});
postSchema.virtual("updatedTime").get(function(){
  return util.getTime(this.updatedAt);
});

// model & export
var Post = mongoose.model("post", postSchema); //mongoose.model함수를 사용하여 contact schema의 model을 생성합니다
module.exports = Post;
