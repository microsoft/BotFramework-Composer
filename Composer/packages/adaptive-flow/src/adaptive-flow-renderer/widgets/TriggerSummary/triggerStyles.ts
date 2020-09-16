// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { TriggerSize } from '../../constants/ElementSizes';
import { ObiColors } from '../../constants/ElementColors';

export const triggerContainerStyle: any = {
  ...TriggerSize,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'flex-end',
  paddingBottom: '5px',
  boxSizing: 'border-box',
};

export const triggerContentStyle: any = {
  wordBreak: 'break-all',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

export const titleStyle: any = {
  whiteSpace: 'nowrap',
  color: 'black',
  fontFamily: 'Segoe UI',
  fontSize: '18px',
  lineHeight: '24px',
  fontWeight: 600,
  display: 'flex',
};

export const titleContentStyle = {
  fontSize: '18px',
  fontWeight: 600,
  margin: '0px',
};
export const subtitleStyle: any = {
  whiteSpace: 'nowrap',
  color: ObiColors.LightGray,
  fontFamily: 'Segoe UI',
  fontSize: '12px',
  lineHeight: '14px',
};

export const triggerIconStyle = {
  lineHeight: '24px',
  marginRight: '5px',
};
