// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { OpenConfirmModal } from '@bfc/ui-shared';
import { css, jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';

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

export const openDeleteBotModal = async (onConfirm: () => Promise<void>) => {
  const warningText = formatMessage(
    'Are you sure you want to delete your bot? This action cannot be undone and your bot and all related files in the bot project folder will be permanently deleted. Your Azure resources will remain unchanged.'
  );
  const title = formatMessage('Delete Bot');
  const settings = {
    onRenderContent: () => {
      return <div>{warningText}</div>;
    },
    confirmText: formatMessage('Yes, delete'),
  };
  const res = await OpenConfirmModal(title, null, settings);
  if (res) {
    await onConfirm();
  }
};

export const DeleteBotButton: React.FC<DeleteBotButtonProps> = (props) => {
  const { projectId, scrollToSectionId = '' } = props;
  const { deleteBot } = useRecoilValue(dispatcherState);

  const deleteRef = React.useRef<HTMLDivElement>(null);

  const onConfirm = async () => {
    await deleteBot(projectId);
    navigateTo('home');
  };

  useEffect(() => {
    if (deleteRef.current && scrollToSectionId === '#deleteBot') {
      deleteRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scrollToSectionId]);

  return (
    <div ref={deleteRef} css={marginBottom} id="deleteBot">
      <div css={deleteBotText}> {formatMessage('Delete this bot')}</div>
      <PrimaryButton styles={deleteBotButton} onClick={() => openDeleteBotModal(onConfirm)}>
        {formatMessage('Delete')}
      </PrimaryButton>
    </div>
  );
};
