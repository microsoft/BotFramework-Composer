// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { FontIcon } from '@fluentui/react/lib/Icon';
import React from 'react';
import formatMessage from 'format-message';
import { FluentTheme, SharedColors } from '@fluentui/theme';

const styles = {
  fieldTypeText: css`
    height: 32px;
    font-style: italic;
    color: ${FluentTheme.palette.neutralSecondary};
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
    // center icon with text
    margin-top: 2px;
    color: ${SharedColors.cyanBlue10};
  `,
};

type ExpressionSwitchWindowProps = { kind: string; onSwitchToExpression: () => void };

export const ExpressionSwitchWindow = (props: ExpressionSwitchWindowProps) => {
  const { kind, onSwitchToExpression } = props;

  return (
    <React.Fragment>
      <div css={styles.fieldTypeText}>{formatMessage('Start typing {kind} or', { kind: kind })}</div>

      <div css={styles.switchToExpressionText} onClick={onSwitchToExpression}>
        <FontIcon css={styles.icon} iconName={'CalculatorEqualTo'} />
        <span>{formatMessage(`Write an expression`)}</span>
      </div>
    </React.Fragment>
  );
};
