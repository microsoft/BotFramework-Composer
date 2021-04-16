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
import { mergeStyles } from 'office-ui-fabric-react/lib/Styling';

const dialogFooterClass = mergeStyles({
  marginTop: '25px',
});

type InstallDepModalProps = {
  setIsOpen: Function;
  isOpen: boolean;
  title: string;
  text: string;
  link: string;
  linkText: string;
  learnMore?: string;
  learnMoreText?: string;
};

export const InstallDepModal: React.FC<InstallDepModalProps> = (props) => {
  return (
    <DialogWrapper
      dialogType={DialogTypes.DesignFlow}
      isOpen={props.isOpen}
      title={props.title}
      onDismiss={() => {
        props.setIsOpen(false);
      }}
    >
      <Text>
        <span>{props.text}</span>
        {props.learnMore && (
          <span>
            &nbsp;
            <Link href={props.learnMore} target="_blank">
              {props.learnMoreText}
            </Link>
          </span>
        )}
      </Text>
      <DialogFooter className={dialogFooterClass}>
        <PrimaryButton data-testid="InstallButton" href={props.link} target="_blank" text={props.linkText} />
        <DefaultButton
          text={formatMessage('Cancel')}
          onClick={() => {
            props.setIsOpen(false);
          }}
        />
      </DialogFooter>
    </DialogWrapper>
  );
};
