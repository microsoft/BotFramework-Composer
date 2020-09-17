// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { act, fireEvent, getByLabelText, getByTestId, getByText } from '@bfc/test-utils';
import { Skill } from '@bfc/shared';

import httpClient from '../../src//utils/httpUtil';
import SkillList from '../../src/pages/skills/skill-list';
import { renderWithRecoil } from '../testUtils';
import CreateSkillModal, {
  validateEndpoint,
  validateManifestUrl,
  validateName,
} from '../../src/components/CreateSkillModal';
import { settingsState, projectIdState, skillsState } from '../../src/recoilModel';
import Skills from '../../src/pages/skills';

jest.mock('../../src//utils/httpUtil');

jest.mock('../../src/components/Modal/dialogStyle', () => ({}));

const skills: Skill[] = [
  {
    id: 'email-skill',
    content: {},
    manifestUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/manifest/manifest-1.0.json',
    name: 'Email-Skill',
    description: 'The Email skill provides email related capabilities and supports Office and Google calendars.',
    endpointUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/api/messages',
    msAppId: '79432da8-0f7e-4a16-8c23-ddbba30ae85d',
    endpoints: [],
  },
  {
    id: 'point-of-interest-skill',
    content: {},
    manifestUrl: 'https://hualxielearn2-snskill.azurewebsites.net/manifest/manifest-1.0.json',
    name: 'Point Of Interest Skill',
    description: 'The Point of Interest skill provides PoI search capabilities leveraging Azure Maps and Foursquare.',
    endpointUrl: 'https://hualxielearn2-snskill.azurewebsites.net/api/messages',
    msAppId: 'e2852590-ea71-4a69-9e44-e74b5b6cbe89',
    endpoints: [],
  },
];

let recoilInitState;

describe('Skill page', () => {
  beforeEach(() => {
    recoilInitState = ({ set }) => {
      set(projectIdState, '243245');
      set(skillsState, skills),
        set(settingsState, {
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

  it('can add a new skill', async () => {
    const { baseElement } = renderWithRecoil(<Skills />, recoilInitState);

    const button = getByText(baseElement, 'Connect to a new skill');
    act(() => {
      fireEvent.click(button);
    });

    const manifestUrl = getByLabelText(baseElement, 'Manifest url');
    expect(manifestUrl).toBeTruthy();

    const cancel = getByTestId(baseElement, 'SkillFormCancel');
    act(() => {
      fireEvent.click(cancel);
    });
  });
});

describe('<SkillList />', () => {
  it('should render the SkillList', () => {
    const { container } = renderWithRecoil(<SkillList projectId={'123'} />, recoilInitState);
    expect(container).toHaveTextContent('Email-Skill');
    expect(container).toHaveTextContent('Point Of Interest Skill');
  });
});

describe('<SkillForm />', () => {
  it('should render the skill form, and update skill manifest url', () => {
    jest.useFakeTimers();

    (httpClient.post as jest.Mock).mockResolvedValue({ endpoints: [] });

    const onDismiss = jest.fn();
    const onSubmit = jest.fn();
    const { getByLabelText, getByText } = renderWithRecoil(
      <CreateSkillModal projectId={'123'} onDismiss={onDismiss} onSubmit={onSubmit} />,
      recoilInitState
    );

    const urlInput = getByLabelText('Manifest url');
    act(() => {
      fireEvent.change(urlInput, { target: { value: skills[0].manifestUrl } });
    });

    expect(urlInput.getAttribute('value')).toBe(skills[0].manifestUrl);

    const submitButton = getByText('Confirm');
    act(() => {
      fireEvent.click(submitButton);
    });

    expect(onSubmit).not.toBeCalled();
  });

  let formDataErrors;
  let projectId;
  let validationState;
  let setFormDataErrors;
  let setSkillManifest;
  let setValidationState;

  beforeEach(() => {
    formDataErrors = {};
    projectId = '123';
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
        projectId,
        skills,
        setFormDataErrors,
        setValidationState,
        setSkillManifest,
        validationState,
      });

      expect(setFormDataErrors).toBeCalledWith(
        expect.objectContaining({ manifestUrl: 'Url should start with http[s]://' })
      );
      expect(setSkillManifest).not.toBeCalled();
      expect(setValidationState).not.toBeCalled();
    });
  });

  describe('validateManifestUrl', () => {
    it('should set an error for duplicate skill manifest url', () => {
      const formData = {
        manifestUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/MANIFEST/MANIFEST-1.0.json',
      };

      validateManifestUrl({
        formData,
        formDataErrors,
        projectId,
        skills,
        setFormDataErrors,
        setValidationState,
        setSkillManifest,
        validationState,
      });

      expect(setFormDataErrors).toBeCalledWith(
        expect.objectContaining({ manifestUrl: 'Duplicate skill manifest Url' })
      );
      expect(setSkillManifest).not.toBeCalled();
      expect(setValidationState).not.toBeCalled();
    });

    it('should set an error for a missing manifest url', () => {
      const formData = {};

      validateManifestUrl({
        formData,
        formDataErrors,
        projectId,
        skills,
        setFormDataErrors,
        setValidationState,
        setSkillManifest,
        validationState,
      });

      expect(setFormDataErrors).toBeCalledWith(expect.objectContaining({ manifestUrl: 'Please input a manifest Url' }));
    });

    it('should try and retrieve manifest if manifest url meets other criteria', async () => {
      (httpClient.post as jest.Mock) = jest.fn().mockResolvedValue({ data: 'skill manifest' });

      const formData = { manifestUrl: 'https://skill' };
      const formDataErrors = { manifestUrl: 'error' };

      await validateManifestUrl({
        formData,
        formDataErrors,
        projectId,
        skills,
        setFormDataErrors,
        setValidationState,
        setSkillManifest,
        validationState,
      });
      expect(setValidationState).toBeCalledWith(
        expect.objectContaining({
          manifestUrl: 'Validating',
        })
      );
      expect(httpClient.post).toBeCalledWith('/projects/123/skill/retrieve-skill-manifest', {
        url: formData.manifestUrl,
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
      (httpClient.post as jest.Mock) = jest.fn().mockRejectedValue({ message: 'skill manifest' });

      const formData = { manifestUrl: 'https://skill' };

      await validateManifestUrl({
        formData,
        formDataErrors,
        projectId,
        skills,
        setFormDataErrors,
        setValidationState,
        setSkillManifest,
        validationState,
      });
      expect(setValidationState).toBeCalledWith(
        expect.objectContaining({
          manifestUrl: 'Validating',
        })
      );
      expect(httpClient.post).toBeCalledWith('/projects/123/skill/retrieve-skill-manifest', {
        url: formData.manifestUrl,
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

  describe('validateName', () => {
    it('should set error for invalid name', () => {
      const formData = { name: 'Email Skill' };

      validateName({
        formData,
        formDataErrors,
        skills,
        setFormDataErrors,
        setValidationState,
        validationState,
      });

      expect(setFormDataErrors).toBeCalledWith(
        expect.objectContaining({ name: 'Name cannot include special characters or spaces' })
      );
    });

    it('should set error for duplicate name', () => {
      const formData = { name: 'email-skill' };

      validateName({
        formData,
        formDataErrors,
        skills,
        setFormDataErrors,
        setValidationState,
        validationState,
      });

      expect(setFormDataErrors).toBeCalledWith(expect.objectContaining({ name: 'Duplicate skill name' }));
    });
  });

  describe('validateEndpoint', () => {
    it('should set an error for missing msAppId', () => {
      const formData = { endpointUrl: 'https://skill/api/messages' };

      validateEndpoint({
        formData,
        formDataErrors,
        setFormDataErrors,
        setValidationState,
        validationState,
      });

      expect(setFormDataErrors).toBeCalledWith(
        expect.objectContaining({
          endpoint: 'Please select a valid endpoint',
        })
      );
      expect(setValidationState).not.toBeCalled();
    });

    it('should set an error for missing endpointUrl', () => {
      const formData = { msAppId: '00000000-0000-0000-0000-000000000000' };

      validateEndpoint({
        formData,
        formDataErrors,
        setFormDataErrors,
        setValidationState,
        validationState,
      });

      expect(setFormDataErrors).toBeCalledWith(
        expect.objectContaining({
          endpoint: 'Please select a valid endpoint',
        })
      );
      expect(setValidationState).not.toBeCalled();
    });

    it('should set an error for malformed msAppId', () => {
      const formData = { endpointUrl: 'https://skill/api/messages', msAppId: 'malformed app id' };

      validateEndpoint({
        formData,
        formDataErrors,
        setFormDataErrors,
        setValidationState,
        validationState,
      });

      expect(setFormDataErrors).toBeCalledWith(
        expect.objectContaining({
          endpoint: 'Skill manifest endpoint is configured improperly',
        })
      );
      expect(setValidationState).not.toBeCalled();
    });

    it('should set an error for malformed endpointUrl', () => {
      const formData = { endpointUrl: 'malformed endpoint', msAppId: '00000000-0000-0000-0000-000000000000' };

      validateEndpoint({
        formData,
        formDataErrors,
        setFormDataErrors,
        setValidationState,
        validationState,
      });

      expect(setFormDataErrors).toBeCalledWith(
        expect.objectContaining({
          endpoint: 'Skill manifest endpoint is configured improperly',
        })
      );
      expect(setValidationState).not.toBeCalled();
    });

    it('should not set an error', () => {
      const formData = { endpointUrl: 'https://skill/api/messages', msAppId: '00000000-0000-0000-0000-000000000000' };

      validateEndpoint({
        formData,
        formDataErrors,
        setFormDataErrors,
        setValidationState,
        validationState,
      });

      expect(setFormDataErrors).toBeCalledWith(
        expect.not.objectContaining({
          endpoint: expect.any(String),
        })
      );
      expect(setValidationState).toBeCalledWith(
        expect.objectContaining({
          endpoint: 'Validated',
        })
      );
    });
  });
});
