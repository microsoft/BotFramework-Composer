// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const fs = require('fs-extra');
const msRestNodeAuth = require('@azure/ms-rest-nodeauth');
const argv = require('minimist')(process.argv.slice(2));
const path = require('path');
const { promisify } = require('util');
const { GraphRbacManagementClient } = require('@azure/graph');
const { ResourceManagementClient } = require('@azure/arm-resources');
const readFile = promisify(fs.readFile);

const logger = msg => console.log(msg);
const tenantId = '72f988bf-86f1-41af-91ab-2d7cd011db47';
const subId = argv.subscriptionId;
const name = argv.name;
const environment = argv.environment || 'dev';
const location = argv.location || 'westus';
const appPassword = argv.appPassword;
const appId = argv.appId; // MicrosoftAppId
const luisAuthoringKey = argv.luisAuthoringKey;
const luisAuthoringRegion = argv.luisAuthoringRegion || 'westus';

const createLuisResource = argv.createLuisResource == 'false' ? false : true;
const createLuisAuthoringResource = argv.createLuisAuthoringResource == 'false' ? false : true;
const createCosmosDb = argv.createCosmosDb == 'false' ? false : true;
const createStorage = argv.createStorage == 'false' ? false : true;
const createAppInsignts = argv.createAppInsignts == 'false' ? false : true;

const templatePath = path.join(__dirname, 'DeploymentTemplates', 'template-with-preexisting-rg.json');

const BotProjectDeployLoggerType = {
  // Logger Type for Provision
  PROVISION_INFO: 'PROVISION_INFO',
  PROVISION_ERROR: 'PROVISION_ERROR',
  PROVISION_WARNING: 'PROVISION_WARNING',
  PROVISION_SUCCESS: 'PROVISION_SUCCESS',
  PROVISION_ERROR_DETAILS: 'PROVISION_ERROR_DETAILS',
  // Logger Type for Deploy
  DEPLOY_INFO: 'DEPLOY_INFO',
  DEPLOY_ERROR: 'DEPLOY_ERROR',
  DEPLOY_WARNING: 'DEPLOY_WARNING',
  DEPLOY_SUCCESS: 'DEPLOY_SUCCESS',
};
const createApp = async (graphClient, displayName, appPassword) => {
  const createRes = await graphClient.applications.create({
    displayName: displayName,
    passwordCredentials: [
      {
        value: appPassword,
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
      },
    ],
    availableToOtherTenants: true,
    replyUrls: ['https://token.botframework.com/.auth/web/redirect'],
  });
  return createRes;
};

const createResourceGroup = async (client, location, resourceGroupName) => {
  logger({
    status: BotProjectDeployLoggerType.PROVISION_INFO,
    message: `> Creating resource group ...`,
  });
  const param = {
    location: location,
  };

  return await client.resourceGroups.createOrUpdate(resourceGroupName, param);
};
const pack = scope => {
  return {
    value: scope,
  };
};

const getDeploymentTemplateParam = (
  appId,
  appPwd,
  location,
  name,
  shouldCreateAuthoringResource,
  shouldCreateLuisResource,
  useAppInsights,
  useCosmosDb,
  useStorage
) => {
  return {
    appId: pack(appId),
    appSecret: pack(appPwd),
    appServicePlanLocation: pack(location),
    botId: pack(name),
    shouldCreateAuthoringResource: pack(shouldCreateAuthoringResource),
    shouldCreateLuisResource: pack(shouldCreateLuisResource),
    useAppInsights: pack(useAppInsights),
    useCosmosDb: pack(useCosmosDb),
    useStorage: pack(useStorage),
  };
};

/**
 * Validate the deployment using the Azure API
 */
const validateDeployment = async (client, resourceGroupName, deployName, templateParam) => {
  logger({
    status: BotProjectDeployLoggerType.PROVISION_INFO,
    message: '> Validating Azure deployment ...',
  });

  const templateFile = await readFile(templatePath, { encoding: 'utf-8' });
  const deployParam = {
    properties: {
      template: JSON.parse(templateFile),
      parameters: templateParam,
      mode: 'Incremental',
    },
  };
  return await client.deployments.validate(resourceGroupName, deployName, deployParam);
};

/**
 * Using an ARM template, provision a bunch of resources
 */
const createDeployment = async (client, resourceGroupName, deployName, templateParam) => {
  logger({
    status: BotProjectDeployLoggerType.PROVISION_INFO,
    message: `> Deploying Azure services (this could take a while)...`,
  });
  const templateFile = await readFile(templatePath, { encoding: 'utf-8' });
  const deployParam = {
    properties: {
      template: JSON.parse(templateFile),
      parameters: templateParam,
      mode: 'Incremental',
    },
  };

  return await client.deployments.createOrUpdate(resourceGroupName, deployName, deployParam);
};

const unpackObject = output => {
  const unpacked = {};
  for (const key in output) {
    const objValue = output[key];
    if (objValue.value) {
      unpacked[key] = objValue.value;
    }
  }
  return unpacked;
};

/**
 * Write updated settings back to the settings file
 */
const updateDeploymentJsonFile = async (client, resourceGroupName, deployName, appId, appPwd) => {
  const outputs = await client.deployments.get(resourceGroupName, deployName);
  if (outputs && outputs.properties && outputs.properties.outputs) {
    const outputResult = outputs.properties.outputs;
    const applicationResult = {
      MicrosoftAppId: appId,
      MicrosoftAppPassword: appPwd,
    };
    const outputObj = unpackObject(outputResult);

    if (!createAppInsignts) {
      delete outputObj.applicationInsights;
    }
    if (!createCosmosDb) {
      delete outputObj.cosmosDb;
    }
    if (!createLuisAuthoringResource && !createLuisResource) {
      delete outputObj.luis;
    }
    if (!createStorage) {
      delete outputObj.blobStorage;
    }
    const result = {};
    Object.assign(result, outputObj, applicationResult);
    return result;
  } else {
    return null;
  }
};

/**
 * Provision a set of Azure resources for use with a bot
 */
const create = async (
  creds,
  subId,
  name,
  location,
  environment,
  appId,
  appPassword,
  createLuisResource = true,
  createLuisAuthoringResource = true,
  createCosmosDb = true,
  createStorage = true,
  createAppInsignts = true
) => {
  const graphCreds = new msRestNodeAuth.DeviceTokenCredentials(
    creds.clientId,
    tenantId,
    creds.username,
    'graph',
    creds.environment,
    creds.tokenCache
  );
  const graphClient = new GraphRbacManagementClient(graphCreds, tenantId, {
    baseUri: 'https://graph.windows.net',
  });

  // If the appId is not specified, create one
  if (!appId) {
    // this requires an app password. if one not specified, fail.
    if (!appPassword) {
      logger({
        status: BotProjectDeployLoggerType.PROVISION_INFO,
        message: `App password is required`,
      });
      throw new Error(`App password is required`);
    }
    logger({
      status: BotProjectDeployLoggerType.PROVISION_INFO,
      message: '> Creating App Registration ...',
    });

    // create the app registration
    const appCreated = await createApp(graphClient, name, appPassword);
    logger({
      status: BotProjectDeployLoggerType.PROVISION_INFO,
      message: appCreated,
    });

    // use the newly created app
    appId = appCreated.appId;
  }

  logger({
    status: BotProjectDeployLoggerType.PROVISION_INFO,
    message: `> Create App Id Success! ID: ${appId}`,
  });

  const resourceGroupName = `${name}-${environment}`;

  // timestamp will be used as deployment name
  const timeStamp = new Date().getTime().toString();
  const client = new ResourceManagementClient(creds, subId);

  // Create a resource group to contain the new resources
  const rpres = await createResourceGroup(client, location, resourceGroupName);
  logger({
    status: BotProjectDeployLoggerType.PROVISION_INFO,
    message: rpres,
  });

  // Caste the parameters into the right format
  const deploymentTemplateParam = getDeploymentTemplateParam(
    appId,
    appPassword,
    location,
    name,
    createLuisAuthoringResource,
    createLuisResource,
    createAppInsignts,
    createCosmosDb,
    createStorage
  );
  logger({
    status: BotProjectDeployLoggerType.PROVISION_INFO,
    message: deploymentTemplateParam,
  });

  // Validate the deployment using the Azure API
  const validation = await validateDeployment(client, resourceGroupName, timeStamp, deploymentTemplateParam);
  logger({
    status: BotProjectDeployLoggerType.PROVISION_INFO,
    message: validation,
  });

  // Handle validation errors
  if (validation.error) {
    logger({
      status: BotProjectDeployLoggerType.PROVISION_ERROR,
      message: `! Template is not valid with provided parameters. Review the log for more information.`,
    });
    logger({
      status: BotProjectDeployLoggerType.PROVISION_ERROR,
      message: `! Error: ${validation.error.message}`,
    });
    logger({
      status: BotProjectDeployLoggerType.PROVISION_ERROR,
      message: `+ To delete this resource group, run 'az group delete -g ${resourceGroupName} --no-wait'`,
    });
    logger({
      status: BotProjectDeployLoggerType.PROVISION_ERROR_DETAILS,
      message: validation.error.details,
    });
    throw new Error(
      'Maybe you have the same resource group in current subscription. please make sure your name is unique in subscription and remove your resource group and try again.'
    );
  }

  // Create the entire stack of resources inside the new resource group
  // this is controlled by an ARM template identified in templatePath
  const deployment = await createDeployment(client, resourceGroupName, timeStamp, deploymentTemplateParam);
  logger({
    status: BotProjectDeployLoggerType.PROVISION_INFO,
    message: deployment,
  });

  // Handle errors
  if (deployment._response.status != 200) {
    logger({
      status: BotProjectDeployLoggerType.PROVISION_ERROR,
      message: `! Template is not valid with provided parameters. Review the log for more information.`,
    });
    logger({
      status: BotProjectDeployLoggerType.PROVISION_ERROR,
      message: `! Error: ${validation.error}`,
    });
    logger({
      status: BotProjectDeployLoggerType.PROVISION_ERROR,
      message: `+ To delete this resource group, run 'az group delete -g ${resourceGroupName} --no-wait'`,
    });

    throw new Error(`! Error: ${validation.error}`);
  }

  // Validate that everything was successfully created.
  // Then, update the settings file with information about the new resources
  const updateResult = await updateDeploymentJsonFile(client, resourceGroupName, timeStamp, appId, appPassword);
  logger({
    status: BotProjectDeployLoggerType.PROVISION_INFO,
    message: updateResult,
  });

  // Handle errors
  if (!updateResult) {
    const operations = await client.deploymentOperations.list(resourceGroupName, timeStamp);
    if (operations) {
      const failedOperations = operations.filter(
        value => value && value.properties && value.properties.statusMessage.error !== null
      );
      if (failedOperations) {
        failedOperations.forEach(operation => {
          switch (
            operation &&
            operation.properties &&
            operation.properties.statusMessage.error.code &&
            operation.properties.targetResource
          ) {
            case 'MissingRegistrationForLocation':
              logger({
                status: BotProjectDeployLoggerType.PROVISION_ERROR,
                message: `! Deployment failed for resource of type ${operation.properties.targetResource.resourceType}. This resource is not avaliable in the location provided.`,
              });
              break;
            default:
              logger({
                status: BotProjectDeployLoggerType.PROVISION_ERROR,
                message: `! Deployment failed for resource of type ${operation.properties.targetResource.resourceType}.`,
              });
              logger({
                status: BotProjectDeployLoggerType.PROVISION_ERROR,
                message: `! Code: ${operation.properties.statusMessage.error.code}.`,
              });
              logger({
                status: BotProjectDeployLoggerType.PROVISION_ERROR,
                message: `! Message: ${operation.properties.statusMessage.error.message}.`,
              });
              break;
          }
        });
      }
    } else {
      logger({
        status: BotProjectDeployLoggerType.PROVISION_ERROR,
        message: `! Deployment failed. Please refer to the log file for more information.`,
      });
    }
  }
  logger({
    status: BotProjectDeployLoggerType.PROVISION_SUCCESS,
    message: `+ To delete this resource group, run 'az group delete -g ${resourceGroupName} --no-wait'`,
  });
  return updateResult;
};

msRestNodeAuth
  .interactiveLogin()
  .then(async creds => {
    const createResult = await create(
      creds,
      subId,
      name,
      location,
      environment,
      appId,
      appPassword,
      createLuisResource,
      createLuisAuthoringResource,
      createCosmosDb,
      createStorage,
      createAppInsignts
    );

    if (createResult) {
      console.log(
        `Your Azure hosting environment has been created! Copy paste the following configuration into a new profile in Composer's Publishing tab.`
      );

      const token = await creds.getToken();
      const profile = {
        publishName: name,
        location: location,
        subscriptionID: subId,
        luisAuthoringKey: luisAuthoringKey,
        luisAuthoringRegion: luisAuthoringRegion,
        environment: environment,
        provision: createResult,
        accessToken: token.accessToken,
      };

      console.log(JSON.stringify(profile, null, 2));
    }
  })
  .catch(err => {
    console.error(err);
  });
