// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* This is a mock publishing endpoint that supports the basic features of a real remote publishing endpoint:
 *   - multiple profile can be configured to publish to this per bot
 *   - history will be maintained for each project/profile
 *   - status will initially be 202 to indicate in progress, will update after 10 seconds to 200
 */

import { v4 as uuid } from 'uuid';
import { ComposerPluginRegistration, PublishResponse, PublishPlugin, JSONSchema7 } from '@bfc/plugin-loader';

import schema from './schema';

interface LocalPublishData {
  [profileName: string]: PublishResponse[];
}

interface PublishConfig {
  name: string;
  settings: any;
}

class LocalPublisher implements PublishPlugin<PublishConfig> {
  private data: { [botId: string]: LocalPublishData };
  private composer: ComposerPluginRegistration;
  public schema: JSONSchema7;
  constructor(composer: ComposerPluginRegistration) {
    this.data = {};
    this.composer = composer;
    this.schema = schema;
  }

  private finishPublish = async (botId: string, profileName: string, jobId: string) => {
    setTimeout(() => {
      this.data[botId][profileName].forEach((element) => {
        if (element.result.id == jobId && element.status !== 500) {
          element.status = 200;
          element.result.message = 'Success';
          element.result.log = element.result.log + '\nPublish succeeded!';
        }
      });
    }, 5000);
  };

  // config include botId and version, project is content(ComposerDialogs)
  publish = async (config: PublishConfig, project, metadata) => {
    const profileName = config.name;

    if (!this.data[project.id]) {
      this.data[project.id] = {};
    }
    if (!this.data[project.id][profileName]) {
      this.data[project.id][profileName] = [];
    }

    const response = {
      status: 202,
      result: {
        time: new Date(),
        message: 'Accepted for publishing.',
        log: 'Publish starting...',
        id: uuid(),
        comment: metadata.comment,
      },
    };

    if (metadata.comment === '500') {
      response.status = 500;
      response.result.message = 'Failed';
    }

    this.data[project.id][profileName].push(response);

    this.finishPublish(project.id, profileName, response.result.id);

    return response;
  };
  getStatus = async (config, project) => {
    const profileName = config.name;
    const botId = project.id;

    if (this.data[botId] && this.data[botId][profileName]) {
      const response = this.data[botId][profileName][this.data[botId][profileName].length - 1];
      // return latest status
      return response;
    } else {
      return {
        status: 404,
        result: {
          message: 'bot not published',
        },
      };
    }
  };
  history = async (config: PublishConfig, project, user) => {
    const profileName = config.name;
    const botId = project.id;
    const result = [];
    if (this.data[botId] && this.data[botId][profileName]) {
      this.data[botId][profileName].map((item) => {
        result.push({
          ...item.result,
          status: item.status,
        });
      });
    }
    // return in reverse chrono
    return result.reverse();
  };

  rollback = async (config: PublishConfig, project, rollbackToVersion) => {
    this.composer.log('ROLLBACK TO %s %s', project.id, rollbackToVersion);
    const profileName = config.name;
    const botId = project.id;
    this.composer.log('eval list %O', this.data[botId][profileName]);
    const matched = this.data[botId][profileName].filter((item) => {
      this.composer.log('comparing %s %s', item.result.id, rollbackToVersion);
      return item.result.id === rollbackToVersion;
    });
    if (matched.length && matched[0].status === 200) {
      const rollback = { ...matched[0], result: { ...matched[0].result } };
      rollback.result.id = uuid();
      this.data[botId][profileName].push(rollback);
      return rollback;
    } else {
      return {
        status: 500,
        result: {
          message: 'No matching published version found in history',
        },
      };
    }
  };
}

export default async (composer: ComposerPluginRegistration): Promise<void> => {
  const publisher = new LocalPublisher(composer);
  // pass in the custom storage class that will override the default
  await composer.addPublishMethod(publisher);
};
