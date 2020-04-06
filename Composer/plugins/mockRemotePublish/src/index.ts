// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* This is a mock publishing endpoint that supports the basic features of a real remote publishing endpoint:
 *   - multiple profile can be configured to publish to this per bot
 *   - history will be maintained for each project/profile
 *   - status will initially be 202 to indicate in progress, will update after 10 seconds to 200
 */

import { v4 as uuid } from 'uuid';

interface PublishConfig {
  name: string;
  settings: any;
}

class LocalPublisher {
  private data: any;

  constructor() {
    this.data = {};
  }

  finishPublish = async (botId, profileName, jobId) => {
    setTimeout(() => {
      this.data[botId][profileName].forEach(element => {
        if (element.result.jobId == jobId) {
          element.status = 200;
          element.result.message = 'Success';
        }
      });
    }, 10000);
  };

  // config include botId and version, project is content(ComposerDialogs)
  publish = async (config: PublishConfig, project, metadata, user) => {
    const profileName = config.name;

    if (!this.data[project.id]) {
      this.data[project.id] = {};
    }
    if (!this.data[project.id][profileName]) {
      this.data[project.id][profileName] = [];
    }

    console.log('PUBLISHING CONFIG', config);

    const publish = {
      status: 202,
      result: {
        status: 202,
        time: new Date(),
        message: 'Accepted for publishing.',
        jobId: new uuid(),
        comment: metadata.comment,
      },
    };

    this.data[project.id][profileName].push(publish);

    this.finishPublish(project.id, profileName, publish.result.jobId);

    return publish;
  };
  getStatus = async (botId: string, config: PublishConfig) => {
    const profileName = config.name;

    if (this.data[botId] && this.data[botId][profileName]) {
      // return latest status
      return this.data[botId][profileName][this.data[botId].length - 1];
    } else {
      return {
        status: 200,
        result: {
          status: 200,
          message: 'Ready',
        },
      };
    }
  };
  history = async (botId: string, config: PublishConfig) => {
    const profileName = config.name;
    const result = [];
    if (this.data[botId] && this.data[botId][profileName]) {
      this.data[botId][profileName].map(item => {
        result.push({
          ...item.result,
          status: item.status,
        });
      });
    }

    // return in reverse chrono
    return result.reverse();
  };
  rollback = async (botId, versionId, config: PublishConfig) => {};
}

const publisher = new LocalPublisher();
export default async (composer: any): Promise<void> => {
  // pass in the custom storage class that will override the default
  await composer.addPublishMethod(publisher);
};
