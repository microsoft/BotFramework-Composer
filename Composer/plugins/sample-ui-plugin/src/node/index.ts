interface PublishResult {
  message: string;
  comment?: string;
  log?: string;
  id?: string;
  time?: Date;
  endpointURL?: string;
  status?: number;
}

interface PublishResponse {
  status: number;
  result: PublishResult;
}

interface PublishPlugin<Config = any> {
  publish: (config, project: any, metadata: any, user?) => Promise<PublishResponse>;
  getStatus?: (config, project: any, user?) => Promise<PublishResponse>;
  getHistory?: (config, project: any, user?) => Promise<PublishResult[]>;
  rollback?: (config, project: any, rollbackToVersion: string, user?) => Promise<PublishResponse>;
  [key: string]: any;
}

// this will be called by composer
function initialize(registration) {
  const plugin = {
    history: getHistory,
    publish,
    getStatus,
  };
  registration.addPublishMethod(plugin, null, null, true /** we have custom UI to host */);
}

const baseURL = 'http://localhost:3003/api/';

async function getHistory(config, project, user) {
  const endpoint = baseURL + 'history';
  let res = await fetch(endpoint);
  res = await res.json();
  return res;
}

async function getStatus(config, project, user) {
  console.log('getting status');
  const endpoint = baseURL + 'status';
  let res = await fetch(endpoint);
  res = await res.json();
  return {
    result: res,
    status: 200,
  };
}

async function publish(config, project, metadata, user) {
  const options = {
    method: 'POST',
    body: JSON.stringify({ config, project, metadata, user }),
  };
  const endpoint = baseURL + 'publish';
  let res = await fetch(endpoint, options);
  res = await res.json();
  return {
    result: res,
    status: res.status,
  };
}

module.exports = {
  initialize,
};
