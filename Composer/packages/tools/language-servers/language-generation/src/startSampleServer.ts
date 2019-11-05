import { attachLSPServer } from './attachWSToHTTPServer';
import express from 'express';

export function startSampleServer() {
  // create the express application
  const app = express();
  // server the static content, i.e. index.html
  app.use(express.static(__dirname));
  // start the server
  const server = app.listen(5002);

  attachLSPServer(server, '/lgServer');
}
