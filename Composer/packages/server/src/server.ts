import path from 'path';

import express, { Express, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import { apiRouter } from './router/api';

const app: Express = express();

const BASEURL = (process.env.PUBLIC_URL || '').replace(/\/$/, '');

app.all('*', function(req: Request, res: Response, next: NextFunction) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

app.use(`${BASEURL}/static`, express.static(path.join(__dirname, './public/static')));
app.use(`${BASEURL}/extensionContainer.html`, express.static(path.join(__dirname, './public/extensionContainer.html')));
app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get(`${BASEURL}/test`, function(req: Request, res: Response) {
  res.send('fortest');
});

app.use(`${BASEURL}/api`, apiRouter);

app.get('*', function(req, res, next) {
  res.sendFile(path.resolve(__dirname, './public/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${port}`);
});
