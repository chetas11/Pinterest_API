const express = require("express");
const bodyParser = require("body-parser");
const MongoClient = require('mongodb');
const cookieParser = require('cookie-parser')
require("dotenv").config();

const app = express();
const url = process.env.MONGO_URL;

app.use(cookieParser())
app
.use(bodyParser.urlencoded({extended: true}))

.get("/", (req, res)=>{ 
    res.header("Access-Control-Allow-Origin","*");                                     //Login page                                                                          
    res.send("S")
})

.get("/users", (req, res)=>{  
    res.header("Access-Control-Allow-Origin","*");                                      //Login page                                                                          
    MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("pinterest");
    dbo.collection("users").find({}, function(err, result) {
        if (err) throw err;
        console.log(result);
        res.send("Success") 
        db.close();
    });
    });
})

.get("/addNew",(req,res)=>{
    res.header("Access-Control-Allow-Origin","*"); 
    MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("pinterest");
    var myobj = { email: req.body.email, password: req.body.password, age:req.body.age  };
    dbo.collection("users").insertOne(myobj, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");
        db.close();
    });
 });
})    

.listen(process.env.PORT);

