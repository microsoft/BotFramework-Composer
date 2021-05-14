// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import { FluentTheme, SharedColors } from '@uifabric/fluent-theme';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';
import formatMessage from 'format-message';
import { NeutralColors } from '@uifabric/fluent-theme';

import { NextStep } from './types';

type TaskProps = {
  step: NextStep;
};

const getStartedStepStyle = (disabled?: boolean) => css`
  margin-bottom: 10px;
  pointer-events: ${disabled ? 'none' : 'auto'};
  opacity: ${disabled ? 0.4 : 1};
`;

const stepDescriptionStyle = css`
  margin-left: 36px;
  font-size: 14px;
  color: ${NeutralColors.gray120};
  margin-top: -4px;
`;

export const GetStartedTask: React.FC<TaskProps> = (props) => {
  const icon = props.step.checked ? 'CompletedSolid' : props.step.required ? 'Error' : 'Completed';
  const color = props.step.checked
    ? FluentTheme.palette.green
    : props.step.required
    ? SharedColors.orange20
    : SharedColors.cyanBlue10;
  return (
    <div css={getStartedStepStyle(props.step.hideFeatureStep)}>
      <ActionButton
        iconProps={{ iconName: icon, id: props.step.key }}
        styles={{
          root: { padding: '0px', display: 'block', fontSize: 16 },
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
      <div css={stepDescriptionStyle}>
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
