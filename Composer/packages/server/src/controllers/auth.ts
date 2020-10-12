import { Request, Response } from 'express';
import { authService } from '../services/auth';

type GetAccessTokenRequest = Request & {
  query: {
    clientId: string;
    scopes: string;
  };
};

async function getAccessToken(req: GetAccessTokenRequest, res: Response) {
  const { clientId, scopes } = req.query;
  if (!clientId || !scopes) {
    // bad request 400
    return res.status(400).send();
  }
  const parsedScopes: string[] = JSON.parse(scopes);

  const accessToken = await authService.getAccessToken({ clientId, scopes: parsedScopes });

  res.status(200).json({
    accessToken,
  });
}

export const AuthController = {
  getAccessToken,
};
