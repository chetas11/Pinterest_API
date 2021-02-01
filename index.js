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
    var myobj = {email:req.body.email, password:req.body.password, age:req.body.age};
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
                }
                db.close(); 
            });
    });
})

.get("/add", (req, res)=>{  
    MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("pinterest");
    var myobj = [
     {
    img: 'https://www.carlisleaccessories.com.au/media/wysiwyg/Media/Hats2020.jpg',
    title: 'Breakfast',
    author: 'jill111',
    cols: 1,
    featured: true,
  },
  {
    img: 'https://www.poynter.org/wp-content/uploads/2019/07/shutterstock_264132746.jpg',
    title: 'Tasty burger',
    author: 'director90',
  },
  {
    img: 'https://bestmedicinenews.org/wp-content/uploads/best-burger-ever-696x522.jpg',
    title: 'Camera',
    author: 'Danson67',
  },
  ];
  dbo.collection("pins").insertMany(myobj, function(err, res) {
    if (err) throw err;
    console.log("Number of documents inserted: " + res.insertedCount);
    db.close();
    });
    }); 
})

.listen(process.env.PORT || 8000);

