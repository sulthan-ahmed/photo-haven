var express = require('express');
var router = express.Router();

// Get the homepage
router.get('/', function(req, res){
    res.redirect('/index');
});