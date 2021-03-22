// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { CompoundButton } from 'office-ui-fabric-react/lib/Button';

import { NextSteps } from './GetStartedNextSteps';

type TaskProps = {
  step: NextSteps;
};

export const GetStartedTask: React.FC<TaskProps> = (props) => {
  return (
    <CompoundButton
      iconProps={{ iconName: props.step.checked ? 'Completed' : 'Error' }}
      secondaryText={props.step.description}
      styles={{
        root: { border: 0 },
        icon: { color: props.step.required ? (props.step.checked ? '#0F0' : '#EF7100') : '#000' },
      }}
      onClick={() => {
        props.step.onClick(props.step);
      }}
    >
      {props.step.label}
    </CompoundButton>
  );
};
