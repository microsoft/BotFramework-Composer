/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import { ClaimNames } from '../../constants';
import { ILuisConfig } from '../bot/interface';

export enum BotStatus {
  NotConnected,
  Connected,
}

export type BotEnvironments = 'production' | 'integration' | 'editing';

export interface AuthenticatedToken {
  accessToken: string;
  decodedToken?: AuthenticatedUser;
}

export interface AuthenticatedUser {
  [ClaimNames.name]: string;
  [ClaimNames.upn]: string;
}

export interface BotConfig {
  MicrosoftAppId: string;
  MicrosoftAppPassword: string;
  luis: ILuisConfig;
  targetEnvironment?: BotEnvironments;
  user?: AuthenticatedToken;
}

export interface IPublishVersion {
  buildTimestamp: Date;
  publishTimestamp: Date;
  user: string;
  userEmail: string;
  label: string;
}

export interface IPublishHistory {
  production: IPublishVersion | undefined;
  previousProduction: IPublishVersion | undefined;
  integration: IPublishVersion | undefined;
}

export interface IBotConnector {
  status: BotStatus;
  connect(environment: BotEnvironments, hostName: string): Promise<string>; // connect to a bot return the bot endpoint
  sync(config: BotConfig): Promise<void>; // sync content with bot
  // publishes a build to production, if label is undefined then what is currently in integration is published
  publish(config: BotConfig, label: string): Promise<void>;
  getEditingStatus(): Promise<boolean>; // gets whether the editor has unsaved changes
  getPublishHistory(): Promise<IPublishHistory>; // gets a list of builds that are in production, inttegration, or can be published
}
