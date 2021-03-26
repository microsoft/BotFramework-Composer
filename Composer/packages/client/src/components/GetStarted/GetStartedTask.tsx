// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Fragment } from 'react';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';

import { NextSteps } from './GetStartedNextSteps';

type TaskProps = {
  step: NextSteps;
};

export const GetStartedTask: React.FC<TaskProps> = (props) => {
  const icon = props.step.checked ? 'CompletedSolid' : props.step.required ? 'Error' : 'Completed';
  const color = props.step.checked ? '#219653' : props.step.required ? '#ca5010' : '#0078D4';
  return (
    <div css={{ marginBottom: 20 }}>
      <ActionButton
        iconProps={{ iconName: icon }}
        id={props.step.key}
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
        {props.step.description}
        {props.step.learnMore && (
          <Fragment>
            &nbsp;
            <Link href={props.step.learnMore} target="_new">
              Learn more
            </Link>
          </Fragment>
        )}
      </div>
    </div>
  );
};
