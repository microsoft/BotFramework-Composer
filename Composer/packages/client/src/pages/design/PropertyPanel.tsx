// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useMemo } from 'react';
import { EditorExtension, PluginConfig } from '@bfc/extension-client';
import { useRecoilValue } from 'recoil';

import { useShell } from '../../shell';
import plugins, { mergePluginConfigs } from '../../plugins';
import {
  schemasState,
  focusPathState,
  projectMetaDataState,
  skillsStateSelector,
  skillNameIdentifierByProjectIdSelector,
} from '../../recoilModel';
import { undoVersionState } from '../../recoilModel/undo/history';

import { PropertyEditor } from './PropertyEditor';
import { ManifestEditor } from './ManifestEditor';

type PropertyViewProps = {
  projectId: string;
  isSkill: boolean;
};

const PropertyPanel: React.FC<PropertyViewProps> = ({ projectId = '', isSkill = false }) => {
  const schemas = useRecoilValue(schemasState(projectId));
  const focusPath = useRecoilValue(focusPathState(projectId));
  const undoVersion = useRecoilValue(undoVersionState(projectId));
  const { isRemote: isRemoteSkill } = useRecoilValue(projectMetaDataState(projectId));
  const skillsByProjectId = useRecoilValue(skillNameIdentifierByProjectIdSelector);
  const skills = useRecoilValue(skillsStateSelector);

  const skillManifestFile = useMemo(() => {
    if (!isSkill) return undefined;

    const skillNameIdentifier = skillsByProjectId[projectId];
    return skills[skillNameIdentifier];
  }, [skills, isSkill, skillsByProjectId]);

  const shellForPropertyEditor = useShell('PropertyEditor', projectId);

  const pluginConfig: PluginConfig = useMemo(() => {
    const sdkUISchema = schemas?.ui?.content ?? {};
    const userUISchema = schemas?.uiOverrides?.content ?? {};
    return mergePluginConfigs({ uiSchema: sdkUISchema }, plugins, { uiSchema: userUISchema });
  }, [schemas?.ui?.content, schemas?.uiOverrides?.content]);

  return (
    <EditorExtension plugins={pluginConfig} projectId={projectId} shell={shellForPropertyEditor}>
      {isRemoteSkill && skillManifestFile ? (
        <ManifestEditor formData={skillManifestFile} />
      ) : (
        <PropertyEditor key={focusPath + undoVersion} />
      )}
    </EditorExtension>
  );
};

export default PropertyPanel;
