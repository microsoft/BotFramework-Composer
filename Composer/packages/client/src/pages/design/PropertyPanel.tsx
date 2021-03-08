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
import { LoadingSpinner } from '../../components/LoadingSpinner';

import { PropertyEditor } from './PropertyEditor';
import { ManifestEditor } from './ManifestEditor';
import useAssetsParsingState from './useAssetsParsingState';

type PropertyViewProps = {
  projectId: string;
  isSkill: boolean;
};

const PropertyPanel: React.FC<PropertyViewProps> = React.memo(({ projectId = '', isSkill = false }) => {
  const schemas = useRecoilValue(schemasState(projectId));
  const focusPath = useRecoilValue(focusPathState(projectId));
  const undoVersion = useRecoilValue(undoVersionState(projectId));
  const { isRemote: isRemoteSkill } = useRecoilValue(projectMetaDataState(projectId));
  const skillsByProjectId = useRecoilValue(skillNameIdentifierByProjectIdSelector);
  const skills = useRecoilValue(skillsStateSelector);
  const loading = useAssetsParsingState(projectId);
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
      {loading && <LoadingSpinner />}
      {!loading &&
        (isRemoteSkill && skillManifestFile ? (
          <ManifestEditor formData={skillManifestFile} />
        ) : (
          <PropertyEditor key={focusPath + undoVersion} />
        ))}
    </EditorExtension>
  );
});

export default PropertyPanel;
