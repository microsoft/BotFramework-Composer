// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { attachLSPServer } from '../../src/attachWSToHTTPServer';

const express = require('express');

// create the express application
const app = express();
// server the static content, i.e. index.html
app.use(express.static(__dirname));
// start the server
const server = app.listen(5002);

attachLSPServer(server, '/lgServer');
