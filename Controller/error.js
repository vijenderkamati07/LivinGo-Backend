const path = require('path');
const mainDir = require('../utils/pathUtil');

exports.error = (req, res, next)=>{
  res.render('404',{
    isLoggedIn: req.isLoggedIn,
    user: req.session.user || {},
  });
}