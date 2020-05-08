// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { FC } from 'react';

import { SingleLineDiv } from '../styled';

type Expression = string;
type AssignmentValue = string | number | boolean | Expression | object | any[];

export interface PropertyAssignmentProps {
  property: string;
  value?: AssignmentValue;
}

const AssignmentOpt = ':';
const NullValuePlaceholder = '?';

const serializeAssignmentValue = (value?: AssignmentValue): string | number | boolean => {
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return value ?? NullValuePlaceholder;
};

export const PropertyAssignment: FC<PropertyAssignmentProps> = ({ property, value }) => {
  const valueStr = serializeAssignmentValue(value);
  const content = `${property} ${AssignmentOpt} ${valueStr}`;
  return (
    <SingleLineDiv height={16} title={content}>
      {content}
    </SingleLineDiv>
  );
};
