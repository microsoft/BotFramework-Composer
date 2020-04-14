// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// @ts-nocheck

import React from 'react';
import { cleanup, fireEvent, getAllByRole, render } from 'react-testing-library';
import { Extension } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';

import { BeginSkillDialogField } from '../BeginSkillDialogField';
import formSchema from '../formSchema';

import { schema, skills } from './constants';

const flushPromises = () => Promise.resolve();

const renderBeginSkillDialog = ({ value = {}, onChange } = {}) => {
  const addSkillDialog = jest.fn().mockResolvedValue({ manifestUrl: 'https://' });

  const props = {
    depth: 1,
    id: 'select.skillDialog',
    schema: schema?.[SDKKinds.SkillDialog] || {},
    uiOptions: formSchema?.[SDKKinds.SkillDialog] || {},
    value,
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
      <BeginSkillDialogField {...props} />
    </Extension>
  );
};

describe('Begin Skill Dialog', () => {
  afterEach(cleanup);

  beforeEach(() => {
    jest.useFakeTimers();
  });

  it('should add a new skill', async () => {
    const onChange = jest.fn();
    const value = { id: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/manifest/manifest-1.0.json' };
    const { baseElement, findByRole } = renderBeginSkillDialog({ value, onChange });

    const listbox = await findByRole('listbox');
    fireEvent.click(listbox);

    const endpoints = await getAllByRole(baseElement, 'option');
    fireEvent.click(endpoints[endpoints.length - 1]);

    expect(onChange).toHaveBeenCalledWith({
      id: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/manifest/manifest-1.0.json',
      skillAppId: '79432da8-0f7e-4a16-8c23-ddbba30ae85d',
      skillEndpoint: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/api/messages',
    });
  });
});
