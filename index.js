const express = require("express");
const bodyParser = require("body-parser");
const MongoClient = require('mongodb');
const cookieParser = require('cookie-parser')
require("dotenv").config();
const cors = require('cors')
const nodemailer = require('nodemailer')
const { google } = require('googleapis')
let randomstring = require("randomstring");
let activationString =""

const app = express();
const url = process.env.MONGO_URL;
const CLEINT_ID = process.env.CLEINT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const REFRESH_TOKEN =  process.env.REFRESH_TOKEN
const oAuth2Client = new google.auth.OAuth2(CLEINT_ID, CLIENT_SECRET, REDIRECT_URI)
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN})

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
    activationString = randomstring.generate();
    MongoClient.connect(url, function(err, db) {
    if (err) throw Error
    var dbo = db.db("pinterest");
    var myobj = {firstname:req.body.firstname,lastname:req.body.lastname, email:req.body.email, password:req.body.password, age:req.body.age, activationTimer:Date.now() + 600000, activationString: activationString};
    var query = { email: req.body.email }
    dbo.collection("users").find(query).toArray(function(err, result){
    if (err) throw Error
    if(result.length===0){
    dbo.collection("users").insertOne(myobj, function(err) {
        if (err) throw Error
        res.json(req.body);
        db.close();
    async function sendMail(){
    try{
        const accessToken = await oAuth2Client.getAccessToken()
        const transport  = nodemailer.createTransport({
            service:'gmail',
            auth:{
                type: 'OAuth2',
                user:'crmconfirmation.noreply@gmail.com',
                clientId: CLEINT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken:accessToken
            }
        })

        const mailOptions = {
        from:'Account Verification<crmconfirmation.noreply@gmail.com>',
        to:req.body.email,
        subject:'Account verification',
        text:'Hello, '+ req.body.email + '\n\n'+
                    'You are receiving this because you (or someone else) have requested sign up for Pinterest Service.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/activate/' + activationString + '\n\n' +
                    'If you did not request this, please ignore this email.\n'
    }

        const result =  await transport.sendMail(mailOptions)
        return result

        }catch(e){
            return e
        }
    }
    sendMail().then(result => console.log(result))
    });
    }else{
        res.send("Failure")
    }
    });
 });
})

.post("/addPin", cors(), (req,res)=>{
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
            var myquery = { email: req.body.email, password: req.body.password, activationString:"Activated"};
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

.get("/home/:id", cors(), (req, res)=>{  
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

.put("/home/:id", cors(), (req, res)=>{  
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

.get("/home", cors(), (req, res)=>{  
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

.get('/activate/:token', function(req, res) {             
    MongoClient.connect(url || process.env.MONGODB_URI, { useUnifiedTopology: true }, function(err, db) {
            if (err) throw err;
            var dbo = db.db("pinterest");
            var query = { activationString : req.params.token, activationTimer: { $gt: Date.now() } };
            var myquery = { $set: {activationString: "Activated"} };
            dbo.collection("users").find(query).toArray(function(err, result) {
                if(result.length > 0){
                    dbo.collection("users").updateOne(query, myquery, function(err, res) {
                        res.send("Success")
                        if (err) throw err;
                        db.close();
                    });
                }else{
                    res.send("Failed")           
                }
            });
        });
})

.listen(process.env.PORT || 8000);

