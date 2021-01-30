const express = require("express");
const bodyParser = require("body-parser");
const MongoClient = require('mongodb');
// const nodemailer = require('nodemailer'); 
// let randomstring = require("randomstring");
const cookieParser = require('cookie-parser')
require("dotenv").config();

const app = express();
const url = process.env.MONGO_URL;
const url1 = process.env.MONGO_URL1;
const password = process.env.MAILPASSWORD;
let random = "";
let activationString = "";

// mongoose.connect(url1 || process.env.MONGODB_URI1, { useUnifiedTopology: true }, { useNewUrlParser: true })

// MongoClient.connect(url || process.env.MONGODB_URI, { useUnifiedTopology: true }, function(err, db) {
//     if (err) throw err;
//     var dbo = db.db("pinterest");
//     var query = { activationTimer: { $lt: Date.now() }, activationString: { $ne: "Activated" } };
//     dbo.collection("Userdata").deleteMany(query)
// });



app.use(cookieParser())
app
.use(bodyParser.urlencoded({extended: true}))


.get("/", (req, res)=>{                                       //Login page                                                                          
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

.get("/addNew",(req,res)=>{
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

.listen(8000);

