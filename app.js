require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

const url = "mongodb://localhost:27017/secretDB"

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));


mongoose.connect(url, {useNewUrlParser:true, useUnifiedTopology:true});

const userSchema = new mongoose.Schema({
   email:String,
   password:String
});


userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});

const User = mongoose.model("User", userSchema);

app.get("/", (req,res) => {
    res.render("home");
});

app.get("/login", (req,res) => {
    res.render("login");
});

app.get("/register", (req,res) => {
    res.render("register");
});

app.post("/register", (req,res) =>{
    const newUser = new User({
        email:req.body.username,
        password:req.body.password
    });
newUser.save(err =>{
    if(err) throw err;
    res.render("secrets");
});
});

app.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

User.findOne({email: username}, (err, foundUser) => {
if(err) {
    console.log(err);
}else{
    if(foundUser){
        if(foundUser.password === password){
            res.render('secrets');
        }else{
            console.log("password or username is incorrect");
        }
    }
}
});
});



app.listen(3000, () => {
    console.log("server started");
});