// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IBotProject } from '@botframework-composer/types';

export type PublishConfig = {
  accessToken: string;
  name: string;
  environment: string;
  hostname?: string;
  luisResource?: string;
  profileName: string;
  project: IBotProject;
  subscriptionID: string;

  // These are defined as any from the PublishPlugin interface
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  absSettings?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metdata: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  runtime: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings: any;

  [key: string]: any;
};

export const publish = (config: PublishConfig) => {
  steps.push(createLinkBotToAppStep());
};

// if (absSettings.resourceId) {
//   try {
//     if (!subscriptionId) {
//       subscriptionId = absSettings.resourceId.match(/subscriptions\/([\w-]*)\//)[1];
//     }
//     if (!resourceGroupName) {
//       resourceGroupName = absSettings.resourceId.match(/resourceGroups\/([^/]*)/)[1];
//     }
//     if (!botName) {
//       botName = absSettings.resourceId.match(/botServices\/([^/]*)/)[1];
//     }
//   } catch (error) {
//     this.logger({
//       status: BotProjectDeployLoggerType.DEPLOY_INFO,
//       message: 'Abs settings resourceId is incomplete, skip linking bot with webapp ...',
//     });
//     return;
//   }
// } else {
//   subscriptionId = settings.subscriptionId;
//   resourceGroupName = settings.resourceGroup;
//   botName = settings.botName;
// }
