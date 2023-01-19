// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FluentTheme } from '@fluentui/theme';
import { Label } from '@fluentui/react/lib/Label';
import React from 'react';

import { ItemWithTooltip } from '../../components/ItemWithTooltip';
import { ModalityType } from '../types';

const labelStyles = { root: { fontSize: FluentTheme.fonts.small.fontSize } };

type Props = {
  title: string;
  modalityType: ModalityType;
  helpMessage: string | JSX.Element | JSX.Element[];
};

export const ModalityEditorTitle = React.memo(({ title, modalityType, helpMessage }: Props) => (
  <ItemWithTooltip
    aria-label={title}
    itemText={<Label styles={labelStyles}>{title}</Label>}
    tooltipId={`${modalityType}ModalityTitle`}
    tooltipText={helpMessage}
  />
));
