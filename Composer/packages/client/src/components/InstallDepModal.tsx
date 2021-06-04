/* eslint-disable react/no-danger */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { DialogTypes, DialogWrapper } from '@bfc/ui-shared/lib/components/DialogWrapper';
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/components/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/components/Dialog';
import React from 'react';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { Link } from 'office-ui-fabric-react/lib/Link';

import { colors } from '../colors';

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
          theme={colors.fluentTheme}
        />
        <DefaultButton text={formatMessage('Cancel')} onClick={props.onDismiss} />
      </DialogFooter>
    </DialogWrapper>
  );
};
