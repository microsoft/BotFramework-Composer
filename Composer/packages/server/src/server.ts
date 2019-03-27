import express, { Express } from 'express';
import bodyParser from 'body-parser';

import { fileServerRouter } from './router/fileServer';
import { launcherServerRouter } from './router/launcherServer';
import { storagesServerRouter } from './router/storageServer';
import { projectsServerRouter } from './router/projectServer';
const app: Express = express();

app.all('*', function(req: any, res: any, next: any) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req: any, res: any) {
  res.send('fortest');
});

app.use('/api/fileserver', fileServerRouter);
app.use('/api/launcher', launcherServerRouter);
app.use('/api/storages', storagesServerRouter);
app.use('/api/projects', projectsServerRouter);

app.listen(process.env.PORT || 5000, () => {
  console.log('Server running');
});
