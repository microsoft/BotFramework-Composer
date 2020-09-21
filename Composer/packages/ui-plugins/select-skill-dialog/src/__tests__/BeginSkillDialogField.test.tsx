// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { fireEvent, getAllByRole, render } from '@bfc/test-utils';
import { EditorExtension, JSONSchema7 } from '@bfc/extension-client';
import { SDKKinds, convertSkillsToDictionary, fetchFromSettings } from '@bfc/shared';
import { act } from '@bfc/test-utils/lib/hooks';

import { BeginSkillDialogField } from '../BeginSkillDialogField';
import pluginConfig from '..';

import { schema } from './constants';

const skills: any = [
  {
    id: 'yuesuemailskill0207',
    content: {},
    manifestUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/manifest/manifest-1.0.json',
    name: 'yuesuemailskill0207',
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
];

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

  const shellData: any = {
    skills,
  };
  const setting: any = {
    skill: convertSkillsToDictionary(skills),
  };

  const shell: any = {
    addSkillDialog,
    skillsSettings: {
      get: (path: string) => fetchFromSettings(path, setting),
      set: () => {},
    },
  };

  return render(
    <EditorExtension plugins={{}} shell={{ api: shell, data: shellData }}>
      <BeginSkillDialogField {...props} />
    </EditorExtension>
  );
};

describe('Begin Skill Dialog', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it('should add a new skill', async () => {
    const onChange = jest.fn();
    const value = { skillEndpoint: `=settings.skill['yuesuemailskill0207'].endpointUrl` };
    const { baseElement, findByRole } = renderBeginSkillDialog({ value, onChange });

    const listbox = await findByRole('listbox');
    fireEvent.click(listbox);

    const endpoints = getAllByRole(baseElement, 'option');
    act(() => {
      fireEvent.click(endpoints[endpoints.length - 1]);
    });

    expect(onChange).toHaveBeenCalledWith({
      skillAppId: "=settings.skill['yuesuemailskill0207'].msAppId",
      skillEndpoint: "=settings.skill['yuesuemailskill0207'].endpointUrl",
    });
  });

  it('should be backwards compatible', async () => {
    const onChange = jest.fn();
    const value = {
      id: `https://yuesuemailskill0207-gjvga67.azurewebsites.net/manifest/manifest-1.0.json`,
      skillEndpoint: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/api/messages',
    };
    renderBeginSkillDialog({ value, onChange });

    expect(onChange).toHaveBeenCalledWith({
      id: `https://yuesuemailskill0207-gjvga67.azurewebsites.net/manifest/manifest-1.0.json`,
      skillAppId: "=settings.skill['yuesuemailskill0207'].msAppId",
      skillEndpoint: "=settings.skill['yuesuemailskill0207'].endpointUrl",
    });
  });
});
