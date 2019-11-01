'use strict';
exports.__esModule = true;
var lg_lsp_server_1 = require('lg-lsp-server');
var express = require('express');
// create the express application
var app = express();
// server the static content, i.e. index.html
app.use(express.static(__dirname));
// start the server
var server = app.listen(5000);
lg_lsp_server_1.attachLSPServer(server, '/lgServer');
