// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { act, fireEvent } from '@botframework-composer/test-utils';

import httpClient from '../../src/utils/httpUtil';
import { renderWithRecoil } from '../testUtils';
import CreateSkillModal, { validateManifestUrl } from '../../src/components/AddRemoteSkillModal/CreateSkillModal';
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
  it('should render the skill form, and update skill manifest url', () => {
    try {
      jest.useFakeTimers();

      (httpClient.get as jest.Mock).mockResolvedValue({ endpoints: [] });

      const onDismiss = jest.fn();
      const addRemoteSkill = jest.fn();
      const addTriggerToRoot = jest.fn();
      const { getByLabelText, getByText } = renderWithRecoil(
        <CreateSkillModal
          projectId={projectId}
          onDismiss={onDismiss}
          addRemoteSkill={addRemoteSkill}
          addTriggerToRoot={addTriggerToRoot}
        />,
        recoilInitState
      );

      const urlInput = getByLabelText('Manifest url');
      act(() => {
        fireEvent.change(urlInput, {
          target: { value: 'https://onenote-dev.azurewebsites.net/manifests/OneNoteSync-2-1-preview-1-manifest.json' },
        });
      });

      expect(urlInput.getAttribute('value')).toBe(
        'https://onenote-dev.azurewebsites.net/manifests/OneNoteSync-2-1-preview-1-manifest.json'
      );

      const submitButton = getByText('Confirm');
      act(() => {
        fireEvent.click(submitButton);
      });
      expect(addRemoteSkill).not.toBeCalled();
    } finally {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    }
  });

  let formDataErrors;
  let validationState;
  let setFormDataErrors;
  let setSkillManifest;
  let setValidationState;

  beforeEach(() => {
    formDataErrors = {};
    validationState = {};
    setFormDataErrors = jest.fn();
    setSkillManifest = jest.fn();
    setValidationState = jest.fn();
  });

  describe('validateManifestUrl', () => {
    it('should set the error for an invalid url', async () => {
      const formData = { manifestUrl: 'invalid url' };

      await validateManifestUrl({
        formData,
        formDataErrors,
        setFormDataErrors,
      });

      expect(setFormDataErrors).toBeCalledWith(
        expect.objectContaining({ manifestUrl: 'Url should start with http[s]://' })
      );
      expect(setSkillManifest).not.toBeCalled();
      expect(setValidationState).not.toBeCalled();
    });
  });

  describe('validateManifestUrl', () => {
    it('should set an error for a missing manifest url', () => {
      const formData = {};

      validateManifestUrl({
        formData,
        formDataErrors,
        setFormDataErrors,
      });

      expect(setFormDataErrors).toBeCalledWith(expect.objectContaining({ manifestUrl: 'Please input a manifest Url' }));
    });

    it('should try and retrieve manifest if manifest url meets other criteria', async () => {
      (httpClient.get as jest.Mock) = jest.fn().mockResolvedValue({ data: 'skill manifest' });

      const formData = { manifestUrl: 'https://skill' };
      const formDataErrors = { manifestUrl: 'error' };

      await validateManifestUrl({
        formData,
        formDataErrors,
        setFormDataErrors,
      });
      expect(setValidationState).toBeCalledWith(
        expect.objectContaining({
          manifestUrl: 'Validating',
        })
      );
      expect(httpClient.get).toBeCalledWith(`/projects/${projectId}/skill/retrieveSkillManifest`, {
        params: {
          url: formData.manifestUrl,
        },
      });
      expect(setSkillManifest).toBeCalledWith('skill manifest');
      expect(setValidationState).toBeCalledWith(
        expect.objectContaining({
          manifestUrl: 'Validated',
        })
      );
      expect(setFormDataErrors).toBeCalledWith(
        expect.not.objectContaining({
          manifestUrl: 'error',
        })
      );
    });

    it('should show error when it could not retrieve skill manifest', async () => {
      (httpClient.get as jest.Mock) = jest.fn().mockRejectedValue({ message: 'skill manifest' });

      const formData = { manifestUrl: 'https://skill' };

      await validateManifestUrl({
        formData,
        formDataErrors,
        setFormDataErrors,
      });
      expect(setValidationState).toBeCalledWith(
        expect.objectContaining({
          manifestUrl: 'Validating',
        })
      );
      expect(httpClient.get).toBeCalledWith(`/projects/${projectId}/skill/retrieveSkillManifest`, {
        params: {
          url: formData.manifestUrl,
        },
      });
      expect(setSkillManifest).not.toBeCalled();
      expect(setValidationState).toBeCalledWith(
        expect.objectContaining({
          manifestUrl: 'NotValidated',
        })
      );
      expect(setFormDataErrors).toBeCalledWith(
        expect.objectContaining({
          manifestUrl: 'Manifest url can not be accessed',
        })
      );
    });
  });
});
