var express = require("express");
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var flash = require("connect-flash");
var session = require("express-session");
var passport   = require("./config/passport");

var dbinfo = require("./dbinfo/dbinfo.json");
var app = express();

//DB Setting
mongoose.connect(
  `mongodb://${dbinfo.id}:${dbinfo.pwd}@ds129469.mlab.com:29469/nic`
);

var db = mongoose.connection;
db.once("open", function(){
  console.log("DB connected");
});
db.on("error", function(err){
  console.log("DB Error : ", err);
});

//Other Setting
app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));

//bodyParser로 stream의 form data를 req.body에 옮겨 담습니다.
// 2번은 json data를, 3번은 urlencoded data를 분석해서 req.body를 생성합니다.
app.use(bodyParser.urlencoded({ extended: true }));  //3
app.use(bodyParser.json());  //2

app.use(methodOverride("_method"));

app.use(flash()); //  flash를 초기화 합니다. 이제부터 req.flash라는 함수를 사용할 수 있습니다.
/*
req.flash(문자열, 저장할값) 으로 사용하면 저장할 값(숫자, 문자열, 오브젝트등 어떠한 값이라도 가능)을 해당 문자열에 저장합니다.
이때 flash는 배열로 저장되기 때문에 같은 문자열을 중복해서 사용하면 순서대로 배열로 저장이 됩니다.
req.flash(문자열) 으로 사용하는 경우는 해당 문자열에 저장된 값들을 배열로 불러옵니다. 저장된 값이 없다면 빈 배열을 return합니다.
*/
app.use(session({secret:"MySecret"})); // session은 서버에서 접속자를 구분시키는 역할을 합니다.


// Passport 
app.use(passport.initialize()); // passport를 초기화 시켜주는 함수
app.use(passport.session());  //passport를 session과 연결해 주는 함수로 둘다 반드시 필요합니다.
// Custom Middlewares 
/*
app.use에 있는 함수는 request가 올때마다 route에 상관없이 무조건 해당 함수가 실행됩니다.
위치가 중요한데, app.use들 중에 위에 있는 것 부터 순서대로 실행되기 때문이죠. route과도 마찬가지로 반드시 route 위에 위치해야 합니다.
app.use에 들어가는 함수는 route에 들어가는 함수와 동일한 req, res, next의 3개의 parameter를 가집니다.
함수안에 반드시 next()를 넣어줘야 다음으로 진행이 됩니다.
*/
app.use(function(req,res,next){
  res.locals.isAuthenticated = req.isAuthenticated(); //passport에서 제공하는 함수로, 현재 로그인이 되어있는지 아닌지를 true, false로 return합니다
  res.locals.currentUser = req.user; // passport에서 추가하는 항목으로 로그인이 되면 session으로 부터 user를 deserialize하여 생성됩니다
  next();

  /*
  res.locals에 담겨진 변수는 ejs에서 바로 사용가능합니다.
  res.locals.isAuthenticated는 ejs에서 user가 로그인이 되어 있는지 아닌지를 확인하는데 사용되고, 
  res.locals.currentUser는 로그인된 user의 정보를 불러오는데 사용됩니다.
  */
});


// Routes
app.use("/", require("./routes/home"));
app.use("/posts", require("./routes/posts"));
app.use("/users", require("./routes/users"))

// port Setting
app.listen(7000, function(){
  console.log("Server on 7000 Port");
});
