// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { OpenConfirmModal } from '@bfc/ui-shared';
import { css, jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { Text } from 'office-ui-fabric-react/lib/Text';

import { dispatcherState } from '../../recoilModel';
import { navigateTo } from '../../utils/navigation';

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
  },
};

// -------------------- DeleteBotButton -------------------- //

type DeleteBotButtonProps = {
  projectId: string;
  scrollToSectionId: string;
};

export const DeleteBotButton: React.FC<DeleteBotButtonProps> = (props) => {
  const { projectId, scrollToSectionId = '' } = props;
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
              background: '#ffddcc',
              display: 'flex',
              flexDirection: 'row',
              marginBottom: '24px',
            }}
          >
            <FontIcon
              iconName="Warning12"
              style={{
                color: '#DD4400',
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
      checkboxProps: { kind: 'doubleConfirm' as const, checkboxLabel },
      confirmBtnText: formatMessage('Delete'),
    };
    const res = await OpenConfirmModal(title, null, settings);
    if (res) {
      await deleteBot(projectId);
      navigateTo('home');
    }
  };

  const deleteRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (deleteRef.current && scrollToSectionId === '#deleteBot') {
      deleteRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scrollToSectionId]);

  return (
    <div ref={deleteRef} css={marginBottom} id="deleteBot">
      <div css={deleteBotText}> {formatMessage('Delete this bot')}</div>
      <PrimaryButton styles={deleteBotButton} onClick={openDeleteBotModal}>
        {formatMessage('Delete')}
      </PrimaryButton>
    </div>
  );
};
