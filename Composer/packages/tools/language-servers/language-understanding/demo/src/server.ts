import { attachLSPServer } from '../../src/startServer';
import * as express from 'express';

// create the express application
const app = express();
// server the static content, i.e. index.html
app.use(express.static(__dirname));
// start the server
const server = app.listen(5000);

attachLSPServer(server, '/luServer');
