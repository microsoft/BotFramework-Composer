// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

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
