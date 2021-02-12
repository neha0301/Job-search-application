var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var express= require("express");
var app= express();
var request= require("request");
var $ = require("jquery");
var session = require("express-session");
var mongoose = require("mongoose");
var passport= require("passport");
var Localstrategy = require("passport-local");
var passportLocalMongoose= require("passport-local-mongoose");

var User = require("./db_schama/user_schema");

var urlencodedParser=bodyParser.urlencoded({extended: false});

const brain = require("brain.js");
const data = require("./data/data.json");

const network = new brain.recurrent.LSTM();
const trainData = data.map(item=>({
	input:item.skills,
	output: item.predict
}))

network.train(trainData,{
	iterations:10
})

var jobSchema = new mongoose.Schema({
	jobRole: String,
	location: String,
	annualPay: String,
	skillsRequired: String,
	expRequired: String
});

var job = mongoose.model("job", jobSchema);

var profileSchema = new mongoose.Schema({
	username1: String,
	email: String,
	experience: String,
	laid: String,
	skills2: String,
});

var profile = mongoose.model("profile", profileSchema);


mongoose.connect("mongodb://localhost/job_search_app");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
	secret: 'job application',
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new Localstrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//mongoose.connect("mongodb://localhost/job_search_app");
//app.set("view engine","ejs");
//app.use(express.static(public));
//app.use(bodyParser.urlencoded({extended: true}));


app.get("/",function(req,res){
	res.redirect("/job_search");
});

app.get("/job_search",function(req,res){
	res.render("home.ejs");
});

app.get("/job_search/login",function(req,res){
	res.render("form.ejs");
});

app.get("/form2",function(req,res){
	res.render("form2.ejs");
});

app.get("/form3",function(req,res){
	res.render("form3.ejs");
})

app.get("/form",function(req,res){
	res.render("form.ejs");
})
app.get("/home2",function(req,res){
	res.render("home2.ejs");
})
app.get("/job_search/skillquiz",function(req,res){
	res.render("skill.ejs");
});

app.get("/job_search/home",isLoggedIn,function(req,res){
	res.render("home2.ejs");
})

app.post("/job_search",function(req,res){
	res.render("home2.ejs");
});

app.get("job_search/logout",function(req,res){
	res.render("logout.ejs");
})
app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
})

app.get("/jobs",function(req,res){
	job.find({},function(err, alljobs){
		if(err){
			console.log(err);
		}
		else{
			res.render("job.ejs",{jobs: alljobs});
		}
	})
})
function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/form");
}

app.post("/job_search/skillquiz/result",urlencodedParser,function(req,res){
	console.log(req.body.experience);
	const output= network.run(req.body.experience);
	console.log('predict:${output}');
	var ans1=req.body.q1;
	var ans2=req.body.q2;
	var ans3=req.body.q3;
	var ans4=req.body.q4;
	var ans5=req.body.q5;
	var ans6=req.body.q6;
	var ans7=req.body.q7;
	var ans8=req.body.q8;
	var ans9=req.body.q9;
	var ans10=req.body.q10;
	var ans11=req.body.q11;
	var ans12=req.body.q12;
	var ans13=req.body.q13;
	var ans14=req.body.q14;
	var ans15= req.body.q15;
	var score=0;
	var quotient=0;
	var cpp=0,java=0,python=0,git=0,nodejs=0;
	if(ans15=="fs.close(fd, callback)"){
		nodejs++;
		score++;
	}
	if(ans14=="marker interface"){
		java++;
		score++;
	}
	if(ans13=="JVM"){
		java++;
		score++;
	}
	if(ans12=="&"){
		cpp++;
		score++;
	}
	if(ans11=="**"){
		python++;
		score++;
	}
	if(ans10=="container classes"){
		cpp++;
		score++;
	}
	if(ans9=="yes"){
		cpp++;
		score++;
	}
	if(ans8=="decode()"){
		python++;
		score++;
	}
	if(ans7=="set()"){
		python++;
		score++;
	}
	if(ans6=="0"){
		java++;
		score++;
	}
	if(ans5=="$ node --version"){
		nodejs++;
		score++;
	}
	if(ans4=="var http = require(\"http\");"){
		nodejs++;
		score++;
	}
	if(ans3=="git add ."){
		git++;
		score++;
	}
	if(ans2=="git push"){
		git++;
		score++;
	}
	if(ans1=="git clone"){
		git++;
		score++;
	}
	var resString="";
	var percentage_java=(java/3)*100;
	var percentage_cpp=(cpp/3)*100;
	var percentage_nodejs=(nodejs/3)*100;
	var percentage_python=(python/3)*100;
	var percentage_git=(git/3)*100;
	quotient=(score/15)*100;
	if(score>=14){
		resString="Voila! You have got the skills to ace it!";
	}
	else if(score>=12){
		resString="Going good! Just a little more practice!";
	}
	else{
		resString="Oops! You need to work a bit on your skills!";
	}
	res.render('results.ejs',{mydata:req.body.experience,resultdata:output,resultscore:score,feedback:resString,p1:percentage_java,p2:percentage_git,p3:percentage_python,p4:percentage_nodejs,p5:percentage_cpp,sq:quotient});
})

app.get("/profile",function(req,res){
	res.render("profile.ejs",{username: req.body.username});
})

app.post("/profile",function(req,res){
	var use=req.body.username;
	var mail=req.body.email;
	var exo=req.body.experience;
	var ld= req.body.laid;
	var skl= req.body.skills2;
	var newProfile= {username1:use,email:mail,experience: exo, laid:ld,skills2: skl};
	profile.create(newProfile,function(err,newlyCreated){
		if(err){
			console.log(err);
		}
		else{
			res.redirect("/job_search/home");
		}
	})
})
app.post("/form",passport.authenticate("local",{
	successRedirect: "/job_search/home",
	failureRedirect: "/form"
}),function(req,res){
	
});

app.post("/form3",function(req,res){
	var op= req.body.opening;
	var loc= req.body.location1;
	var pay= req.body.pay;
	var ski= req.body.skillreq;
	var expi= req.body.expreq;
	var newPost= {jobRole: op, location: loc, annualPay: pay, skillsRequired: ski, expRequired: expi};
	job.create(newPost,function(err,newlyCreated1){
		if(err){
			console.log(err);
		}
		else{
			res.redirect("/job_search/home");
		}
	})
})

app.get("/apply",function(req,res){
	res.render("apply.ejs");
})

app.post("/form2", function (req, res) {
	// res.render("form2.ejs");
	User.register(new User({username: req.body.username}), req.body.password,function(err,user){
		if(err){
			console.log(err);
			return res.render("form2.ejs");
		}
		passport.authenticate("local")(req,res,function(){
			res.redirect("/job_search/home");
		})
	})
});

app.listen(process.env.PORT, process.env.IP, function(){
	console.log("Server has started!");
})
