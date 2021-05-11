import { IChoiceGroupOption } from 'office-ui-fabric-react';

export type RegistryFormData = {
  creationType: string;
  url: string;
  anonymous: boolean;
  username: string;
  password: string;
  image: string;
  tag: string;
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
  Image: 'imageConfig',
  Review: 'review',
};
