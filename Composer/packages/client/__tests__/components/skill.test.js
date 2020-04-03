// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render, fireEvent } from 'react-testing-library';

import SkillList from '../../src/pages/skills/skill-list';
import SkillForm from '../../src/pages/skills/skill-form';

describe('<SkillList />', () => {
  const items = [
    {
      manifestUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/manifest/manifest-1.0.json',
      name: 'Email Skill 1',
      description: 'The Email skill provides email related capabilities and supports Office and Google calendars.',
      endpointUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/api/messages',
      msAppId: '79432da8-0f7e-4a16-8c23-ddbba30ae85d',
    },
    {
      manifestUrl: '',
      name: 'Email Skill 2',
      description: 'The Email skill provides email related capabilities and supports Office and Google calendars.',
      endpointUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/api/messages',
      msAppId: '79432da8-0f7e-4a16-8c23-ddbba30ae85f',
    },
  ];
  it('should render the SkillList', () => {
    const { container } = render(<SkillList skills={items} />);
    expect(container).toHaveTextContent('Email Skill 1');
    expect(container).toHaveTextContent('Email Skill 2');
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
  const items = [
    {
      manifestUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/manifest/manifest-1.0.json',
      name: 'Email Skill 1',
      description: 'The Email skill provides email related capabilities and supports Office and Google calendars.',
      endpointUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/api/messages',
      msAppId: '79432da8-0f7e-4a16-8c23-ddbba30ae85d',
    },
    {
      manifestUrl: '',
      name: 'Email Skill 2',
      description: 'The Email skill provides email related capabilities and supports Office and Google calendars.',
      endpointUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/api/messages',
      msAppId: '79432da8-0f7e-4a16-8c23-ddbba30ae85f',
    },
  ];
  it('should render the skill form, and do update', () => {
    const onSubmit = jest.fn(formData => {
      expect(formData.name).toBe('Awesome Skill');
    });
    const onDismiss = jest.fn(() => {});
    const { container, getByLabelText, getByText } = render(
      <SkillForm skills={items} editIndex={1} onSubmit={onSubmit} onDismiss={onDismiss} />
    );
    expect(container).toHaveTextContent('Add by manifest');
    expect(container).toHaveTextContent('Add by App configurations');

    const nameInput = getByLabelText('Name');
    expect(nameInput.value).toBe(items[1].name);
    fireEvent.change(nameInput, { target: { value: 'Awesome Skill' } });

    const submitButton = getByText('Confirm');
    fireEvent.click(submitButton);
    expect(onSubmit).toBeCalled();
  });
});
