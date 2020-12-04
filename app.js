require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose =  require('passport-local-mongoose');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
// const encrypt = require('mongoose-encryption');
// const md5 = require('md5');

const app = express();

const url = "mongodb://localhost:27017/secretDB"

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));

app.use(session({
    secret: 'It is a secret',
    resave: false,
    saveUninitialized: true,
  }));
  
app.use(passport.initialize());
app.use(passport.session());


mongoose.connect(url, {useNewUrlParser:true, useUnifiedTopology:true, useCreateIndex:true});

const userSchema = new mongoose.Schema({
   email:String,
   password:String
});

userSchema.plugin(passportLocalMongoose);

// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", (req,res) => {
    res.render("home");
});

app.get("/login", (req,res) => {
    res.render("login");
});

app.get("/register", (req,res) => {
    res.render("register");
});

app.get("/secrets", (req,res) => {
    if(req.isAuthenticated()){
res.render('secrets');
    }else{
        res.redirect("/login");
    }
});


app.post("/register", (req,res) =>{
User.register({username:req.body.username}, req.body.password, (err,user) =>{
    if(err){
        console.log(err);
        res.redirect("/register");
    }else{
        passport.authenticate('local')(req,res, function(){
            res.redirect("/secrets");
        });
        }

});
});

app.post("/login", (req,res) => {
 const user = new User({
     username:req.body.username,
     password:req.body.password
 });

req.login(user, function(err){
    if(err){
        console.log(err);
    }else{
passport.authenticate('local')(req,res, function(){
    res.redirect("/secrets");
});
}
});

});


app.get("/logout", (req,res) =>{
    req.logout();
    res.redirect("/");
});

app.listen(3000, () => {
    console.log("server started");
});