// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { useId } from '@uifabric/react-hooks';
import kebabCase from 'lodash/kebabCase';
import formatMessage from 'format-message';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';

import * as styles from './styles';

interface ISettingToggleProps {
  checked?: boolean;
  description: React.ReactChild;
  id?: string;
  image: string;
  onToggle: (checked: boolean) => void;
  title: string;
}

const SettingToggle: React.FC<ISettingToggleProps> = (props) => {
  const { id, title, description, image, checked, onToggle } = props;
  const uniqueId = useId(kebabCase(title));

  return (
    <div css={styles.settingsContainer}>
      <div aria-hidden="true" css={styles.image} role="presentation">
        {image && <img src={image} />}
      </div>
      <div css={styles.settingsContent}>
        <Label htmlFor={id || uniqueId} styles={{ root: { padding: 0 } }}>
          {title}
        </Label>
        <p css={styles.settingsDescription}>{description}</p>
      </div>
      <div>
        <Toggle
          checked={!!checked}
          data-testid={id}
          id={id || uniqueId}
          offText={formatMessage('Off')}
          onChange={(_e, checked) => onToggle(!!checked)}
          onText={formatMessage('On')}
        />
      </div>
    </div>
  );
};

export { SettingToggle };
