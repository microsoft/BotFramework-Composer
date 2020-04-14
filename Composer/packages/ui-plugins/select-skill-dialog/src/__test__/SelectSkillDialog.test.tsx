// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// @ts-nocheck

import React from 'react';
import { cleanup, fireEvent, getAllByRole, render } from 'react-testing-library';
import { Extension } from '@bfc/extension';

import { SelectSkillDialog } from '../SelectSkillDialogField';

const flushPromises = () => Promise.resolve();

const skills = [
  {
    manifestUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/manifest/manifest-1.0.json',
    name: 'Email Skill',
    endpoints: [
      {
        name: 'production',
        protocol: 'BotFrameworkV3',
        description: 'Production endpoint for the Email Skill',
        endpointUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/api/messages',
        msAppId: '79432da8-0f7e-4a16-8c23-ddbba30ae85d',
      },
    ],
  },
  {
    manifestUrl: 'https://ericv3skillssimplesandwichbot.azurewebsites.net/wwwroot/sandwich-bot-manifest.json',
    name: 'Sandwich Skill Bot',
    endpoints: [
      {
        name: 'YourSandwichBotName',
        protocol: 'BotFrameworkV3',
        description: 'Default endpoint for the skill',
        endpointUrl: 'https://ericv3skillssimplesandwichbot.azurewebsites.net/api/messages',
        msAppId: '94e29d0f-3f0d-46f0-aa78-00aed83698cf',
      },
    ],
  },
];

const renderSelectSkillDialog = ({ addSkillDialog, onChange } = {}) => {
  const props = {
    description: 'Name of the skill to call.',
    id: 'select.skillDialog',
    label: 'Skill Dialog Name',
    onChange,
  };

  const shell = {
    addSkillDialog,
  };

  const shellData = {
    skills,
  };

  return render(
    <Extension shell={shell} shellData={shellData}>
      <SelectSkillDialog {...props} />
    </Extension>
  );
};

describe('Select Skill Dialog', () => {
  afterEach(cleanup);

  beforeEach(() => {
    jest.useFakeTimers();
  });

  it('should add a new skill', async () => {
    const addSkillDialog = jest.fn().mockResolvedValue({ manifestUrl: 'https://' });
    const onChange = jest.fn();

    const { baseElement, findByRole } = renderSelectSkillDialog({ addSkillDialog, onChange });
    const combobox = await findByRole('combobox');
    fireEvent.click(combobox);

    const dialogs = await getAllByRole(baseElement, 'option');
    fireEvent.click(dialogs[dialogs.length - 1]);

    await flushPromises();
    jest.advanceTimersByTime(1000);

    expect(addSkillDialog);
    expect(onChange).toHaveBeenCalledWith({ key: 'https://' });
  });

  it('should select skill', async () => {
    const onChange = jest.fn();

    const { baseElement, findByRole } = renderSelectSkillDialog({ onChange });
    const combobox = await findByRole('combobox');
    fireEvent.click(combobox);

    const [skill] = await getAllByRole(baseElement, 'option');
    fireEvent.click(skill);

    expect(onChange).toHaveBeenCalledWith({
      index: 0,
      isSelected: false,
      key: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/manifest/manifest-1.0.json',
      text: 'Email Skill',
    });
  });

  it('should display label', async () => {
    const { findByText } = await renderSelectSkillDialog();
    await findByText('Skill Dialog Name');
  });
});
