//imports
var express = require('express');
var routes = require('./routes/index');
var path = require('path');

var app = express();

//use the provided PORT or 4000
app.set('port', process.env.PORT || 4000);

// set up view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

app.use('/', routes);

//Express adds middleware when you use app.use
//catch 404 issues
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(404);
});

app.use(function (err, req, res, next){
    console.error(err.stack);
    res.status(500);
});

app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.' );
});