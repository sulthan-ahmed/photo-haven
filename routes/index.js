var express = require('express');
var router = express.Router();
var token = null;
var imageURLs = [];

var ig = require('instagram-node').instagram();

var title = 'photoMadness';

// for local host uncomment the following two lines
var redirect_uri = 'http://localhost:4000/authentication';
ig.use({client_id: '434a32be478d4b868bdc8ad286f52a42',client_secret: '3da1450d3e15463599b084a7491b91a0'});

//for heroku hosting on https://fierce-garden-8249.herokuapp.com/ uncomment the following two lines
//var redirect_uri = 'https://fierce-garden-8249.herokuapp.com/authentication';
//ig.use({client_id: '37263e18e75949b791bd44c6e3080896',client_secret: 'e813473778a04f42855bd00ae7a3a8d0'});


/* GET home page. */
router.get('/', function(req, res) {
    res.redirect('/index');
});

router.get('/index', function(req, res) {
    if (!token) {
        res.render('index', {
            title: title,
            isAuthenticated: false
        });
    } else {
        res.render('index', {
            title: title,
            isAuthenticated: true,
            imageURLs: imageURLs,
            searchError: req.query.searchError
        });
    }
});

// Authentication Step 1 of 2
// use instagram-node library to initiate authorisation process
router.get('/authorize_user', function(req, res) {
    console.log('trying to authorise the client');
    res.redirect(ig.get_authorization_url(redirect_uri));
});

// Authentication Step 2
// This is your redirect URI and produces the necessary authentication token
router.get('/authentication', function(req, res) {
    console.log('trying to handle the authentication token');
    ig.authorize_user(req.query.code, redirect_uri, function(err, result) {
        if (err) {
            console.log('Authentication FAILED');
            console.log(err.body);
            res.redirect('/error?source=authentication');
        } else {
            token = result.access_token;
            console.log('--------------- Authentication SUCCESS ----------------');
            res.redirect('/index');
        }
    });
});

// Searching using the npm library to use the following instagram API endpoint
//https://api.instagram.com/v1/tags/{tag-name}/media/recent?access_token={ACCESS-TOKEN}?count={number-of-items}

router.get('/search', function(req, res) {
    imageURLs = [];
    if (!token) {
        res.redirect('/index');
    } else {
        var searchTag = req.query.searchTag.replace(" ", "");
        var quantity = req.query.quantity;
        console.log("--------- search parameters are: "+searchTag+"; quantity: "+quantity);

        ig.tag_media_recent(searchTag, {count: quantity}, function(err, medias, pagination, remaining, limit) {
            if (err) {
                console.log('---------------- search error --------------');
                console.log(err);
                res.redirect('/index?searchError='+searchTag);
                //res.redirect('/error?source=search');
            } else {
                imageURLs = extractedImageURLs(medias);
                console.log('---------------- search completed --------------');
                res.redirect('/display?searchTag='+ searchTag);
            }
        });
    }
});


// Display the urls that have been extracted from the search result
router.get('/display', function(req, res) {
    res.render('display', {
        title: title,
        imageURLs: imageURLs,
        searchTag: req.query.searchTag
    });
});

// function to extract standard_resolution urls from search results;
function extractedImageURLs(medias) {
    //console.log('handling response json');
    //console.log(medias);
    var imageURLs = [];
    for (var i=0; i<medias.length; i++) {
        imageURLs[i] = {"url": medias[i].images.standard_resolution.url}
    }
    return imageURLs;
}

// error page
router.get('/error', function(req, res) {
    res.render('error',
        {title: title,
            message: req.query.source});
});

module.exports = router;


