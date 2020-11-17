export type PVAPublishJob = {
  comment: string;
  diagnostics: DiagnosticInfo[];
  importedContentEtag?: string;
  lastUpdateTimeUtc: string;
  operationId: string;
  startTimeUtc: string;
  state: PublishState;
  testUrl: string;
};

type DiagnosticInfo = {
  code: string;
  range?: number;
  severity: string;
  source?: string;
  message?: string;
};

export type PublishHistory = {
  [botProjectId: string]: PublishProfileHistory;
};

type PublishProfileHistory = {
  [profileName: string]: PublishResult[];
};

export type PublishConfig = {
  baseUrl: string;
  botId: string;
  deleteMissingDependencies: boolean;
  envId: string;
  fullSettings: any;
  profileName: string;
  tenantId: string;
};

export type PublishState =
  | 'Validating'
  | 'LoadingContent'
  | 'UpdatingSnapshot'
  | 'Done'
  | 'PreconditionFailed'
  | 'Failed';

/** Copied from @bfc/extension */
export interface PublishResult {
  comment?: string;
  endpointURL?: string;
  eTag?: string;
  id?: string;
  log?: string;
  message: string;
  status?: number;
  time?: Date;
  action?: { href: string; label: string };
}

/** Copied from @bfc/extension */
export type PublishResponse = {
  status: number;
  result: PublishResult;
};

/** Copied from @bfc/extension */
export type UserIdentity = {
  [key: string]: any;
};

export type PullResponse = {
  error?: { message: string };
  eTag?: string;
  status: number;
  /** Path to the pulled .zip containing updated bot content */
  zipPath?: string;
};
