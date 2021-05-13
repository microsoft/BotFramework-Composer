import * as React from 'react';
import { useState, useMemo, Fragment, useCallback, useEffect } from 'react';

import { usePublishApi } from '@bfc/extension-client';

import { PageRegistryType, DockerHubConfig, RegistryConfig, ImageConfig, ACRConfig, Review, Footer } from './pages';

import { RegistryFormData, PageTypes } from '../types';
import { IRepository } from '../types/interfaces';

import { ACRAPI, DockerEngine, DockerHubAPI } from '../backend';

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
  const getDefaultFormData = () => {
    return {
      creationType: 'local',
      url: '',
      anonymous: true,
      username: 'cdonkecr',
      password: 'xvLku1avRw+a9XwI3cijYwmC85GD+uUk',
      image: '',
      tag: 'latest',
    };
  };

  const [repositoryApi, setRepositoryApi] = useState<IRepository>();

  const [environmentCheck, setEnvironmentCheck] = useState<boolean>(true);

  const [token, setToken] = useState<string | null>(null);
  const [page, setPage] = useState<string>(PageTypes.RegistryType);
  const [formData, setFormData] = useState<RegistryFormData>(getDefaultFormData());

  const isNextRegistryConfigDisabled = useMemo(() => {
    return Boolean(!formData.url || !formData.username || !formData.password);
  }, [formData.url, formData.username, formData.password]);

  const isNextDockerHubConfigDisabled = useMemo(() => {
    return Boolean(!formData.username || !formData.password);
  }, [formData.username, formData.password]);

  const isNextImageConfigDisabled = useMemo(() => {
    return Boolean(!formData.image || !formData.tag);
  }, [formData.image, formData.tag]);

  const isNextRegistryTypeDisabled = useMemo(() => {
    return Boolean(!formData.creationType || !environmentCheck);
  }, [formData.creationType, environmentCheck]);

  useEffect(() => {
    // TODO: need to get the tenant id from the auth config when running as web app,
    // for electron we will always fetch tenants.
    if (userShouldProvideTokens()) {
      const { accessToken } = getTokenFromCache();
      setToken(accessToken);
    }
  }, []);

  function updateFormData<K extends keyof RegistryFormData>(field: K, value: RegistryFormData[K]) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  useEffect(() => {
    if (repositoryApi) {
      repositoryApi.UpdateProps({ url: formData.url, username: formData.username, password: formData.password });
    }
  }, [formData.url, formData.username, formData.password]);

  useEffect(() => {
    // Test Environment
    if (repositoryApi) {
      repositoryApi.testEnvironment().then((result) => setEnvironmentCheck(result));
    }
  }, [repositoryApi]);

  useEffect(() => {
    switch (formData.creationType) {
      case 'local':
        setRepositoryApi(new DockerEngine());
        break;
      case 'acr':
        setRepositoryApi(new ACRAPI({ url: formData.url, username: formData.username, password: formData.password }));
        break;

      case 'dockerhub':
        setRepositoryApi(new DockerHubAPI({ username: formData.username, password: formData.password }));
        break;

      default:
        setRepositoryApi(undefined);
        break;
    }

    // Clear all
    for (let key in formData) {
      if (key === 'creationType') {
        continue;
      }

      updateFormData(key as keyof RegistryFormData, '');
    }
  }, [formData.creationType]);

  const onSave = useCallback(() => {
    savePublishConfig(formData);
    closeDialog();
  }, [formData]);

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
              creationType={formData.creationType}
              onChoiceChanged={(choice) => {
                updateFormData('creationType', choice);
              }}
            />
          )}
          {page === PageTypes.ACRConfig && (
            <ACRConfig
              creationType={formData.creationType}
              token={token}
              registryUrl={formData.url}
              username={formData.username}
              password={formData.password}
              onRegistryUrlChanged={(e, v) => updateFormData('url', v)}
              onUsernameChanged={(e, v) => updateFormData('username', v)}
              onPasswordChanged={(e, v) => updateFormData('password', v)}
            />
          )}
          {page === PageTypes.DockerHubConfig && (
            <DockerHubConfig
              username={formData.username}
              password={formData.password}
              usernameChanged={(e, v) => updateFormData('username', v)}
              passwordChanged={(e, v) => updateFormData('password', v)}
            />
          )}
          {page === PageTypes.RegistryConfig && (
            <RegistryConfig
              registryUrl={formData.url}
              username={formData.username}
              password={formData.password}
              onRegistryUrlChanged={(e, v) => updateFormData('url', v)}
              onUsernameChanged={(e, v) => updateFormData('username', v)}
              onPasswordChanged={(e, v) => updateFormData('password', v)}
            />
          )}
          {page === PageTypes.Image && (
            <ImageConfig
              creationType={formData.creationType}
              imageName={formData.image}
              imageTag={formData.tag}
              repository={repositoryApi}
              onImageNameChanged={(e, v) => updateFormData('image', v)}
              onImageTagChanged={(e, v) => updateFormData('tag', v)}
            />
          )}
          {page === PageTypes.Review && (
            <Review
              creationType={formData.creationType}
              url={formData.url}
              username={formData.username}
              password={formData.password}
              image={formData.image}
              tag={formData.tag}
              anonymous={formData.anonymous}
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
            page={page}
            creationType={formData.creationType}
            isNextRegistryTypeDisabled={isNextRegistryTypeDisabled}
            isNextImageConfigDisabled={isNextImageConfigDisabled}
            isNextRegistryConfigDisabled={isNextRegistryConfigDisabled}
            isNextACRConfigDisabled={isNextRegistryConfigDisabled}
            isNextDockerHubConfigDisabled={isNextDockerHubConfigDisabled}
            onNext={(p) => setPage(p)}
            setTitle={setTitle}
            closeDialog={closeDialog}
            onBack={onBack}
            onSave={onSave}
          />
        </div>
      </div>
    </Fragment>
  );
};
