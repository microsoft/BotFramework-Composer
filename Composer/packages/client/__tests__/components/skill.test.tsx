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
import { currentProjectIdState, settingsState } from '../../src/recoilModel';

jest.mock('../../src//utils/httpUtil');

jest.mock('../../src/components/Modal/dialogStyle', () => ({}));

let recoilInitState;
const projectId = '123a.234';

describe('Skill page', () => {
  beforeEach(() => {
    recoilInitState = ({ set }) => {
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
      });
    };
  });
});

describe('<SkillForm />', () => {
  it('should render the skill form, and update skill manifest URL', () => {
    try {
      jest.useFakeTimers();

      (httpClient.get as jest.Mock).mockResolvedValue({ endpoints: [] });

      const onDismiss = jest.fn();
      const addRemoteSkill = jest.fn();
      const addTriggerToRoot = jest.fn();
      const { getByLabelText } = renderWithRecoil(
        <CreateSkillModal
          addRemoteSkill={addRemoteSkill}
          addTriggerToRoot={addTriggerToRoot}
          projectId={projectId}
          onDismiss={onDismiss}
        />,
        recoilInitState
      );

      const urlInput = getByLabelText('Skill Manifest URL');
      act(() => {
        fireEvent.change(urlInput, {
          target: { value: 'https://onenote-dev.azurewebsites.net/manifests/OneNoteSync-2-1-preview-1-manifest.json' },
        });
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

  beforeEach(() => {
    formDataErrors = {};
    setFormDataErrors = jest.fn();
    setSkillManifest = jest.fn();
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

      await getSkillManifest(projectId, manifestUrl, setSkillManifest, setFormDataErrors);
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

      await getSkillManifest(projectId, manifestUrl, setSkillManifest, setFormDataErrors);
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
