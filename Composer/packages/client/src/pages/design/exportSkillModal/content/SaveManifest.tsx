// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React, { useEffect } from 'react';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { SkillManifest } from '@bfc/shared';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';

import { ContentProps, VERSION_REGEX } from '../constants';
import { botDisplayNameState, skillManifestsState } from '../../../../recoilModel';

const styles = {
  container: css`
    height: 350px;
    overflow: auto;
  `,
};

export const getManifestId = (
  botName: string,
  skillManifests: SkillManifest[],
  { content: { $schema } = {} }: Partial<SkillManifest>
): string => {
  const [version] = VERSION_REGEX.exec($schema) || [''];

  let fileId = version ? `${botName}-${version.replace(/\./g, '-')}-manifest` : `${botName}-manifest`;
  let i = -1;

  while (skillManifests.some(({ id }) => id === fileId)) {
    if (i < 0) {
      fileId = fileId.concat(`-${++i}`);
    } else {
      fileId = fileId.substr(0, fileId.lastIndexOf('-')).concat(`-${++i}`);
    }
  }

  return fileId;
};

export const SaveManifest: React.FC<ContentProps> = ({ errors, manifest, setSkillManifest, projectId }) => {
  const botName = useRecoilValue(botDisplayNameState(projectId));
  const skillManifests = useRecoilValue(skillManifestsState(projectId));

  const { id } = manifest;

  const handleChange = (_, id) => {
    setSkillManifest({ ...manifest, id });
  };

  useEffect(() => {
    if (!id) {
      const fileId = getManifestId(botName, skillManifests, manifest);
      setSkillManifest({ ...manifest, id: fileId });
    }
  }, []);

  return (
    <div css={styles.container}>
      <Label required>{formatMessage('File name')}</Label>
      <TextField errorMessage={errors.id} styles={{ root: { width: '400px' } }} value={id} onChange={handleChange} />
    </div>
  );
};
