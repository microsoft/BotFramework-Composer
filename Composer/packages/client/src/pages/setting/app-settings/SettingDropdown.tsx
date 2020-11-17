// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { useId } from '@uifabric/react-hooks';
import kebabCase from 'lodash/kebabCase';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';

import * as styles from './styles';

interface ISettingToggleProps {
  description: React.ReactChild;
  id?: string;
  image: string;
  onChange: (key: string) => void;
  title: string;
  options: { key: string; text: string }[];
  selected?: string;
  dropdownWidth?: number;
}

const SettingDropdown: React.FC<ISettingToggleProps> = (props) => {
  const { id, title, description, dropdownWidth, image, onChange, options, selected } = props;
  const uniqueId = useId(kebabCase(title));

  return (
    <div css={styles.settingsContainer}>
      <div aria-hidden="true" css={styles.image} role="presentation">
        {image && <img aria-hidden alt={''} src={image} />}
      </div>
      <div css={styles.settingsContent}>
        <Label htmlFor={id || uniqueId} styles={{ root: { padding: 0 } }}>
          {title}
        </Label>
        <p css={styles.settingsDescription}>{description}</p>
      </div>
      <div>
        <Dropdown
          dropdownWidth={dropdownWidth}
          id={id || uniqueId}
          options={options}
          selectedKey={selected}
          onChange={(_e, option) => onChange(option?.key?.toString() ?? '')}
        />
      </div>
    </div>
  );
};

export { SettingDropdown };
