export interface BotEnvironment {
  id: string;
  displayName: string;
  primarySecurityGroupId: string;
  default: boolean;
  url: string;
  expiration: string;
  expiringInDays: number;
  locationId: string;
  locationDisplayName: string;
  environmentSku: string;
  isLiteSku: boolean;
  isTeamsLinked: boolean;
}

export interface Bot {
  id: string;
  aadTenantId: string;
  name: string;
  region: {
    id: string;
    displayName: string;
    primarySecurityGroupId: string;
    default: boolean;
    url: string;
    expiration: string;
    expiringInDays: number;
    locationId: string;
    locationDisplayName: string;
    environmentSku: string;
    isLiteSku: boolean;
    isTeamsLinked: boolean;
  };
  regionId: string;
  cdsBotId: string;
  users: {
    botId: string;
    aadUserId: string;
    role: number;
  }[];
  provisioningStatus: number;
  isManaged: boolean;
  isCustomizable: boolean;
  language: string;
  languageCode: number;
  almMigrationState: string;
  requiresFlowRegistration: boolean;
  lastPublishedVersion: string;
}
