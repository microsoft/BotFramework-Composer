// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { FluentTheme, SharedColors } from '@uifabric/fluent-theme';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';
import formatMessage from 'format-message';

import { NextSteps } from './types';

type TaskProps = {
  step: NextSteps;
};

export const GetStartedTask: React.FC<TaskProps> = (props) => {
  const icon = props.step.checked ? 'CompletedSolid' : props.step.required ? 'Error' : 'Completed';
  const color = props.step.checked
    ? FluentTheme.palette.green
    : props.step.required
    ? SharedColors.orange20
    : SharedColors.cyanBlue10;
  return (
    <div css={{ marginBottom: 20 }}>
      <ActionButton
        iconProps={{ iconName: icon, id: props.step.key }}
        styles={{
          root: { display: 'block', fontSize: 16 },
          icon: {
            fontSize: props.step.checked ? 20 : 22,
            color: color,
          },
        }}
        onClick={() => {
          props.step.onClick(props.step);
        }}
      >
        {props.step.label}
      </ActionButton>
      <div css={{ marginLeft: 40, fontSize: 12 }}>
        <span>{props.step.description}</span>
        {props.step.learnMore && (
          <span>
            &nbsp;
            <Link href={props.step.learnMore} target="_blank">
              {formatMessage('Learn more')}
            </Link>
          </span>
        )}
      </div>
    </div>
  );
};
