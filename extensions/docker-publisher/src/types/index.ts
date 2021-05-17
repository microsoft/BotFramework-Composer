import { IChoiceGroupOption } from 'office-ui-fabric-react';

export type OnChangeDelegate = (event, value) => void;
export type OnChoiceDelegate = (value) => void;

export type RegistryConfigData = {
  creationType: string;
  url: string;
  username: string;
  password: string;
  image: string;
  tag: string;
};

export type ConfigSettings = RegistryConfigData & {
  botPath: string;
  botId: string;
  botName: string;
};

export type ExecResult = {
  stdout: string;
  stderr: string;
};

export const DefaultExtensionStates: RegistryConfigData = {
  creationType: 'local',
  url: '',
  username: '',
  password: '',
  image: '',
  tag: '',
};

export type RepositoryAPIProps = {
  url?: string;
  username?: string;
  password?: string;
  token?: string;
};

export const RegistryTypeOptions: IChoiceGroupOption[] = [
  { key: 'local', text: 'Local Docker' },
  { key: 'acr', text: 'Azure Container Registry' },
  { key: 'dockerhub', text: 'Docker Hub' },
  { key: 'custom', text: 'Custom Registry' },
];

export const PageTypes = {
  RegistryConfig: 'registryConfig',
  RegistryType: 'registryType',
  ACRConfig: 'acrConfig',
  DockerHubConfig: 'dockerHubConfig',
  Image: 'imageConfig',
  Review: 'review',
};
