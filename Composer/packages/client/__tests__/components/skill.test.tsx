// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent, getByLabelText, getByTestId } from '@bfc/test-utils';
import { Skill } from '@bfc/shared';

import httpClient from '../../src//utils/httpUtil';
import Skills from '../../src/pages/skills';
import SkillList from '../../src/pages/skills/skill-list';
import { renderWithRecoil } from '../testUtils';
import CreateSkillModal from '../../src/components/CreateSkillModal';
import { settingsState } from '../../src/recoilModel';

jest.mock('../../src//utils/httpUtil');

jest.mock('../../src/components/Modal/dialogStyle', () => ({}));

const items: Skill[] = [
  {
    manifestUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/manifest/manifest-1.0.json',
    name: 'Email Skill',
    description: 'The Email skill provides email related capabilities and supports Office and Google calendars.',
    endpointUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/api/messages',
    msAppId: '79432da8-0f7e-4a16-8c23-ddbba30ae85d',
    protocol: '',
    endpoints: [],
    body: '',
  },
  {
    manifestUrl: 'https://hualxielearn2-snskill.azurewebsites.net/manifest/manifest-1.0.json',
    name: 'Point Of Interest Skill',
    description: 'The Point of Interest skill provides PoI search capabilities leveraging Azure Maps and Foursquare.',
    endpointUrl: 'https://hualxielearn2-snskill.azurewebsites.net/api/messages',
    msAppId: 'e2852590-ea71-4a69-9e44-e74b5b6cbe89',
    protocol: '',
    endpoints: [],
    body: '',
  },
];

const recoilInitState = ({ set }) => {
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

describe('Skill page', () => {
  it('can add a new skill', () => {
    const { getByText } = renderWithRecoil(<Skills />, recoilInitState);

    const button = getByText('Connect to a new skill');
    fireEvent.click(button);

    const manifestUrl = getByLabelText(document.body, 'Manifest url');
    expect(manifestUrl).toBeTruthy();

    const cancel = getByTestId(document.body, 'SkillFormCancel');
    fireEvent.click(cancel);
  });
});

describe('<SkillList />', () => {
  it('should render the SkillList', () => {
    const { container } = renderWithRecoil(
      <SkillList projectId="test-project" skills={items} onDelete={jest.fn()} onEdit={jest.fn()} />
    );
    expect(container).toHaveTextContent('Email Skill');
    expect(container).toHaveTextContent('Point Of Interest Skill');
  });

  it('can edit the skill', () => {
    const onEdit = jest.fn();
    const { getAllByTestId } = renderWithRecoil(
      <SkillList projectId="test-project" skills={items} onDelete={jest.fn()} onEdit={onEdit} />
    );

    const editBtns = getAllByTestId('EditSkill');
    editBtns.forEach((btn, i) => {
      fireEvent.click(btn);
      expect(onEdit).toHaveBeenCalledWith(i);
    });
  });
});

describe('<SkillForm />', () => {
  it('should render the skill form, and do update', () => {
    jest.useFakeTimers();
    const onSubmit = jest.fn((formData) => {
      expect(formData.manifestUrl).toBe('http://AwesomeSkill');
    });

    (httpClient.post as jest.Mock).mockResolvedValue(undefined);

    const onDismiss = jest.fn(() => {});
    const { getByLabelText, getByText } = renderWithRecoil(
      <CreateSkillModal
        isOpen
        editIndex={0}
        projectId={'243245'}
        skills={items}
        onDismiss={onDismiss}
        onSubmit={onSubmit}
      />
    );

    const urlInput = getByLabelText('Manifest url');
    expect(urlInput.getAttribute('value')).toBe(items[0].manifestUrl);
    fireEvent.change(urlInput, { target: { value: 'http://AwesomeSkill' } });

    const submitButton = getByText('Confirm');
    fireEvent.click(submitButton);
    expect(onSubmit).not.toBeCalled();
  });
});
