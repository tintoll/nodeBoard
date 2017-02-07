var util = {};

/*
mongoose에서 내는 에러와  mongoDB에서 내는 에러의 형태가 다르기 때문에 이 함수를 통해 에러의 형태를
{ 항목이름: { message: "에러메세지" } 로 통일시켜주는 함수입니다. 
if 에서 mongoose의  model validation error를, else if 에서 mongoDB에서 username이 중복되는 error를, else 에서 그 외 error들을 처리합니다. 
함수 시작부분에 console.log("errors: ", errors")를 추가해 주면 원래 에러의 형태를  console 에서 볼 수 있습니다.
*/
util.parseError = function(errors){
 var parsed = {};
 if(errors.name == 'ValidationError'){
  for(var name in errors.errors){
   var validationError = errors.errors[name];
   parsed[name] = { message:validationError.message };
  }
 } else if(errors.code == "11000" && errors.errmsg.indexOf("username") > 0) {
  parsed.username = { message:"This username already exists!" };
 } else {
  parsed.unhandled = JSON.stringify(errors);
 }
 return parsed;
}

util.getDate = function(dateObj){
 if(dateObj instanceof Date)
  return dateObj.getFullYear() + "-" + get2digits(dateObj.getMonth()+1)+ "-" + get2digits(dateObj.getDate());
}

util.getTime = function(dateObj){
 if(dateObj instanceof Date)
  return get2digits(dateObj.getHours()) + ":" + get2digits(dateObj.getMinutes())+ ":" + get2digits(dateObj.getSeconds());
}

module.exports = util;

// private functions
function get2digits (num){
 return ("0" + num).slice(-2);
}
