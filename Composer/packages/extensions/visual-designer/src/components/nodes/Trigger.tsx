// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */

import { ConceptLabels } from '@bfc/shared';
import { jsx } from '@emotion/core';
import { Icon } from 'office-ui-fabric-react';

import { TriggerSize } from '../../constants/ElementSizes';

function getLabel(data: any): string {
  const labelOverrides = ConceptLabels[data.$type];
  if (labelOverrides) {
    return labelOverrides.subtitle || labelOverrides.title;
  }
  return data.$type;
}

function getName(data: any): string {
  if (data && data.$designer && data.$designer.name) {
    return data.$designer.name;
  }
  return getLabel(data);
}

const titleStyle: any = {
  whiteSpace: 'nowrap',
  color: '#333333',
  fontFamily: 'Segoe UI',
  fontSize: '18px',
  lineHeight: '24px',
};

const subtitleStyle: any = {
  whiteSpace: 'nowrap',
  color: '#BDBDBD',
  fontFamily: 'Segoe UI',
  fontSize: '10px',
  lineHeight: '14px',
};

export const Trigger = ({ data, onClick = () => {} }): JSX.Element => {
  const name = getName(data);
  const label = getLabel(data);

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
      <div
        className="Trigger--Content"
        css={{ wordBreak: 'break-all', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <div className="Trigger--Title" css={titleStyle}>
          <Icon iconName="Flow" style={{ lineHeight: '24px', marginRight: '5px' }} />
          <span>{name}</span>
        </div>
        <div className="Trigger--Subtitle" css={subtitleStyle}>
          {label}
        </div>
      </div>
    </div>
  );
};
