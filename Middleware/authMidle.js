const jwt = require("jsonwebtoken");
const dotenev = require("dotenv").config();

exports.isAuth = (req, res, next)=>{
  const token = req.cookies?.token;

  if(!token){
    return res.status(401).json({message: "Not authenticated"});
  }

  try{
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    next();
  }catch(e){
    return res.status(401).json({message: "Invalid Token"});
  }
};