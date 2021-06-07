// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect } from 'react';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import isEmpty from 'lodash/isEmpty';

import { colors } from '../../colors';
import { StateError } from '../../recoilModel/types';

import { consoleStyle, dialog } from './styles';

type ErrorPopupProps = {
  error: StateError;
  onDismiss: () => void;
};

const formatErrorTitle = (summary: string): string => {
  if (!summary) return formatMessage('Error');
  return summary.length > 20 ? summary.substring(0, 20) + '...' : summary;
};

const formatErrorDetail = (error: StateError): React.ReactElement => {
  const helpText = formatMessage.rich('If this problem persists, please file an issue on <a>GitHub</a>', {
    a: ({ children }) => (
      <a
        key="composer-github-issues-page"
        href={'https://github.com/microsoft/BotFramework-Composer/issues'}
        rel="noopener noreferrer"
        target="_blank"
      >
        {children}
      </a>
    ),
  });
  const message = error.message;
  return (
    <section>
      {helpText}
      {message && <details>{message}</details>}
    </section>
  );
};

export const ErrorPopup = (props: ErrorPopupProps) => {
  const [hidden, setHidden] = useState(isEmpty(props.error) ? true : false);

  const closeDialog = () => {
    setHidden(true);
    props.onDismiss();
  };

  useEffect(() => {
    if (isEmpty(props.error)) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  }, [props.error]);

  const title = formatErrorTitle(props?.error?.summary);
  const detail = props.error ? formatErrorDetail(props.error) : '';

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title,
        styles: dialog,
      }}
      hidden={hidden}
      modalProps={{
        isBlocking: false,
        styles: { main: { maxWidth: 450 } },
      }}
      onDismiss={closeDialog}
    >
      <div css={consoleStyle}>{detail}</div>
      <DialogFooter>
        <PrimaryButton text={formatMessage('OK')} theme={colors.fluentTheme} onClick={closeDialog} />
      </DialogFooter>
    </Dialog>
  );
};
