// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';

import { authService } from '../services/auth/auth';
import { useElectronContext } from '../utility/electronContext';
import { isElectron } from '../utility/isElectron';
import logger from '../logger';

const log = logger.extend('auth-controller');

type GetAccessTokenRequest = Request & {
  query: {
    // used for OAuth flow (web)
    clientId?: string;
    // used for OAuth flow (web)
    scopes: string;
    // used for native flow (electron)
    targetResource?: string;
  };
};

type GetARMTokenForTenantRequest = Request & {
  query: {
    tenantId: string;
  };
};

async function getAccessToken(req: GetAccessTokenRequest, res: Response) {
  const { clientId, targetResource, scopes = '[]' } = req.query;
  if (isElectron && !targetResource) {
    return res
      .status(400)
      .send('Must pass a "targetResource" parameter to perform authentication in Electron environment.');
  }
  if (!isElectron && !clientId) {
    return res.status(400).send('Must pass a "clientId" parameter to perform authentication in a Web environment.');
  }
  const parsedScopes: string[] = JSON.parse(scopes);

  const accessToken = await authService.getAccessToken({ clientId, targetResource, scopes: parsedScopes });
  res.status(200).json({
    accessToken,
  });
}

function logOut(req, res) {
  try {
    authService.logOut();
    res.status(200).end();
  } catch (e) {
    log('Error logging out:');
    log(e);
    res.status(500).json(e);
  }
}

async function getTenants(req: Request, res: Response) {
  try {
    const { getTenants } = useElectronContext();
    const tenants = await getTenants();
    res.status(200).json({ tenants });
  } catch (e) {
    return res.status(500).json(e);
  }
}

async function getARMTokenForTenant(req: GetARMTokenForTenantRequest, res: Response) {
  try {
    const { tenantId } = req.query;
    const { getARMTokenForTenant } = useElectronContext();
    const accessToken = await getARMTokenForTenant(tenantId);
    res.status(200).json({ accessToken });
  } catch (e) {
    return res.status(500).json(e);
  }
}

async function getAccount(req: Request, res: Response) {
  try {
    const { getAccount } = useElectronContext();
    const account = getAccount();
    res.status(200).json({ account });
  } catch (e) {
    return res.status(500).json(e);
  }
}

// NOTE: only for the PVA 2 demo
async function getDemoToken(req: Request, res: Response) {
  res.status(200).send(process.env.PVA_DEMO_TOKEN || '');
}

export const AuthController = {
  getAccessToken,
  getTenants,
  getAccount,
  getARMTokenForTenant,
  logOut,
  getDemoToken,
};
