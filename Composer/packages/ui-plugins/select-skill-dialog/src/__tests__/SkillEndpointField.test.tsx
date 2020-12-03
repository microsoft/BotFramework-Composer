// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { fireEvent, getAllByRole, render } from '@botframework-composer/test-utils';
import { EditorExtension } from '@bfc/extension-client';
import { act } from '@botframework-composer/test-utils/lib/hooks';

import { SkillEndpointField } from '../SkillEndpointField';

import { skills } from './constants';

const projectId = '123.abc';

const renderSkillEndpointField = ({ value = {}, updateSkill = jest.fn() } = {}) => {
  const props = {
    value,
  } as any;

  const shellData: any = {
    skillsSettings: {},
    skills,
  };

  const shell: any = {
    updateSkill,
  };

  return render(
    <EditorExtension plugins={{}} projectId={projectId} shell={{ api: shell, data: shellData }}>
      <SkillEndpointField {...props} />
    </EditorExtension>
  );
};

describe('Begin Skill Dialog', () => {
  it('should call update skill with the correct parameters', async () => {
    const updateSkill = jest.fn();
    const keys = Object.keys(skills);
    const selectedKeyIndex = 1;
    const selectedSkill = skills[keys[selectedKeyIndex]];
    const { baseElement, findByRole } = renderSkillEndpointField({
      updateSkill,
      value: { skillEndpoint: `=settings.skill['${keys[selectedKeyIndex]}'].endpointUrl` },
    });

    const listbox = await findByRole('listbox');
    act(() => {
      fireEvent.click(listbox);
    });

    const endpoints = getAllByRole(baseElement, 'option');

    act(() => {
      fireEvent.click(endpoints[endpoints.length - 1]);
    });

    expect(updateSkill).toHaveBeenCalledWith(
      keys[selectedKeyIndex],
      expect.objectContaining({
        selectedEndpointIndex: 1,
        skill: selectedSkill,
      })
    );
  });

  it('should choose composer local endpoint', async () => {
    const updateSkill = jest.fn();
    const keys = Object.keys(skills);
    const selectedKeyIndex = 1;
    const selectedSkill = skills[keys[selectedKeyIndex]];
    const { baseElement, findByRole } = renderSkillEndpointField({
      updateSkill,
      value: { skillEndpoint: `=settings.skill['${keys[selectedKeyIndex]}'].endpointUrl` },
    });

    const listbox = await findByRole('listbox');
    act(() => {
      fireEvent.click(listbox);
    });

    const endpoints = getAllByRole(baseElement, 'option');

    act(() => {
      fireEvent.click(endpoints[1]);
    });

    expect(updateSkill).toHaveBeenCalledWith(
      keys[selectedKeyIndex],
      expect.objectContaining({
        selectedEndpointIndex: -1,
        skill: selectedSkill,
      })
    );
  });

  it('should not fail if skill has no manifest', async () => {
    const updateSkill = jest.fn();
    const keys = Object.keys(skills);
    const selectedKeyIndex = 1;
    const selectedSkill = skills[keys[selectedKeyIndex]];
    delete selectedSkill.manifest;
    const { baseElement, findByRole } = renderSkillEndpointField({
      updateSkill,
      value: { skillEndpoint: `=settings.skill['${keys[selectedKeyIndex]}'].endpointUrl` },
    });

    const listbox = await findByRole('listbox');
    act(() => {
      fireEvent.click(listbox);
    });

    const endpoints = getAllByRole(baseElement, 'option').filter((endpoint) => {
      return !!endpoint.title;
    });

    expect(endpoints.length).toBe(1);
  });
});
