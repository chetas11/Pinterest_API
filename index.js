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
app.options('/login', cors())

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

.post("/login", cors(), (req, res)=>{                    // match the username and password
    MongoClient.connect(url || process.env.MONGODB_URI, { useUnifiedTopology: true }, function(err, db) {
            if (err) throw err;
            var dbo = db.db("pinterest");
            var myquery = { email: req.body.email, password: req.body.password};
            dbo.collection("users").find(myquery).toArray(function(err, result) {
                if (err) throw err;
                if(result.length === 0 ){
                    res.send("failed")
                }else{ 
                    res.send("success")
                    // const token =  createToken(req.body.email)  // creating a jwt token for logged in session
                    // res.cookie("jwt", token,{      //creating cookie to store the token         
                    //     maxAge: 100000000000,
                    //     httpOnly: false,
                    //     secure: false
                    // });
                    // res.redirect("/home")
                }
                res.json(req.body);
                db.close();
            });
    });
})

.listen(process.env.PORT || 8000);

