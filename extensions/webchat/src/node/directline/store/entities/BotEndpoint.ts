// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { StatusCodes } from 'http-status-codes';
import axios from 'axios';

import { statusCodeFamily } from '../../utils/helpers';
import { authentication } from '../../utils/constants';

const TIME_TO_REFRESH = 5 * 60 * 1000;

export class BotEndpoint {
  public accessToken?: string;
  public accessTokenExpires?: number;

  constructor(
    public id: string,
    public botId: string,
    public botUrl: string,
    public msaAppId?: string,
    public msaPassword?: string
  ) {}

  public async fetchWithAuth(url: string, reqOptions: { body: any; headers: any }, forceRefresh = false): Promise<any> {
    if (this.msaAppId) {
      reqOptions.headers = {
        ...reqOptions.headers,
        Authorization: `Bearer ${await this.getAccessToken(forceRefresh)}`,
      };
    }
    const response = await axios.post(url, reqOptions.body, {
      headers: reqOptions.headers,
    });

    if (
      (response.status === StatusCodes.UNAUTHORIZED || response.status === StatusCodes.FORBIDDEN) &&
      !forceRefresh &&
      this.msaAppId
    ) {
      return this.fetchWithAuth(url, reqOptions, true);
    }

    return response;
  }

  private async getAccessToken(forceRefresh = false): Promise<string | undefined> {
    if (
      !forceRefresh &&
      this.accessToken &&
      this.accessTokenExpires &&
      Date.now() < this.accessTokenExpires - TIME_TO_REFRESH
    ) {
      return this.accessToken;
    }

    // Refresh access token
    const tokenEndpoint: string = authentication.tokenEndpoint;

    const postData = {
      grant_type: 'client_credentials',
      client_id: this.msaAppId ?? '',
      client_secret: this.msaPassword ?? '',
      scope: `${this.msaAppId}/.default`,
    };

    const resp = await axios({
      method: 'post',
      url: tokenEndpoint,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: new URLSearchParams(postData).toString(),
    });

    if (statusCodeFamily(resp.status, 200)) {
      // Subtract 5 minutes from expires_in so they'll we'll get a
      // new token before it expires.
      const oauthResponse = await resp.data;

      this.accessToken = oauthResponse.access_token;
      this.accessTokenExpires = Date.now() + oauthResponse.expires_in * 1000;

      return this.accessToken;
    } else {
      throw {
        message: 'Refresh access token failed with status code: ' + resp.status,
        status: resp.status,
        body: resp.data,
      };
    }
  }
}
