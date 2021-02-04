const express = require("express");
const bodyParser = require("body-parser");
const MongoClient = require('mongodb');
const {createToken} = require("./services/authServices")
const cookieParser = require('cookie-parser')
const authMiddleWare = require("./services/authMiddleware")
require("dotenv").config();
const cors = require('cors')
const app = express();
const url = process.env.MONGO_URL;


app.use(cors())
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.json())
app.options('/addNew', cors())
app.options('/login', cors())
app.options('/home', cors())
app.options('/home/:id', cors())

.get("/", (req, res)=>{ 
    res.send("S")
})

.get("/users", (req, res)=>{  
    MongoClient.connect(url, function(err, db) {
    if (err) console.log(err);
    var dbo = db.db("pinterest");
    dbo.collection("users").findOne({}, function(err, result) {
        if (err) console.log(err);
        console.log(result);
        res.send("Success") 
        db.close();
    });
    });
})


.post("/addNew", cors(), (req,res)=>{
    MongoClient.connect(url, function(err, db) {
    if (err) throw Error
    var dbo = db.db("pinterest");
    var myobj = {firstname:req.body.firstname,lastname:req.body.lastname, email:req.body.email, password:req.body.password, age:req.body.age};
    var query = { email: req.body.email }
    dbo.collection("users").find(query).toArray(function(err, result){
    if (err) throw Error
    if(result.length===0){
    dbo.collection("users").insertOne(myobj, function(err) {
        if (err) throw Error
        res.json(req.body);
        db.close();
    });
    }else{
        res.send("Failure")
    }
    });
 });
})

.post("/addPin", authMiddleWare, cors(), (req,res)=>{
    MongoClient.connect(url, function(err, db) {
    if (err) throw Error
    var dbo = db.db("pinterest");
    var myobj = {img:req.body.img, title:req.body.title, author:req.body.author};
    var query = { email: req.body.author}
    dbo.collection("users").find(query).toArray(function(err, result){
    if (err) throw Error
    if(result.length>0){
    dbo.collection("pins").insertOne(myobj, function(err) {
        if (err) throw Error
        res.json(req.body);
        db.close();
    });
    }else{
        res.send("Failure")
    }
    });
 });
})

.post("/login", cors(), (req, res)=>{                    // match the username and password
    MongoClient.connect(url || process.env.MONGODB_URI, { useUnifiedTopology: true }, function(err, db) {
            if (err) throw Error
            var dbo = db.db("pinterest");
            var myquery = { email: req.body.email, password: req.body.password};
            dbo.collection("users").find(myquery).toArray(function(err, result) {
               if (err) throw Error
                if(result.length === 0 ){
                    res.send("Failed")
                }else{ 
                   res.json(req.body);
                   const token =  createToken(req.body.email)  // creating a jwt token for logged in session
                    res.cookie("jwt", token,{                 //creating cookie to store the token         
                        maxAge: 100000000000,
                        httpOnly: false,
                        secure: false
                    })
                }
                db.close(); 
            });
    });
})

.get("/home/:id", authMiddleWare, cors(), (req, res)=>{  
    MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("pinterest");
    var query = { email: req.params.id };
    dbo.collection("users").find(query).toArray(function(err, result) {
        if (err) throw err;
        res.send(result) 
        db.close();
    });
    });
})

.put("/home/:id", authMiddleWare, cors(), (req, res)=>{  
    MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("pinterest");
    var query = { author: req.params.id };
    dbo.collection("pins").find(query).toArray(function(err, result) {
        if (err) throw err;
        res.send(result) 
        db.close();
    });
    });
})

.get("/home", authMiddleWare, cors(), (req, res)=>{  
    MongoClient.connect(url, function(err, db) {
    if (err) throw Error;
    var dbo = db.db("pinterest");
    dbo.collection("pins").find({}).toArray(function(err, result) {
        if (err) throw Error
        res.send(result) 
        db.close();
    });
    });
})

.listen(process.env.PORT || 8000);

