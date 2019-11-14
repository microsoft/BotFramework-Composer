// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */

import { ConceptLabels } from '@bfc/shared';
import { jsx } from '@emotion/core';
import { Icon } from 'office-ui-fabric-react';

import { TriggerSize } from '../../constants/ElementSizes';

function getLabel(data: any): string {
  const labelOverrides = ConceptLabels[data.$type];
  return labelOverrides.subtitle || labelOverrides.title || data.$type;
}

function getName(data: any): string {
  if (data && data.$designer && data.$designer.name) {
    return data.$designer.name;
  }
  return getLabel(data);
}

const LINE_HEIGHT = 24;

const nameTextStyle: any = {
  whiteSpace: 'nowrap',
  color: '#333333',
  fontFamily: 'Segoe UI',
  fontSize: '18px',
  lineHeight: LINE_HEIGHT + 'px',
};

const lableTextStyle: any = {
  whiteSpace: 'nowrap',
  color: '#BDBDBD',
  fontFamily: 'Segoe UI',
  fontSize: '18px',
  lineHeight: LINE_HEIGHT + 'px',
};

export const Trigger = ({ data, onClick = () => {} }): JSX.Element => {
  const name = getName(data);
  const label = `(${getLabel(data)})`;
  const withLineBreak: boolean = name.length + label.length > 35;
  const containerHeight = withLineBreak ? LINE_HEIGHT * 2 : LINE_HEIGHT;

  return (
    <div
      className="Trigger--Container"
      css={{
        ...TriggerSize,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingBottom: '5px',
        boxSizing: 'border-box',
      }}
    >
      <div className="Trigger--Icon" style={{ height: containerHeight + 'px' }}>
        <Icon iconName="Flow" style={{ lineHeight: LINE_HEIGHT + 'px', marginRight: '5px' }} />
      </div>
      <div
        className="Trigger--Content"
        css={{ wordBreak: withLineBreak ? 'break-all' : 'initial', height: containerHeight + 'px' }}
      >
        <span css={nameTextStyle}>{name}</span>
        <span css={lableTextStyle}>{label}</span>
      </div>
    </div>
  );
};
