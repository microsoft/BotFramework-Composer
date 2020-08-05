// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect } from 'react';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import isEmpty from 'lodash/isEmpty';

import { StateError } from '../../recoilModel/types';

import { consoleStyle, dialog } from './styles';

type ErrorPopupProps = {
  error: StateError;
  onDismiss: () => void;
};

const formatErrorTitle = (error: StateError): string => {
  const { summary } = error;
  if (!summary) return '';
  return summary.length > 20 ? summary.substring(0, 20) + '...' : summary;
};

const formatErrorDetail = (error: StateError): React.ReactElement => {
  const helpText = formatMessage('If this problem persists, please file an issue on');
  const message = error.message;
  return (
    <section>
      {helpText}
      <a href={'https://github.com/microsoft/BotFramework-Composer/issues'}>GitHub</a>
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

  const title = props.error ? formatErrorTitle(props.error) : '';
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
        <PrimaryButton text={formatMessage('Ok')} onClick={closeDialog} />
      </DialogFooter>
    </Dialog>
  );
};
