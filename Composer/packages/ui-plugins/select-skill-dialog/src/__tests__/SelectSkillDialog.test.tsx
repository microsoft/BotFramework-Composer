// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent, getAllByRole } from '@botframework-composer/test-utils';
import { EditorExtension } from '@bfc/extension-client';
import { ShellData } from '@bfc/shared';
import { act } from '@botframework-composer/test-utils/lib/hooks';

import { SelectSkillDialogField, settingReferences } from '../SelectSkillDialogField';

import { skills } from './constants';

const renderSelectSkillDialog = ({ onChange = jest.fn() } = {}) => {
  const props = {
    value: {},
    onChange,
  } as any;

  const shell: any = {};

  const shellData: ShellData = {
    skills,
  } as ShellData;

  return render(
    <EditorExtension plugins={{}} projectId="12a.32" shell={{ api: shell, data: shellData }}>
      <SelectSkillDialogField {...props} />
    </EditorExtension>
  );
};

describe('Select Skill Dialog', () => {
  it('should display label', async () => {
    const { findByText } = renderSelectSkillDialog();
    await findByText('Skill Dialog Name');
  });

  it('should update the dialog file with the selected skill', async () => {
    const onChange = jest.fn();
    const keys = Object.keys(skills);

    const { baseElement, findByRole } = renderSelectSkillDialog({ onChange });
    const combobox = await findByRole('listbox');
    act(() => {
      fireEvent.click(combobox);
    });

    const options = getAllByRole(baseElement, 'option');
    act(() => {
      fireEvent.click(options[options.length - 1]);
    });

    expect(onChange).toHaveBeenCalledWith({ ...settingReferences(keys[1]) });
  });
});
