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
app.use(express.json())
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
    MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("pinterest");
    var myobj = {email:req.body.email, password:req.body.password, age:req.body.age};
    var query = { email: req.body.email }
    dbo.collection("users").find(query).toArray(function(err, result){
    if(result.length===0){
    dbo.collection("users").insertOne(myobj, function(err) {
        if (err) throw err;
        res.json(req.body);
        db.close();
    });
    }else{
        throw Error
    }
    });
 });
})    

.listen(process.env.PORT || 8000);

