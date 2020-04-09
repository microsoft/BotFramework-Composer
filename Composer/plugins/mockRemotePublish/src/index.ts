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
        if (element.result.id == jobId) {
          element.status = 200;
          element.result.message = 'Success';
          element.result.log = element.result.log + '\nPublish succeeded!';
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

    this.data[project.id][profileName].push(response);

    this.finishPublish(project.id, profileName, response.result.id);

    return response;
  };
  getStatus = async (config: PublishConfig, project, user) => {
    const profileName = config.name;
    const botId = project.id;

    if (this.data[botId] && this.data[botId][profileName]) {
      const response = this.data[botId][profileName][this.data[botId][profileName].length - 1];
      // return latest status
      return response;
    } else {
      return {
        status: 200,
        result: {
          message: 'Ready',
        }
      };
    }
  };
  history = async (config: PublishConfig, project, user) => {
    const profileName = config.name;
    const botId = project.id;
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
  rollback = async (config: PublishConfig, project, rollbackToVersion, user) => {
    console.log('ROLLBACK TO', project.id, rollbackToVersion);
    const profileName = config.name;
    const botId = project.id;
    console.log('eval list', this.data[botId][profileName]);
    const matched = this.data[botId][profileName].filter(item => {
      console.log('comparing ', item.result.id, rollbackToVersion);
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
        }
      };
    }
  };
}

const publisher = new LocalPublisher();
export default async (composer: any): Promise<void> => {
  // pass in the custom storage class that will override the default
  await composer.addPublishMethod(publisher);
};
