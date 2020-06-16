// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// import { interactiveLogin } from '@azure/ms-rest-nodeauth';
// import axios from 'axios';

import { getLoginUrl } from './config';
console.log('azure login plugin');

// set authentication
const setAuthentication = async (req, res, next) => {
  console.log(req.body);
  res.status(200);
};
const verification = async (req, res, next) => {
  const { accessToken } = req.body;
  if (!accessToken) {
    console.log('need authentication');
    // res.redirect(getLoginUrl());
    res.status(400).json({
      statusCode: '400',
      message: 'need authentication',
      redirectUri: getLoginUrl(),
    });
  } else {
    // authentication
    console.log(accessToken);
    // next();
    res.status(200);
  }
};

export default async (composer: any): Promise<void> => {
  composer.addWebRoute('post', '/api/publish/subscriptions', verification);
  composer.addWebRoute('get', '/api/azure/auth/callback', setAuthentication);
  composer.addWebRoute('post', '/api/azure/auth/callback', setAuthentication);
  composer.addWebRoute('get', '/azure/login', setAuthentication);
  composer.addWebRoute('post', '/azure/login', setAuthentication);
};
