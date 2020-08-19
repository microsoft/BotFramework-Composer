export interface IBotProjectSchema {
  $schema: string;
  name: string;
  workspace: string;
  provisioningProfile: IProvisioningProfile;
  skills: ISkill[];
}

export interface ISkill {
  workspace?: string;
  manifest?: string;
  provisioningProfile?: IProvisioningProfile;
  remote: boolean;
  endpointName?: string;
}

export interface IProvisioningProfile {
  $schema: string;
  accessToken: string;
  environment: string;
  MicrosoftAppId: string;
  MicrosoftAppPassword: string;
  blobStorage: BlobStorage;
  cosmosDb: CosmosDB;
  qna: Qna;
  luis: Luis;
  applicationInsights: ApplicationInsights;
}

export interface ApplicationInsights {
  endpointKey: string;
}

export interface BlobStorage {
  connectionString: string;
}

export interface CosmosDB {
  endpoint: string;
  authKey: string;
}

export interface Luis {
  endpointKey: string;
  authoringKey: string;
  region: string;
  endpoint: string;
  authoringEndpoint: string;
}

export interface Qna {
  knowledgebaseId: string;
  endpoint: string;
}
