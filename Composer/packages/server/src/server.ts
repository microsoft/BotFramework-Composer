import 'dotenv/config';
import path from 'path';

import express, { Express, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import { getAuthProvider } from './router/auth';
import { apiRouter } from './router/api';
import { BASEURL } from './constants';

const app: Express = express();

const { login, authorize } = getAuthProvider();

const CS_POLICIES = [
  "default-src 'none';",
  "script-src 'self';",
  "style-src 'self' 'unsafe-inline';",
  "font-src 'self' https:;",
  "img-src 'self' data:;",
  "base-uri 'none';",
  "connect-src 'self';",
  "frame-src 'self';",
  "worker-src 'self';",
  "form-action 'none';",
  "frame-ancestors 'self';",
  "manifest-src 'self';",
  'upgrade-insecure-requests;',
];

app.all('*', function(req: Request, res: Response, next: NextFunction) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_CSP === 'true') {
    res.header('Content-Security-Policy', CS_POLICIES.join(' '));
  }

  next();
});

app.use(`${BASEURL}/`, express.static(path.join(__dirname, './public')));
app.use(morgan('dev'));

app.use(bodyParser({ limit: '50mb' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get(`${BASEURL}/test`, function(req: Request, res: Response) {
  res.send('fortest');
});

// only register the login route if the auth provider defines one
if (login) {
  app.get(`${BASEURL}/api/login`, login);
} else {
  // register the route so that client that requires_auth knows not try repeatedly
  app.get(`${BASEURL}/api/login`, (req, res) => {
    res.redirect(`${BASEURL}#error=${encodeURIComponent('NoSupport')}`);
  });
}

// always authorize all api routes, it will be a no-op if no auth provider set
app.use(`${BASEURL}/api`, authorize, apiRouter);

app.use(function(err: Error, req: Request, res: Response, _next: NextFunction) {
  if (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

app.get('*', function(req, res, _next) {
  res.sendFile(path.resolve(__dirname, './public/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${port}`);
});
