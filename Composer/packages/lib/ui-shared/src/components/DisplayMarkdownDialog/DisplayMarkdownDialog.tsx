// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { ScrollablePane } from 'office-ui-fabric-react/lib/ScrollablePane';
import formatMessage from 'format-message';
import ReactMarkdown from 'react-markdown';

import { DialogTypes, DialogWrapper } from '../DialogWrapper';

type DisplayMarkdownDialogProps = {
  title: string;
  content: string;
  hidden: boolean;
  onDismiss: () => void;
};

export const DisplayMarkdownDialog = (props: DisplayMarkdownDialogProps) => {
  return (
    <DialogWrapper
      dialogType={DialogTypes.CreateFlow}
      isOpen={!props.hidden}
      title={props.title}
      onDismiss={props.onDismiss}
    >
      <div css={{ height: 500, position: 'relative', border: '1px solid #333' }}>
        <ScrollablePane>
          <ReactMarkdown css={{ padding: 20 }} linkTarget="_blank">
            {props.content}
          </ReactMarkdown>
        </ScrollablePane>
      </div>
      <DialogFooter>
        <PrimaryButton text={formatMessage('OK')} onClick={props.onDismiss} />
      </DialogFooter>
    </DialogWrapper>
  );
};
