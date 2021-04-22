// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useId } from '@uifabric/react-hooks';
import kebabCase from 'lodash/kebabCase';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import React from 'react';

import * as styles from './styles';

const defaultItemHeight = 36;
const defaultItemCountBeforeScroll = 10;
const defaultDropdownWidth = 300;

type Props = {
  label: string;
  options: IDropdownOption[];
  tooltip?: React.ReactNode;
  id?: string;
  selected?: string;
  width?: number;
  itemCountBeforeScroll?: number;
  onChange: (key: string) => void;
};

export const SettingDropdown: React.FC<Props> = ({
  id,
  label,
  tooltip,
  width = defaultDropdownWidth,
  itemCountBeforeScroll = defaultItemCountBeforeScroll,
  onChange,
  options,
  selected,
}) => {
  const uniqueId = useId(kebabCase(label));

  const renderLabel = React.useCallback(({ label: dropdownLabel }) => {
    return (
      <div css={styles.labelContainer}>
        <div css={styles.customerLabel}>{dropdownLabel}</div>
        <TooltipHost content={tooltip ?? dropdownLabel}>
          <Icon iconName="Unknown" styles={styles.icon} />
        </TooltipHost>
      </div>
    );
  }, []);

  return (
    <div css={styles.settingsContainer}>
      <Dropdown
        calloutProps={{ calloutMaxHeight: defaultItemHeight * itemCountBeforeScroll }}
        id={id || uniqueId}
        label={label}
        options={options}
        selectedKey={selected}
        styles={{ root: { width } }}
        onChange={(_e, option) => onChange(option?.key?.toString() ?? '')}
        onRenderLabel={renderLabel}
      />
    </div>
  );
};
