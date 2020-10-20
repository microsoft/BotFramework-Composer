// TODO: reenable once types have been fixed and published again
// https://github.com/microsoft/BotFramework-Composer/pull/4436
//import { IBotProject } from '@botframework-composer/types';
import { join } from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { ensureDirSync, remove } from 'fs-extra';
import fetch, { RequestInit } from 'node-fetch';

import {
  PVAPublishJob,
  PublishConfig,
  PublishResponse,
  PublishResult,
  UserIdentity,
  PublishState,
  PublishHistory,
  PullResponse,
} from './types';

const COMPOSER_1P_APP_ID = 'ce48853e-0605-4f77-8746-d70ac63cc6bc';
const API_VERSION = '1';
const authCredentials = {
  // web auth flow
  clientId: COMPOSER_1P_APP_ID,
  scopes: ['a522f059-bb65-47c0-8934-7db6e5286414/.default'], // int / ppe

  // electron auth flow
  targetResource: 'a522f059-bb65-47c0-8934-7db6e5286414',
};

const getBaseUrl = () => {
  const pvaEnv = (process.env.COMPOSER_PVA_ENV || '').toLowerCase();
  switch (pvaEnv) {
    case 'prod': {
      const url = `https://powerva.microsoft.com/api/botmanagement/v${API_VERSION}`;
      console.log('prod detected, operation using PVA url: ', url);
      return url;
    }

    case 'ppe': {
      const url = `https://bots.ppe.customercareintelligence.net/api/botmanagement/v${API_VERSION}`;
      console.log('ppe detected, operation using PVA url: ', url);
      return url;
    }

    case 'int': {
      const url = `https://bots.int.customercareintelligence.net/api/botmanagement/v${API_VERSION}`;
      console.log('int detected, operation using PVA url: ', url);
      return url;
    }

    default: {
      const url = `https://bots.int.customercareintelligence.net/api/botmanagement/v${API_VERSION}`;
      console.log('no flag detected, operation using PVA url: ', url);
      return url;
    }
  }
};

// in-memory history that allows us to get the status of the most recent job
const publishHistory: PublishHistory = {};

export const publish = async (
  config: PublishConfig,
  project: any, // TODO: reenable once types have been fixed and published again IBotProject,
  metadata: any,
  _user: UserIdentity,
  getAccessToken
): Promise<PublishResponse> => {
  const {
    // these are provided by Composer
    profileName, // the name of the publishing profile "My PVA Prod Slot"

    // these are specific to the PVA publish profile shape
    botId,
    envId,
    tenantId,
    deleteMissingDependencies, // publish behavior
  } = config;
  const { comment = '' } = metadata;

  try {
    // authenticate with PVA
    const accessToken = await getAccessToken(authCredentials);

    // where we will store the bot .zip
    const zipDir = join(process.env.COMPOSER_TEMP_DIR as string, 'pva-publish');
    ensureDirSync(zipDir);
    const zipPath = join(zipDir, 'bot.zip');

    // write the .zip to disk
    const zipWriteStream = createWriteStream(zipPath);
    await new Promise((resolve, reject) => {
      project.exportToZip((archive: NodeJS.ReadStream & { finalize: () => void; on: (ev, listener) => void }) => {
        archive.on('error', (err) => {
          console.error('Got error trying to export to zip: ', err);
          reject(err.message);
        });
        archive.pipe(zipWriteStream);
        archive.on('end', () => {
          archive.unpipe();
          zipWriteStream.end();
          resolve();
        });
      });
    });

    // open up the .zip for reading
    const zipReadStream = createReadStream(zipPath);
    await new Promise((resolve, reject) => {
      zipReadStream.on('error', (err) => {
        reject(err);
      });
      zipReadStream.once('readable', () => {
        resolve();
      });
    });
    const length = zipReadStream.readableLength;

    // initiate the publish job
    const url = `${getBaseUrl()}/environments/${envId}/bots/${botId}/composer/publishoperations?deleteMissingDependencies=${deleteMissingDependencies}&comment=${encodeURIComponent(
      comment
    )}`;
    const res = await fetch(url, {
      method: 'POST',
      body: zipReadStream,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-CCI-TenantId': tenantId,
        'X-CCI-Routing-TenantId': tenantId,
        'Content-Type': 'application/zip',
        'Content-Length': length.toString(),
        'If-Match': project.eTag,
      },
    });
    const job: PVAPublishJob = await res.json();

    // transform the PVA job to a publish response
    const result = xformJobToResult(job);
    console.log(job);

    // add to publish history
    const botProjectId = project.id;
    ensurePublishProfileHistory(botProjectId, profileName);
    publishHistory[botProjectId][profileName].unshift(result);

    remove(zipDir); // clean up zip -- fire and forget

    return {
      status: result.status,
      result,
    };
  } catch (e) {
    return {
      status: 500,
      result: {
        message: e.message,
      },
    };
  }
};

export const getStatus = async (
  config: PublishConfig,
  project: any, // TODO: reenable once types have been fixed and published again IBotProject,
  user: UserIdentity,
  getAccessToken
): Promise<PublishResponse> => {
  const {
    // these are provided by Composer
    profileName, // the name of the publishing profile "My PVA Prod Slot"

    // these are specific to the PVA publish profile shape
    botId,
    envId,
    tenantId,
  } = config;
  const botProjectId = project.id;

  const operationId = getOperationIdOfLastJob(botProjectId, profileName);
  if (!operationId) {
    // no last job
    return {
      status: 404,
      result: {
        message: `Could not find any publish history for project "${botProjectId}" and profile name "${profileName}"`,
      },
    };
  }

  try {
    // authenticate with PVA
    const accessToken = await getAccessToken(authCredentials);

    // check the status for the publish job
    const url = `${getBaseUrl()}/environments/${envId}/bots/${botId}/composer/publishoperations/${operationId}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-CCI-TenantId': tenantId,
        'X-CCI-Routing-TenantId': tenantId,
        'If-None-Match': project.eTag,
      },
    });
    const job: PVAPublishJob = await res.json();
    console.log(job);

    // transform the PVA job to a publish response
    const result = xformJobToResult(job);

    // update publish history
    const botProjectId = project.id;
    ensurePublishProfileHistory(botProjectId, profileName);
    const oldRecord = publishHistory[botProjectId][profileName].shift();
    result.comment = oldRecord.comment; // persist comment from initial publish
    publishHistory[botProjectId][profileName].unshift(result);

    return {
      status: result.status,
      result,
    };
  } catch (e) {
    return {
      status: 500,
      result: {
        message: e.message,
      },
    };
  }
};

export const history = async (
  config: PublishConfig,
  _project: any, // TODO: reenable once types have been fixed and published again IBotProject,
  _user: UserIdentity,
  getAccessToken
): Promise<PublishResult[]> => {
  const {
    // these are specific to the PVA publish profile shape
    botId,
    envId,
    tenantId,
  } = config;

  try {
    // authenticate with PVA
    const accessToken = await getAccessToken(authCredentials);

    // get the publish history for the bot
    const url = `${getBaseUrl()}/environments/${envId}/bots/${botId}/composer/publishoperations`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-CCI-TenantId': tenantId,
        'X-CCI-Routing-TenantId': tenantId,
      },
    });
    const jobs: PVAPublishJob[] = await res.json();

    // return the first 20
    return jobs.map((job) => xformJobToResult(job)).slice(0, 19);
  } catch (e) {
    return [];
  }
};

export const pull = async (
  config: PublishConfig,
  _project: any, // TODO: reenable once types have been fixed and published again IBotProject,
  _user: UserIdentity,
  getAccessToken
): Promise<PullResponse> => {
  const {
    // these are specific to the PVA publish profile shape
    botId,
    envId,
    tenantId,
  } = config;
  try {
    // authenticate with PVA
    const accessToken = await getAccessToken(authCredentials);
    // fetch zip
    const url = `${getBaseUrl()}/api/botmanagement/v1/environments/${envId}/bots/${botId}/composer/content`;
    const options: RequestInit = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-CCI-TenantId': tenantId,
        'X-CCI-Routing-TenantId': tenantId,
      },
    };
    const result = await fetch(url, options);

    const eTag = result.headers.get('etag') || '';
    const contentType = result.headers.get('content-type');
    if (!contentType || contentType !== 'application/zip') {
      throw 'Invalid content type header! Must be application/zip';
    }

    // write the zip to disk
    if (result && result.body) {
      // where we will store the bot .zip
      const zipDir = join(process.env.COMPOSER_TEMP_DIR as string, 'pva-publish');
      ensureDirSync(zipDir);
      const zipPath = join(zipDir, 'bot-assets.zip');
      const writeStream = createWriteStream(zipPath);
      await new Promise((resolve, reject) => {
        writeStream.once('finish', resolve);
        writeStream.once('error', reject);
        result.body.pipe(writeStream);
      });
      return { eTag, zipPath, status: result.status };
    } else {
      return { status: 500, error: { message: 'Response containing zip does not have a body' } };
    }
  } catch (e) {
    return { status: 500, error: { message: `Error while trying to download the bot content: ${e}` } };
  }
};

const xformJobToResult = (job: PVAPublishJob): PublishResult => {
  const result: PublishResult = {
    comment: job.comment,
    eTag: job.importedContentEtag,
    id: job.operationId, // what is this used for in Composer?
    log: (job.diagnostics || []).map((diag) => `---\n${JSON.stringify(diag, null, 2)}\n---\n`).join('\n'),
    message: getUserFriendlyMessage(job.state),
    time: new Date(job.lastUpdateTimeUtc),
    status: getStatusFromJobState(job.state),
  };
  return result;
};

const getStatusFromJobState = (state: PublishState): number => {
  switch (state) {
    case 'Done':
      return 200;

    case 'Failed':
    case 'PreconditionFailed':
      return 500;

    case 'Validating':
    case 'LoadingContent':
    case 'UpdatingSnapshot':
    default:
      return 202;
  }
};

const ensurePublishProfileHistory = (botProjectId: string, profileName: string) => {
  if (!publishHistory[botProjectId]) {
    publishHistory[botProjectId] = {};
  }
  if (!publishHistory[botProjectId][profileName]) {
    publishHistory[botProjectId][profileName] = [];
  }
};

const getOperationIdOfLastJob = (botProjectId: string, profileName: string): string => {
  if (
    publishHistory[botProjectId] &&
    publishHistory[botProjectId][profileName] &&
    !!publishHistory[botProjectId][profileName].length
  ) {
    const mostRecentJob = publishHistory[botProjectId][profileName][0];
    return mostRecentJob.id;
  }
  // couldn't find any jobs for the bot project / profile name combo
  return '';
};

const getUserFriendlyMessage = (state: PublishState): string => {
  switch (state) {
    case 'Done':
      return 'Publish successful.';

    case 'Failed':
      return 'Publish failed. Please check logs.';

    case 'LoadingContent':
      return 'Loading bot content...';

    case 'PreconditionFailed':
      return 'Bot content out of sync. Please check logs.';

    case 'UpdatingSnapshot':
      return 'Updating bot content in PVA...';

    case 'Validating':
      return 'Validating bot assets...';

    default:
      return '';
  }
};
