// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { useId } from '@uifabric/react-hooks';
import kebabCase from 'lodash/kebabCase';
import { Dropdown, IDropdownProps } from 'office-ui-fabric-react/lib/Dropdown';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';

import * as styles from './styles';

interface ISettingToggleProps {
  description: React.ReactChild;
  id?: string;
  image: string;
  onChange: (key: string) => void;
  title: string;
  options: { key: string; text: string }[];
  selected?: string;
}

const SettingDropdown: React.FC<ISettingToggleProps> = (props) => {
  const { id, title, onChange, options, selected } = props;
  const uniqueId = useId(kebabCase(title));

  const onRenderLabel = (props: IDropdownProps | undefined) => {
    return (
      <div css={styles.labelContainer}>
        <div css={styles.customerLabel}> {props?.label} </div>
        <TooltipHost content={props?.label}>
          <Icon iconName={'Unknown'} styles={styles.icon} />
        </TooltipHost>
      </div>
    );
  };

  return (
    <div css={styles.settingsContainer}>
      <Dropdown
        id={id || uniqueId}
        label={formatMessage('Composer language is the language of Composer UI')}
        options={options}
        selectedKey={selected}
        styles={{ root: { width: '100%' } }}
        onChange={(_e, option) => onChange(option?.key?.toString() ?? '')}
        onRenderLabel={onRenderLabel}
      />
    </div>
  );
};

export { SettingDropdown };
