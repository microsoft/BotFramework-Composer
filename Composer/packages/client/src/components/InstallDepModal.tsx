/* eslint-disable react/no-danger */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { DialogTypes, DialogWrapper } from '@bfc/ui-shared/lib/components/DialogWrapper';
import { jsx } from '@emotion/react';
import formatMessage from 'format-message';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/components/Button';
import { DialogFooter } from '@fluentui/react/lib/components/Dialog';
import React from 'react';
import { Text } from '@fluentui/react/lib/Text';
import { Link } from '@fluentui/react/lib/Link';

type InstallDepModalProps = {
  onDismiss: () => void;
  title: string;
  text: React.ReactNode;
  downloadLink: string;
  downloadLinkText: string;
  learnMore?: {
    text: string;
    link: string;
  };
};

export const InstallDepModal: React.FC<InstallDepModalProps> = (props) => {
  return (
    <DialogWrapper isOpen dialogType={DialogTypes.DesignFlow} title={props.title} onDismiss={props.onDismiss}>
      <Text>
        <span>{props.text}</span>
        {props.learnMore && (
          <span>
            &nbsp;
            <Link href={props.learnMore.link} target="_blank">
              {props.learnMore.text}
            </Link>
          </span>
        )}
      </Text>
      <DialogFooter css={{ marginTop: 25 }}>
        <PrimaryButton
          data-testid="InstallButton"
          href={props.downloadLink}
          target="_blank"
          text={props.downloadLinkText}
        />
        <DefaultButton text={formatMessage('Cancel')} onClick={props.onDismiss} />
      </DialogFooter>
    </DialogWrapper>
  );
};
