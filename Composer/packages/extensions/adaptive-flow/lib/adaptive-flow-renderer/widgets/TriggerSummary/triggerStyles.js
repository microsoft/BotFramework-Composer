// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License
import { __assign } from 'tslib';
import { TriggerSize } from '../../constants/ElementSizes';
import { ObiColors } from '../../constants/ElementColors';
export var triggerContainerStyle = __assign(__assign({}, TriggerSize), {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'flex-end',
  paddingBottom: '5px',
  boxSizing: 'border-box',
});
export var triggerContentStyle = {
  wordBreak: 'break-all',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};
export var titleStyle = {
  whiteSpace: 'nowrap',
  color: 'black',
  fontFamily: 'Segoe UI',
  fontSize: '18px',
  lineHeight: '24px',
  fontWeight: 600,
  display: 'flex',
};
export var titleContentStyle = {
  fontSize: '18px',
  fontWeight: 600,
  margin: '0px',
};
export var subtitleStyle = {
  whiteSpace: 'nowrap',
  color: ObiColors.LightGray,
  fontFamily: 'Segoe UI',
  fontSize: '12px',
  lineHeight: '14px',
};
export var triggerIconStyle = {
  lineHeight: '24px',
  marginRight: '5px',
};
//# sourceMappingURL=triggerStyles.js.map
