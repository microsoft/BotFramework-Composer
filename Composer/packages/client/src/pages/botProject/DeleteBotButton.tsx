// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React from 'react';
import { jsx, css } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { Button } from 'office-ui-fabric-react/lib/Button';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { OpenConfirmModal } from '@bfc/ui-shared';

import { navigateTo } from '../../utils/navigation';
import { dispatcherState } from '../../recoilModel';
import { colors } from '../../colors';

// -------------------- Styles -------------------- //

const marginBottom = css`
  margin-bottom: 140px;
`;

const deleteBotText = css`
  font-weight: ${FontWeights.semibold};
  font-size: 12px;
  margin-bottom: 20px;
`;

const deleteBotButton = {
  root: {
    height: 32,
    width: 82,
    background: colors.main,
    color: colors.textOnColor,
  },
  rootHovered: {
    background: colors.main,
    color: colors.textOnColor,
  },
};

// -------------------- DeleteBotButton -------------------- //

type DeleteBotButtonProps = {
  projectId: string;
};

export const DeleteBotButton: React.FC<DeleteBotButtonProps> = (props) => {
  const { projectId } = props;
  const { deleteBot } = useRecoilValue(dispatcherState);
  const openDeleteBotModal = async () => {
    const boldWarningText = formatMessage(
      'Warning: the action you are about to take cannot be undone. Going further will delete this bot and any related files in the bot project folder.'
    );
    const warningText = formatMessage('External resources will not be changed.');
    const title = formatMessage('Delete Bot');
    const checkboxLabel = formatMessage('I want to delete this bot');
    const settings = {
      onRenderContent: () => {
        return (
          <div
            style={{
              background: colors.errorBg,
              display: 'flex',
              flexDirection: 'row',
              marginBottom: '24px',
            }}
          >
            <FontIcon
              iconName="Warning12"
              style={{
                color: colors.error,
                fontSize: 36,
                padding: '32px',
              }}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Text
                block
                style={{
                  fontWeight: 'bold',
                  marginTop: '24px',
                  marginRight: '24px',
                  marginBottom: '24px',
                }}
              >
                {boldWarningText}
              </Text>
              <Text
                block
                style={{
                  marginRight: '24px',
                  marginBottom: '24px',
                }}
              >
                {warningText}
              </Text>
            </div>
          </div>
        );
      },
      disabled: true,
      checkboxLabel,
      confirmBtnText: formatMessage('Delete'),
    };
    const res = await OpenConfirmModal(title, null, settings);
    if (res) {
      await deleteBot(projectId);
      navigateTo('home');
    }
  };

  return (
    <div css={marginBottom}>
      <div css={deleteBotText}> {formatMessage('Delete this bot')}</div>
      <Button styles={deleteBotButton} onClick={openDeleteBotModal}>
        {formatMessage('Delete')}
      </Button>
    </div>
  );
};
