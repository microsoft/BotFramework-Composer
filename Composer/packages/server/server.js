var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var fileServerRouter = require('./router/fileServer');
var launcherServerRouter = require('./router/launcherServer');
const app = express();

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/api/fileserver', fileServerRouter);
app.use('/api/launcher', launcherServerRouter);

app.listen(process.env.PORT || 5000, () => {
    console.log('Server running');
});