// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { resolve } from 'path';

import * as React from 'react';
import { act, fireEvent } from '@botframework-composer/test-utils';
import * as JSZip from 'jszip';
import { readFile } from 'fs-extra';

import httpClient from '../../src/utils/httpUtil';
import { renderWithRecoil } from '../testUtils';
import CreateSkillModal, {
  validateManifestUrl,
  validateLocalZip,
  getSkillManifest,
} from '../../src/components/AddRemoteSkillModal/CreateSkillModal';
import { botProjectFileState, currentProjectIdState, settingsState } from '../../src/recoilModel';

jest.mock('../../src/components/Modal/dialogStyle', () => ({}));

const projectId = '123a.234';
const mockManifest = `{
  "$schema": "https://schemas.botframework.com/schemas/skills/v2.1/skill-manifest.json",
  "$id": "djbfskill1-d2410f83-fc1b-4d34-a4ba-aa2582418306",
  "endpoints": [
    {
      "protocol": "BotFrameworkV3",
      "name": "azure",
      "endpointUrl": "https://djtest6.azurewebsites.net/api/messages",
      "description": "<description>",
      "msAppId": "331877e9-da6e-4a7e-a398-79610b331cb0"
    }
  ],
  "name": "djbfskill1",
  "version": "1.0",
  "publisherName": "Darren Jefford",
  "activities": {
    "djbfskill1": {
      "type": "event",
      "name": "djbfskill1"
    },
    "message": {
      "type": "message"
    }
  },
  "dispatchModels": {
    "languages": {
      "en-us": [
        {
          "name": "djbfskill1",
          "contentType": "application/lu",
          "url": "https://djtest6.azurewebsites.net/manifests/skill-djbfskill1.en-us.lu",
          "description": "<description>"
        }
      ]
    },
    "intents": [
      "Weather"
    ]
  }
}`;

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

      const urlInput = getByLabelText('Skill Manifest');
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
        expect.objectContaining({
          manifestUrl: 'URL should start with http:// or https:// or file path of your system',
        })
      );
      expect(setSkillManifest).not.toBeCalled();
    });
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
      (httpClient.get as jest.Mock) = jest.fn().mockResolvedValue({ data: { name: 'skill manifest' } });

      const manifestUrl = 'https://skill';

      await getSkillManifest(projectId, manifestUrl, setSkillManifest, setFormDataErrors, showDetail);
      expect(httpClient.get).toBeCalledWith(`/projects/${projectId}/skill/retrieveSkillManifest`, {
        params: {
          url: manifestUrl,
        },
      });
      expect(setSkillManifest).toBeCalledWith({ name: 'skill manifest' });
    });

    it('should try and retrieve manifest with local manifest', async () => {
      (httpClient.get as jest.Mock) = jest.fn().mockResolvedValue({ data: JSON.parse(mockManifest) });

      const manifestUrl = '/local/mock.json';

      await getSkillManifest(projectId, manifestUrl, setSkillManifest, setFormDataErrors, showDetail);
      expect(httpClient.get).toBeCalledWith(`/projects/${projectId}/skill/retrieveSkillManifest`, {
        params: {
          url: manifestUrl,
        },
      });
      expect(setSkillManifest).toBeCalledWith(JSON.parse(mockManifest));
    });

    it('should try and retrieve manifest with zip manifest', async () => {
      // create zip instance
      const filep = resolve(__dirname, '../../__mocks__/mockManifest.zip');
      const zipFile = await readFile(filep);
      const { files } = await JSZip.loadAsync(zipFile);
      const result = await validateLocalZip(files);
      expect(result.manifestContent).not.toBeNull();
      expect(result.error).toStrictEqual({});
      expect(result.path).toBe('relativeUris/');
      expect(result.zipContent).not.toBeNull();
    });

    it('should show error when it could not retrieve skill manifest', async () => {
      (httpClient.get as jest.Mock) = jest.fn().mockRejectedValue({ message: 'error message' });

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
