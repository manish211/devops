

var myTimer = req.url.setTimeout(500,function() {
    document.getElementById('output').innerHTML += ('timeout!');
});

document.getElementById('output').innerHTML += ('first ...');

document.getElementById('output').innerHTML += ('second ...');