const express = require("express");
const bodyParser = require("body-parser");
const MongoClient = require('mongodb');
const cookieParser = require('cookie-parser')
require("dotenv").config();
const cors = require('cors')

const app = express();
const url = process.env.MONGO_URL;

app.use(cookieParser())
app
.use(bodyParser.urlencoded({extended: true}))
.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})
app.use(cors())
.get("/", (req, res)=>{ 
    res.send("S")
})

.get("/users", (req, res)=>{  
    MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("pinterest");
    dbo.collection("users").findOne({}, function(err, result) {
        if (err) throw err;
        console.log(result);
        res.send("Success") 
        db.close();
    });
    });
})


.post("/addNew",(req,res)=>{
    MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("pinterest");
    var myobj = { email:"req.body", password:"req.body", age:"req.body"  };
    dbo.collection("users").insertOne(myobj, function(err, res) {
        if (err) throw err;
        res.send("1 document inserted");
        db.close();
    });
 });
})    

.listen(process.env.PORT || 8000);

