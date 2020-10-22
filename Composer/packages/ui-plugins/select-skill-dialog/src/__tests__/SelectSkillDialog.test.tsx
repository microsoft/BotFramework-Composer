// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@botframework-composer/test-utils';
import { EditorExtension } from '@bfc/extension-client';
import { ShellData } from '@bfc/shared';

import { SelectSkillDialogField, settingReferences } from '../SelectSkillDialogField';

import { skills } from './constants';

const renderSelectSkillDialog = ({ addSkillDialog = jest.fn(), onChange = jest.fn() } = {}) => {
  const props = {
    value: {},
    onChange,
  } as any;

  const shell: any = {
    addSkillDialog,
  };

  const shellData: ShellData = {
    skills,
  } as ShellData;

  return render(
    <EditorExtension shell={{ api: shell, data: shellData }}>
      <SelectSkillDialogField {...props} />
    </EditorExtension>
  );
};

describe('Select Skill Dialog', () => {
  it('should display label', async () => {
    const { findByText } = renderSelectSkillDialog();
    await findByText('Skill Dialog Name');
  });
});
