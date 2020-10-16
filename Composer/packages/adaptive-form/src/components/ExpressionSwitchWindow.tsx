// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import React from 'react';
import formatMessage from 'format-message';

const styles = {
  fieldTypeText: css`
    height: 32px;
    font-style: italic;
    color: #8a8886;
    padding: 0 4px;
    width: 100%;
    display: flex;
    align-items: center;
    font-size: 15px;
  `,
  switchToExpressionText: css`
    height: 32px;
    cursor: pointer;
    padding: 0 4px;
    width: 100%;
    display: flex;
    align-items: center;
    font-size: 15px;
  `,
  icon: css`
    margin-right: 5px;
  `,
};

type ExpressionSwitchWindowProps = { type: string; onSwitchToExpression: () => void };

export const ExpressionSwitchWindow = (props: ExpressionSwitchWindowProps) => {
  const { type, onSwitchToExpression } = props;

  return (
    <React.Fragment>
      <div css={styles.fieldTypeText}>{`Start typing ${type} or`}</div>

      <div
        css={styles.switchToExpressionText}
        onClick={() => {
          onSwitchToExpression();
        }}
      >
        <FontIcon css={styles.icon} iconName={'CalculatorEqualTo'} />
        {formatMessage(`Write in expression`)}
      </div>
    </React.Fragment>
  );
};
