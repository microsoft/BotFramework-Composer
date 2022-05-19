// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { DropdownField } from '@bfc/ui-shared';
import { jsx } from '@emotion/react';
import { useId } from '@fluentui/react-hooks';
import kebabCase from 'lodash/kebabCase';
import { FontSizes, mergeStyleSets } from '@fluentui/react/lib/Styling';
import { IDropdownOption } from '@fluentui/react/lib/Dropdown';
import React from 'react';

import { customFieldLabel } from '../../../styles';

import * as styles from './styles';

const defaultItemHeight = 36;
const defaultItemCountBeforeScroll = 10;
const defaultDropdownWidth = 300;

type Props = {
  label: string;
  options: IDropdownOption[];
  tooltip?: string;
  id?: string;
  selected?: string;
  width?: number;
  itemCountBeforeScroll?: number;
  onChange: (key: string) => void;
};

const tooltipStyles = {
  subComponentStyles: {
    helpTooltip: {
      helpIcon: {
        fontSize: FontSizes.small,
      },
    },
  },
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

  return (
    <div css={styles.settingsContainer}>
      <DropdownField
        calloutProps={{ calloutMaxHeight: defaultItemHeight * itemCountBeforeScroll }}
        id={id || uniqueId}
        label={label}
        options={options}
        selectedKey={selected}
        styles={mergeStyleSets(customFieldLabel, tooltipStyles, { root: { width } })}
        tooltip={tooltip ?? label}
        onChange={(_e, option) => onChange(option?.key?.toString() ?? '')}
      />
    </div>
  );
};
