// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

function CustomizeError(name, message, stack = undefined) {
  this.name = name;
  this.message = message;
  this.stack = stack || new Error().stack;
}
CustomizeError.prototype = Object.create(Error.prototype);
CustomizeError.prototype.constructor = CustomizeError;

export const isCustomizeError = (err) => {
  return err instanceof CustomizeError;
};

export const createCustomizeError = (name, message, stack = undefined) => {
  return new CustomizeError(name, message, stack);
};

export const stringifyError = (error: any): string => {
  if (error instanceof Error) {
    return `${error.name} - ${error.message}`;
  } else if (typeof error === 'object') {
    return JSON.stringify(error, Object.getOwnPropertyNames(error));
  } else {
    return error;
  }
};
export enum ProvisionErrors {
  CREATE_RESOURCEGROUP_ERROR = 'CREATE_RESOURCES_ERROR',
  PROVISION_ERROR = 'PROVISION_ERROR',
  CREATE_LUIS_AUTHORING_RESOURCE_ERROR = 'CREATE_LUIS_AUTHORING_RESOURCE_ERROR',
  CREATE_WEB_APP_ERROR = 'CREATE_WEB_APP_ERROR',
  CREATE_FUNCTIONS_RESOURCE_ERROR = 'CREATE_FUNCTIONS_RESOURCE_ERROR',
  BOT_REGISTRATION_ERROR = 'BOT_REGISTRATION_ERROR',
  CREATE_COSMOSDB_ERROR = 'CREATE_COSMOSDB_ERROR',
  CREATE_BLOB_STORAGE_ERROR = 'CREATE_BLOB_STORAGE_ERROR',
  CREATE_LUIS_ERROR = 'CREATE_LUIS_ERROR',
  CREATE_QNA_ERROR = 'CREATE_QNA_ERROR',
  CREATE_APP_INSIGHT_ERROR = 'CREATE_APP_INSIGHT_ERROR',
  CONNECT_APP_INSIGHT_ERROR = 'CONNECT_APP_INSIGHT_ERROR',
  CREATE_COUNTER_ERROR = 'CREATE_COUNTER_ERROR',
  CREATE_APP_REGISTRATION = 'CREATE_APP_REGISTRATION',
  GET_TENANTID = 'GET_TENANTID',
  KEYVAULT_ERROR = 'KEYVAULT_ERROR',
}

export enum AzurePublishErrors {
  // luis and qna
  LUIS_BUILD_ERROR = 'LUIS_BUILD_ERROR',
  LUIS_PUBLISH_ERROR = 'LUIS_PUBLISH_ERROR',
  QNA_BUILD_ERROR = 'QNA_BUILD_ERROR',
  QNA_PUBLISH_ERROR = 'QNA_PUBLISH_ERROR',
  CROSS_TRAIN_ERROR = 'CROSS_TRAIN_ERROR',
  LUIS_AND_QNA_ERROR = 'LUIS_AND_QNA_ERROR',

  // initialize publish error
  CONFIG_ERROR = 'CONFIG_ERROR',
  INITIALIZE_ERROR = 'INITIALIZE_ERROR',

  // zip and upload error
  ZIP_FOLDER_ERROR = 'ZIP_FOLDER_ERROR',
  DEPLOY_ZIP_ERROR = 'DEPLOY_ZIP_ERROR',

  // abs error
  ABS_ERROR = 'ABS_ERROR',
}
