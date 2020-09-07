// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { fireEvent, getAllByRole, render } from '@bfc/test-utils';
import { Extension, JSONSchema7 } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';

import { BeginSkillDialogField } from '../BeginSkillDialogField';
import pluginConfig from '..';

import { schema, skills } from './constants';

const renderBeginSkillDialog = ({ value = {}, onChange = jest.fn() } = {}) => {
  const addSkillDialog = jest.fn().mockResolvedValue({ manifestUrl: 'https://' });

  const props = {
    depth: 1,
    id: 'select.skillDialog',
    schema: (schema?.[SDKKinds.BeginSkill] || {}) as JSONSchema7,
    uiOptions: pluginConfig.uiSchema?.[SDKKinds.BeginSkill]?.form || {},
    value,
    onChange,
    definitions: {},
    name: 'select.skillDialog',
  };

  const shell: any = {
    addSkillDialog,
  };

  const shellData: any = {
    skills,
  };

  return render(
    <Extension plugins={{}} shell={{ api: shell, data: shellData }}>
      <BeginSkillDialogField {...props} />
    </Extension>
  );
};

describe('Begin Skill Dialog', () => {
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
