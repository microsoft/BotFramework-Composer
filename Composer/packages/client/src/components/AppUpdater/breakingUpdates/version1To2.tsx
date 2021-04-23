// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useCallback, useMemo, useState } from 'react';
import { DefaultButton, PrimaryButton, IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { Dialog, DialogType, IDialogContentStyles } from 'office-ui-fabric-react/lib/Dialog';
import { NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';

import { BreakingUpdateProps } from './types';

const dismissButton: Partial<IButtonStyles> = {
  root: {
    marginRight: '6px;',
    marginLeft: 'auto',
  },
};

const dialogContent: Partial<IDialogContentStyles> = {
  content: { color: NeutralColors.black },
};

const dialogContentWithoutHeader: Partial<IDialogContentStyles> = {
  ...dialogContent,
  header: {
    display: 'none',
  },
  inner: {
    padding: '36px 24px 24px 24px',
  },
};

const buttonRow = css`
  display: flex;
  flex-flow: row nowrap;
  justify-items: flex-end;
`;

const gotItButton = css`
  margin-left: auto;
`;

const updateCancelledCopy = css`
  margin-top: 0;
  margin-bottom: 27px;
`;

type ModalState = 'Default' | 'PressedNotNow';

export const Version1To2Content: React.FC<BreakingUpdateProps> = (props) => {
  const { onCancel, onContinue, updateSettings } = props;
  const [currentState, setCurrentState] = useState<ModalState>('Default');
  const onNotNow = useCallback(() => {
    setCurrentState('PressedNotNow');
    // disable auto update
  }, []);
  const onUpdateAndRestart = useCallback(() => {
    // update auto update settings here before continuing to standard upate flow
    onContinue();
  }, []);
  const isManualCheck = useMemo(() => updateSettings.autoDownload, [updateSettings]);

  return currentState === 'Default' ? (
    <Dialog
      dialogContentProps={{
        styles: dialogContent,
        title: formatMessage('Composer 2.0 is now available!'),
        type: DialogType.largeHeader,
      }}
      hidden={false}
      maxWidth={427}
      minWidth={427}
      modalProps={{
        isBlocking: false,
      }}
    >
      <p>
        Bot Framework Composer 2.0 provides more built-in capabilities so you can build complex bots quickly. Update to
        Composer 2.0 for advanced bot templates, prebuilt components, and a runtime that is fully extensible through
        packages.
      </p>
      <p>
        Note: If your bot is using custom actions, they will not be supported in Composer 2.0.{' '}
        <a href="https://aka.ms/bot-framework-composer-2.0">Learn more about updating to Composer 2.0.</a>
      </p>
      <div css={buttonRow}>
        {isManualCheck ? (
          <DefaultButton styles={dismissButton} text={formatMessage('Cancel')} onClick={onCancel} />
        ) : (
          <DefaultButton styles={dismissButton} text={formatMessage('Not now')} onClick={onNotNow} />
        )}
        <PrimaryButton text={formatMessage('Update and restart')} onClick={onUpdateAndRestart} />
      </div>
    </Dialog>
  ) : (
    <Dialog
      dialogContentProps={{
        styles: dialogContentWithoutHeader,
        title: undefined,
        type: DialogType.normal,
      }}
      hidden={false}
      maxWidth={427}
      minWidth={427}
      modalProps={{
        isBlocking: false,
      }}
    >
      <p css={updateCancelledCopy}>
        Update cancelled. Auto-update has been turned off for this release. You can update at any time by selecting{' '}
        <b>Help &gt; Check for updates.</b>
      </p>
      <div css={buttonRow}>
        <PrimaryButton css={gotItButton} text={formatMessage('Got it!')} onClick={onCancel} />
      </div>
    </Dialog>
  );
};
