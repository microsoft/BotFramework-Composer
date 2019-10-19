import 'dotenv/config';
import path from 'path';
import crypto from 'crypto';

import express, { Express, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import { getAuthProvider } from './router/auth';
import { apiRouter } from './router/api';
import { BASEURL } from './constants';

const app: Express = express();
app.set('view engine', 'ejs');
app.set('view options', { delimiter: '?' });

const { login, authorize } = getAuthProvider();

const CS_POLICIES = [
  "default-src 'none';",
  "font-src 'self' https:;",
  "img-src 'self' data:;",
  "base-uri 'none';",
  "connect-src 'self';",
  "frame-src 'self' bfemulator:;",
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
    req.__nonce__ = crypto.randomBytes(16).toString('base64');
    res.header(
      'Content-Security-Policy',
      CS_POLICIES.concat([
        `script-src 'self' 'nonce-${req.__nonce__}';`,
        // TODO: use nonce strategy after addressing issues with monaco-editor pacakge
        "style-src 'self' 'unsafe-inline'",
        // `style-src 'self' 'nonce-${req.__nonce__}';`,
      ]).join(' ')
    );
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

app.get(`${BASEURL}/extensionContainer.html`, function(req, res) {
  res.render(path.resolve(__dirname, './public/extensionContainer.ejs'), { __nonce__: req.__nonce__ });
});

app.get('*', function(req, res) {
  res.render(path.resolve(__dirname, './public/index.ejs'), { __nonce__: req.__nonce__ });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${port}`);
});
