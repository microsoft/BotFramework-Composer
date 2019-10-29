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
declare namespace SelfHostCommands {
  export interface ARGV {
    user: string;
    userEmail?: string;
    env: 'production' | 'integration';
    dest: string;
    accessToken: string | undefined;
    botId: string | undefined;
  }
  export interface Build {
    (argv: ARGV): Promise<string>;
  }
  export interface GetPublishHistoryARGV {
    dest: string;
  }
  export interface IPublishVersion {
    buildTimestamp: Date;
    publishTimestamp: Date;
    user: string;
    userEmail: string;
    label: string;
  }
  export interface IPublishHistory {
    production: IPublishVersion;
    previousProduction: IPublishVersion | undefined;
    integration: IPublishVersion;
  }
  export interface GetPublishHistory {
    (argv: GetPublishHistoryARGV): Promise<IPublishHistory>;
  }
  export interface EditingStatusARGV {
    dest: string;
  }
  export interface IEditingStatus {
    hasChanges: boolean;
  }
  export interface GetEditingStatus {
    (argv: EditingStatusARGV): Promise<IEditingStatus>;
  }
  export interface PublishARGV {
    user: string;
    userEmail: string | undefined;
    dest: string;
    label: string | undefined;
    accessToken: string | undefined;
    botId: string | undefined;
  }
  export interface Publish {
    (argv: PublishARGV): Promise<string>;
  }
}
