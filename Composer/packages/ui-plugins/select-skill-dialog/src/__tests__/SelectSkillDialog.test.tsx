// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { act, fireEvent, getAllByRole, render } from '@bfc/test-utils';
import { EditorExtension } from '@bfc/extension-client';

import { SelectSkillDialogField, settingReferences } from '../SelectSkillDialogField';

import { skills } from './constants';

const renderSelectSkillDialog = ({ addSkillDialog = jest.fn(), onChange = jest.fn() } = {}) => {
  const props = {
    value: {},
    onChange,
  } as any;

  const shell = {
    addSkillDialog,
  };

  const shellData = {
    skills,
  };

  return render(
    <EditorExtension shell={{ api: shell, data: shellData }}>
      <SelectSkillDialogField {...props} />
    </EditorExtension>
  );
};

describe('Select Skill Dialog', () => {
  it('should add a new skill', async () => {
    const addSkillDialog = jest.fn().mockImplementation(() => {
      return {
        then: (cb) => {
          cb({
            manifestUrl: 'https://skill',
            name: 'test-skill',
            msAppId: '0000-0000',
            endpointUrl: 'https://skill/api/messafes',
          });
        },
      };
    });
    const onChange = jest.fn();

    const { baseElement, findByRole } = renderSelectSkillDialog({ addSkillDialog, onChange });
    const combobox = await findByRole('combobox');
    act(() => {
      fireEvent.click(combobox);
    });

    const dialogs = getAllByRole(baseElement, 'option');
    act(() => {
      fireEvent.click(dialogs[dialogs.length - 1]);
    });

    expect(addSkillDialog).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith({ ...settingReferences('test-skill') });
  });

  it('should display label', async () => {
    const { findByText } = renderSelectSkillDialog();
    await findByText('Skill Dialog Name');
  });
});
