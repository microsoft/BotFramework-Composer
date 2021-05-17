// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { useState, useMemo, Fragment, useCallback, useEffect } from 'react';
import { usePublishApi } from '@bfc/extension-client';

import { RegistryConfigData, PageTypes, DefaultExtensionStates } from '../types';
import { IRepository } from '../types/interfaces';
import { ACRAPI, DockerEngine, DockerHubAPI } from '../backend';

import { PageRegistryType, DockerHubConfig, RegistryConfig, ImageConfig, ACRConfig, Review, Footer } from './pages';

export const DockerPublishingDialog: React.FC = () => {
  const {
    publishConfig,
    closeDialog,
    onBack,
    savePublishConfig,
    setTitle,
    getTokenFromCache,
    userShouldProvideTokens,
  } = usePublishApi();

  const getDefaultFormData = (current, defaults: RegistryConfigData) => {
    return {
      creationType: current?.creationType ?? defaults.creationType,
      url: current?.url ?? defaults.url,
      username: current?.username ?? defaults.username,
      password: current?.password ?? defaults.password,
      image: current?.image ?? defaults.image,
      tag: current?.tag ?? defaults.tag,
    };
  };

  const [repositoryApi, setRepositoryApi] = useState<IRepository>();

  const [environmentCheck, setEnvironmentCheck] = useState<boolean>(true);

  const [token, setToken] = useState<string | null>(null);
  const [page, setPage] = useState<string>(PageTypes.RegistryType);
  const [currentConfig, setCurrentConfig] = useState<RegistryConfigData>(
    getDefaultFormData(publishConfig, DefaultExtensionStates)
  );

  const isNextRegistryConfigDisabled = useMemo(() => {
    return Boolean(!currentConfig.url || !currentConfig.username || !currentConfig.password);
  }, [currentConfig.url, currentConfig.username, currentConfig.password]);

  const isNextDockerHubConfigDisabled = useMemo(() => {
    return Boolean(!currentConfig.username || !currentConfig.password);
  }, [currentConfig.username, currentConfig.password]);

  const isNextImageConfigDisabled = useMemo(() => {
    return Boolean(!currentConfig.image || !currentConfig.tag);
  }, [currentConfig.image, currentConfig.tag]);

  const isNextRegistryTypeDisabled = useMemo(() => {
    return Boolean(!currentConfig.creationType || !environmentCheck);
  }, [currentConfig.creationType, environmentCheck]);

  useEffect(() => {
    // TODO: need to get the tenant id from the auth config when running as web app,
    // for electron we will always fetch tenants.
    if (userShouldProvideTokens()) {
      const { accessToken } = getTokenFromCache();
      setToken(accessToken);
    }
  }, []);

  function updateFormData<K extends keyof RegistryConfigData>(field: K, value: RegistryConfigData[K]) {
    setCurrentConfig((current) => ({ ...current, [field]: value }));
  }

  useEffect(() => {
    if (repositoryApi) {
      repositoryApi.UpdateProps({
        url: currentConfig.url,
        username: currentConfig.username,
        password: currentConfig.password,
      });
    }
  }, [currentConfig.url, currentConfig.username, currentConfig.password]);

  useEffect(() => {
    // Test Environment
    if (repositoryApi) {
      repositoryApi.testEnvironment().then((result) => setEnvironmentCheck(result));
    }
  }, [repositoryApi]);

  useEffect(() => {
    switch (currentConfig.creationType) {
      case 'local':
        setRepositoryApi(new DockerEngine());
        break;
      case 'acr':
        setRepositoryApi(
          new ACRAPI({ url: currentConfig.url, username: currentConfig.username, password: currentConfig.password })
        );
        break;

      case 'dockerhub':
        setRepositoryApi(new DockerHubAPI({ username: currentConfig.username, password: currentConfig.password }));
        break;

      default:
        setRepositoryApi(undefined);
        break;
    }
  }, [currentConfig.creationType]);

  const onSave = useCallback(() => {
    savePublishConfig({ target: currentConfig });
    closeDialog();
  }, [currentConfig]);

  return (
    <Fragment>
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: 1, minHeight: '230px' }}>
          {page === PageTypes.RegistryType && (
            <PageRegistryType
              creationType={currentConfig.creationType}
              onChoiceChanged={(choice) => {
                updateFormData('creationType', choice);
              }}
            />
          )}
          {page === PageTypes.ACRConfig && (
            <ACRConfig
              creationType={currentConfig.creationType}
              password={currentConfig.password}
              registryUrl={currentConfig.url}
              token={token}
              username={currentConfig.username}
              onPasswordChanged={(e, v) => updateFormData('password', v)}
              onRegistryUrlChanged={(e, v) => updateFormData('url', v)}
              onUsernameChanged={(e, v) => updateFormData('username', v)}
            />
          )}
          {page === PageTypes.DockerHubConfig && (
            <DockerHubConfig
              password={currentConfig.password}
              passwordChanged={(e, v) => updateFormData('password', v)}
              username={currentConfig.username}
              usernameChanged={(e, v) => updateFormData('username', v)}
            />
          )}
          {page === PageTypes.RegistryConfig && (
            <RegistryConfig
              password={currentConfig.password}
              registryUrl={currentConfig.url}
              username={currentConfig.username}
              onPasswordChanged={(e, v) => updateFormData('password', v)}
              onRegistryUrlChanged={(e, v) => updateFormData('url', v)}
              onUsernameChanged={(e, v) => updateFormData('username', v)}
            />
          )}
          {page === PageTypes.Image && (
            <ImageConfig
              creationType={currentConfig.creationType}
              imageName={currentConfig.image}
              imageTag={currentConfig.tag}
              repository={repositoryApi}
              onImageNameChanged={(e, v) => updateFormData('image', v)}
              onImageTagChanged={(e, v) => updateFormData('tag', v)}
            />
          )}
          {page === PageTypes.Review && (
            <Review
              creationType={currentConfig.creationType}
              image={currentConfig.image}
              password={currentConfig.password}
              tag={currentConfig.tag}
              url={currentConfig.url}
              username={currentConfig.username}
            />
          )}
        </div>
        <div
          style={{
            flex: 'auto',
            flexGrow: 0,
            background: '#FFFFFF',
            borderTop: '1px solid #EDEBE9',
            width: '100%',
            textAlign: 'right',
            height: 'fit-content',
            padding: '24px 0px 0px',
          }}
        >
          <Footer
            closeDialog={closeDialog}
            creationType={currentConfig.creationType}
            isNextACRConfigDisabled={isNextRegistryConfigDisabled}
            isNextDockerHubConfigDisabled={isNextDockerHubConfigDisabled}
            isNextImageConfigDisabled={isNextImageConfigDisabled}
            isNextRegistryConfigDisabled={isNextRegistryConfigDisabled}
            isNextRegistryTypeDisabled={isNextRegistryTypeDisabled}
            page={page}
            setTitle={setTitle}
            onBack={onBack}
            onNext={(p) => setPage(p)}
            onSave={onSave}
          />
        </div>
      </div>
    </Fragment>
  );
};
