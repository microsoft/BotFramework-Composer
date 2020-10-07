// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { fireEvent, getAllByRole, render } from '@bfc/test-utils';
import { EditorExtension } from '@bfc/extension-client';
import { convertSkillsToDictionary, Skill } from '@bfc/shared';
import { act } from '@bfc/test-utils/lib/hooks';

import { SkillEndpointField } from '../SkillEndpointField';

import { skills } from './constants';

const projectId = '123.abc';

const renderSkillEndpointField = ({ value = {}, updateSkillSetting = jest.fn() } = {}) => {
  const props = {
    value,
  } as any;

  const shellData: any = {
    skillsSettings: convertSkillsToDictionary(skills as Skill[]),
    skills,
  };

  const shell: any = {
    updateSkillSetting,
  };

  return render(
    <EditorExtension plugins={{}} projectId={projectId} shell={{ api: shell, data: shellData }}>
      <SkillEndpointField {...props} />
    </EditorExtension>
  );
};

describe('Begin Skill Dialog', () => {
  it('should update the skill settings', async () => {
    const updateSkillSetting = jest.fn();
    const { baseElement, findByRole } = renderSkillEndpointField({
      updateSkillSetting,
      value: { skillEndpoint: `=settings.skill['${skills[0].id}'].endpointUrl` },
    });

    const listbox = await findByRole('listbox');
    act(() => {
      fireEvent.click(listbox);
    });

    const endpoints = getAllByRole(baseElement, 'option');
    act(() => {
      fireEvent.click(endpoints[endpoints.length - 1]);
    });

    expect(updateSkillSetting).toHaveBeenCalledWith(
      skills[0].id,
      expect.objectContaining({
        endpointUrl: skills[0].endpoints[0].endpointUrl,
        msAppId: skills[0].endpoints[0].msAppId,
      })
    );
  });
});
