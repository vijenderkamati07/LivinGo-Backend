const path = require('path');
const mainDir = require('../utils/pathUtil');

exports.error = (req, res, next)=>{
  res.status(404).json({"message": "page not found"});
}