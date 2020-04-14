// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render, fireEvent } from '@bfc/test-utils';

import SkillList from '../../src/pages/skills/skill-list';
import SkillForm from '../../src/pages/skills/skill-form';

const items = [
  {
    manifestUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/manifest/manifest-1.0.json',
    name: 'Email Skill',
    description: 'The Email skill provides email related capabilities and supports Office and Google calendars.',
    endpointUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/api/messages',
    msAppId: '79432da8-0f7e-4a16-8c23-ddbba30ae85d',
  },
  {
    manifestUrl: 'https://hualxielearn2-snskill.azurewebsites.net/manifest/manifest-1.0.json',
    name: 'Point Of Interest Skill',
    description: 'The Point of Interest skill provides PoI search capabilities leveraging Azure Maps and Foursquare.',
    endpointUrl: 'https://hualxielearn2-snskill.azurewebsites.net/api/messages',
    msAppId: 'e2852590-ea71-4a69-9e44-e74b5b6cbe89',
  },
];

describe('<SkillList />', () => {
  it('should render the SkillList', () => {
    const { container } = render(<SkillList skills={items} />);
    expect(container).toHaveTextContent('Email Skill');
    expect(container).toHaveTextContent('Point Of Interest Skill');
  });

  it('should open/close skill form', () => {
    const renderResult = render(<SkillList skills={items} />);
    const createButton = renderResult.getByText('Connect to a new skill');
    fireEvent.click(createButton);

    const cancelButton = renderResult.getByText('Cancel');
    fireEvent.click(cancelButton);
  });
});

describe('<SkillForm />', () => {
  it('should render the skill form, and do update', () => {
    const onSubmit = jest.fn(formData => {
      expect(formData.manifestUrl).toBe('http://AwesomeSkill');
    });
    const onDismiss = jest.fn(() => {});
    const { getByLabelText, getByText } = render(
      <SkillForm skills={items} editIndex={0} onSubmit={onSubmit} onDismiss={onDismiss} />
    );

    const urlInput = getByLabelText('Manifest url');
    expect(urlInput.value).toBe(items[0].manifestUrl);
    fireEvent.change(urlInput, { target: { value: 'http://AwesomeSkill' } });

    const submitButton = getByText('Confirm');
    fireEvent.click(submitButton);
    expect(onSubmit).toBeCalled();
  });
});
