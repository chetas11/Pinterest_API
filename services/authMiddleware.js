const {validateToken} = require("../services/authServices");

//Validating the user token

const authMiddleware = (req, res, next)=>{
    if(validateToken(req.cookies.jwt)){
        next();
    }else{
        res.send("unauthorised")
    }
};

module.exports = authMiddleware