// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/react';
import { DialogFooter } from '@fluentui/react/lib/Dialog';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { ScrollablePane } from '@fluentui/react/lib/ScrollablePane';
import formatMessage from 'format-message';
import ReactMarkdown from 'react-markdown';
import styled from '@emotion/styled';

import { DialogTypes, DialogWrapper } from '../DialogWrapper';

type DisplayMarkdownDialogProps = {
  title: string;
  content: string;
  hidden: boolean;
  onDismiss: () => void;
};

const ScrollablePaneWrapper = styled.div`
  height: 500px;
  position: relative;
  border: 1px solid #333;
  @media screen and (max-width: 960px) /* 125% zoom */ {
    max-height: calc(100vh - 160px);
  }
`;

export const DisplayMarkdownDialog = (props: DisplayMarkdownDialogProps) => {
  return (
    <DialogWrapper
      dialogType={DialogTypes.CreateFlow}
      isOpen={!props.hidden}
      title={props.title}
      onDismiss={props.onDismiss}
    >
      <ScrollablePaneWrapper>
        <ScrollablePane>
          <ReactMarkdown css={{ padding: 20 }} linkTarget="_blank">
            {props.content}
          </ReactMarkdown>
        </ScrollablePane>
      </ScrollablePaneWrapper>
      <DialogFooter>
        <PrimaryButton text={formatMessage('OK')} onClick={props.onDismiss} />
      </DialogFooter>
    </DialogWrapper>
  );
};
