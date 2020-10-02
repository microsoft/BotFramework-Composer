// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { FontIcon } from 'office-ui-fabric-react';
import React from 'react';

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

export const ExpressionSwitchWindow = (props: { type: string; onSwitchToExpression: () => void }) => {
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
        {`Write in expression`}
      </div>
    </React.Fragment>
  );
};
