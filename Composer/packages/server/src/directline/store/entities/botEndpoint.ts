/* eslint-disable @typescript-eslint/camelcase */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import axios, { AxiosResponse } from 'axios';
import formatMessage from 'format-message';
import { DirectLineError } from '@botframework-composer/types';
import { StatusCodes } from 'http-status-codes';

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

  private async getAccessToken(forceRefresh = false): Promise<string | undefined> {
    try {
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

      // Subtract 5 minutes from expires_in so they'll we'll get a new token before it expires.
      const oauthResponse = await resp.data;

      this.accessToken = oauthResponse.access_token;
      this.accessTokenExpires = Date.now() + oauthResponse.expires_in * 1000;

      return this.accessToken;
    } catch (ex) {
      const response: AxiosResponse = ex.response;
      const err: DirectLineError = {
        status: response.status,
        details: response.data.error_description,
        message: formatMessage('An error occured validating the Microsoft App Id and Microsoft App Password.'),
      };
      throw err;
    }
  }

  public async fetchWithAuth(url: string, reqOptions: { body: any; headers: any }, forceRefresh = false): Promise<any> {
    if (this.msaAppId) {
      reqOptions.headers = {
        ...reqOptions.headers,
        Authorization: `Bearer ${await this.getAccessToken(forceRefresh)}`,
      };
    }
    try {
      const response = await axios.post(url, reqOptions.body, {
        headers: reqOptions.headers,
      });
      return response;
    } catch (ex) {
      const response: AxiosResponse = ex.response;
      let err: DirectLineError;
      if (response) {
        err = {
          status: response.status,
          message: formatMessage(`An error occured posting activity to the bot. ${response.statusText}`),
        };
      } else {
        err = {
          status: StatusCodes.NOT_FOUND,
          message: formatMessage(`An error occured posting activity to the bot. ${ex.message}`),
        };
      }

      throw err;
    }
  }
}
