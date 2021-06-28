// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { act, fireEvent } from '@botframework-composer/test-utils';

import httpClient from '../../src/utils/httpUtil';
import { renderWithRecoil } from '../testUtils';
import CreateSkillModal, {
  validateManifestUrl,
  getSkillManifest,
} from '../../src/components/AddRemoteSkillModal/CreateSkillModal';
import { botProjectFileState, currentProjectIdState, settingsState } from '../../src/recoilModel';

jest.mock('../../src/components/Modal/dialogStyle', () => ({}));

const projectId = '123a.234';

describe('<SkillForm />', () => {
  const recoilInitState = ({ set }) => {
    set(currentProjectIdState, projectId);

    set(settingsState(projectId), {
      luis: {
        name: '',
        authoringKey: '12345',
        authoringEndpoint: 'testAuthoringEndpoint',
        endpointKey: '12345',
        endpoint: 'testEndpoint',
        authoringRegion: 'westus',
        defaultLanguage: 'en-us',
        environment: 'composer',
      },
      qna: {
        subscriptionKey: '12345',
        qnaRegion: 'westus',
        endpointKey: '',
      },
      publishTargets: [
        {
          name: 'Test',
          type: 'azurePublish',
          configuration:
            '{"name":"test","environment":"dev","tenantId":"xxx","runtimeIdentifier":"win-x64","resourceGroup":"<name of your resource group>","botName":"<name of your bot channel registration>","subscriptionId":"<id of your subscription>","region":"<region of your resource group>","settings":{"applicationInsights":{"InstrumentationKey":"<Instrumentation Key>"},"cosmosDb":{"cosmosDBEndpoint":"<endpoint url>","authKey":"<auth key>","databaseId":"botstate-db","containerId":"botstate-container"},"blobStorage":{"connectionString":"<connection string>","container":"<container>"}}}',
          lastPublished: '2021-04-08T08:08:21.581Z',
        },
        {
          name: 'Test1',
          type: 'azurePublish',
          configuration:
            '{"name":"test1","environment":"dev","tenantId":"xxx","runtimeIdentifier":"win-x64","resourceGroup":"<name of your resource group>","botName":"<name of your bot channel registration>","subscriptionId":"<id of your subscription>","region":"<region of your resource group>","settings":{"applicationInsights":{"InstrumentationKey":"<Instrumentation Key>"},"cosmosDb":{"cosmosDBEndpoint":"<endpoint url>","authKey":"<auth key>","databaseId":"botstate-db","containerId":"botstate-container"},"blobStorage":{"connectionString":"<connection string>","container":"<container>"}}}',
          lastPublished: '2021-04-08T07:23:29.077Z',
        },
        {
          configuration:
            '{"name":"test2","environment":"dev","tenantId":"xxx","runtimeIdentifier":"win-x64","resourceGroup":"<name of your resource group>","botName":"<name of your bot channel registration>","subscriptionId":"<id of your subscription>","region":"<region of your resource group>","settings":{"applicationInsights":{"InstrumentationKey":"<Instrumentation Key>"},"cosmosDb":{"cosmosDBEndpoint":"<endpoint url>","authKey":"<auth key>","databaseId":"botstate-db","containerId":"botstate-container"},"blobStorage":{"connectionString":"<connection string>","container":"<container>"}}}',
          name: 'Test2',
          type: 'azurePublish',
          lastPublished: '2021-04-09T08:11:59.491Z',
        },
      ],
    });

    set(botProjectFileState(projectId), {
      content: {
        skills: {
          oneNoteSync: {
            manifest: 'https://xxx.json',
            remote: true,
            endpointName: 'default',
          },
        },
      },
    });
  };

  it('should render the skill form, and update skill manifest URL', () => {
    try {
      jest.useFakeTimers();

      (httpClient.get as jest.Mock).mockResolvedValue({ endpoints: [] });

      const onDismiss = jest.fn();
      const addRemoteSkill = jest.fn();
      const addTriggerToRoot = jest.fn();
      const { getByTestId, getByLabelText } = renderWithRecoil(
        <CreateSkillModal
          addRemoteSkill={addRemoteSkill}
          addTriggerToRoot={addTriggerToRoot}
          projectId={projectId}
          onDismiss={onDismiss}
        />,
        recoilInitState
      );

      const nextButton = getByTestId('SetAppIdNext');
      nextButton.click();

      const urlInput = getByLabelText('Skill Manifest URL');
      act(() => {
        fireEvent.change(urlInput, {
          target: {
            value: 'https://onenote-dev.azurewebsites.net/manifests/OneNoteSync-2-1-preview-1-manifest.json',
          },
        });
        // allow validatation debounce to execute
        jest.runAllTimers();
      });

      expect(urlInput.getAttribute('value')).toBe(
        'https://onenote-dev.azurewebsites.net/manifests/OneNoteSync-2-1-preview-1-manifest.json'
      );
    } finally {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    }
  });

  let formDataErrors;
  let setFormDataErrors;
  let setSkillManifest;
  let showDetail;

  beforeEach(() => {
    formDataErrors = {};
    setFormDataErrors = jest.fn();
    setSkillManifest = jest.fn();
    showDetail = jest.fn();
  });

  describe('validateManifestUrl', () => {
    it('should set the error for an invalid URL', async () => {
      const formData = { manifestUrl: 'invalid URL' };

      await validateManifestUrl({
        formData,
        formDataErrors,
        setFormDataErrors,
      });

      expect(setFormDataErrors).toBeCalledWith(
        expect.objectContaining({ manifestUrl: 'URL should start with http:// or https://' })
      );
      expect(setSkillManifest).not.toBeCalled();
    });
  });

  describe('validateManifestUrl', () => {
    it('should set an error for a missing manifest URL', () => {
      const formData = {};

      validateManifestUrl({
        formData,
        formDataErrors,
        setFormDataErrors,
      });

      expect(setFormDataErrors).toBeCalledWith(expect.objectContaining({ manifestUrl: 'Please input a manifest URL' }));
    });

    it('should try and retrieve manifest', async () => {
      (httpClient.get as jest.Mock) = jest.fn().mockResolvedValue({ data: 'skill manifest' });

      const manifestUrl = 'https://skill';

      await getSkillManifest(projectId, manifestUrl, setSkillManifest, setFormDataErrors, showDetail);
      expect(httpClient.get).toBeCalledWith(`/projects/${projectId}/skill/retrieveSkillManifest`, {
        params: {
          url: manifestUrl,
        },
      });
      expect(setSkillManifest).toBeCalledWith('skill manifest');
    });

    it('should show error when it could not retrieve skill manifest', async () => {
      (httpClient.get as jest.Mock) = jest.fn().mockRejectedValue({ message: 'skill manifest' });

      const manifestUrl = 'https://skill';

      await getSkillManifest(projectId, manifestUrl, setSkillManifest, setFormDataErrors, showDetail);
      expect(httpClient.get).toBeCalledWith(`/projects/${projectId}/skill/retrieveSkillManifest`, {
        params: {
          url: manifestUrl,
        },
      });
      expect(setSkillManifest).not.toBeCalled();
      expect(setFormDataErrors).toBeCalledWith(
        expect.objectContaining({
          manifestUrl: 'Manifest URL can not be accessed',
        })
      );
    });
  });
});
