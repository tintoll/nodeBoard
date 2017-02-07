var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");

// requeired가 배열로 들어오면 2번째 항목은 에러메지시 입니다.
// select:false로 설정하면 DB에서 값을 읽어 올때 해당 값을 읽어오라고 하는 경우에만 값을 읽어오게 됩니다
// 비밀번호는 중요하기 때문에 기본적으로 DB에서 값을 읽어오지 않게 설정했습니다.
var userSchema = mongoose.Schema({
    username:{
        type:String, 
        required:[true,"Username is required !"],
        match : [/^.{4,12}$/,"Should be 4-12 characters"], 
        trim : true,
        unique:true
    },
    password:{type:String, required:[true,"Password is requeired !"], select:false},
    name:{
        type:String, 
        requeired:[true,"Name is requeired !"],
        match : [/^.{4,12}$/,"Should be 4-12 characters"],
        trim : true
    },
    email:{
        type:String,
        match : [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Should be a vaild email address!"],
        trim : true
    }
},{
    toObject:{virtuals:true}
});

//회원가입, 정보 수정시에는 위 값들이 필요합니다. 
//DB에 저장되지 않아도 되는 정보들은 virtual로 만들어 줍니다.
userSchema.virtual("passwordConfirmation")
          .get(function(){ return this._passwordConfirmation;})
          .set(function(value){ this._passwordConfirmation=value;});
userSchema.virtual("originalPassword")
          .get(function(){ return this._originalPassword;})
          .set(function(value){ this._originalPassword=value;});
userSchema.virtual("currentPassword")
          .get(function(){ return this._currentPassword;})
          .set(function(value){ this._currentPassword=value;});
userSchema.virtual("newPassword")
          .get(function(){ return this._newPassword;})
          .set(function(value){ this._newPassword=value;});



var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/; // 8-16자리 문자열 중에 숫자랑 영문자가 반드시 하나 이상 존재해야 한다는 뜻의 regex입니다
var passwordRegexErrorMessage = "Should be minimum 8 characters of alphabet and number combination!"; 

/*
DB에 정보를 생성, 수정하기 전에 mongoose가 값이 유효(valid)한지 확인(validate)을 하게 되는데 password항목에 custom(사용자정의) validation 함수를 지정할 수 있습니다. 
virtual들은 직접 validation이 안되기 때문에(DB에 값을 저장하지 않으니까 어찌보면 당연합니다)
password에서 값을 확인하도록 했습니다. 
*/          
userSchema.path("password").validate( function(v){
    
    var user = this; //this는 user Model 
    console.log("user :" + user);    
    if(user.isNew){
        if(!user.passwordConfirmation){
            user.invalidate("passwordConfirmation","Password Confirmation is required !");
        }
        if(!passwordRegex.test(user.password)){ // 2-3
            user.invalidate("password", passwordRegexErrorMessage);
        } else if(user.password !== user.passwordConfirmation){
            user.invalidate("passwordConfirmation","Password Confirmation does not matched!");
        }
    }

    if(!user.isNew){
        if(!user.currentPassword) {
            user.invalidate("currentPassword","current Password is required !");
        }

        if(user.currentPassword && !bcrypt.compareSync(user.currentPassword, user.originalPassword)){ 
            user.invalidate("currentPassword","current Password is invalid !");
        }

        if(user.newPassword && !passwordRegex.test(user.newPassword)){ // 2-3
            user.invalidate("newPassword", passwordRegexErrorMessage);
        } else if(user.newPassword !== user.passwordConfirmation) {
            user.invalidate("passwordConfirmation","Password Confirmation does not matched!");
        }
    }

});          

//hash password
//pre함수는 첫번째 인자의 함수가 실행되기전에 callback함수가 실행된다.
//"save" event는 Model.create, model.save 함수 실행시 발생하는 event입니다.
userSchema.pre("save", function(next){
    
    var user = this;
    // isModified함수는 해당 값이 db에 기록된 값과 비교해서 변경된 경우 true를, 그렇지 않은 경우 false를 return하는 함수입니다. 
    if(!user.isModified("password")){
        return next();
    } else {
        user.password = bcrypt.hashSync(user.password);
        return next();
    }
});

userSchema.methods.authenticate = function (password) {
    var user = this;
    return bcrypt.compareSync(password, user.password);
};

var User = mongoose.model("user", userSchema);
module.exports = User;
