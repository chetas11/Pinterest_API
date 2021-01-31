const express = require("express");
const bodyParser = require("body-parser");
const MongoClient = require('mongodb');
const cookieParser = require('cookie-parser')
require("dotenv").config();
const cors = require('cors')
const app = express();
const url = process.env.MONGO_URL;


app.use(cors())
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}))
app.options('/addNew', cors())

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


.post("/addNew", cors(), (req,res)=>{
    console.log(req.body)
    MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("pinterest");
    var myobj = { email:req.body, password:"req.body", age:"req.body"  };
    dbo.collection("users").insertOne(myobj, function(err) {
        if (err) throw err;
        res.send("1 document inserted");
        db.close();
    });
 });
})    

.listen(process.env.PORT || 8000);

