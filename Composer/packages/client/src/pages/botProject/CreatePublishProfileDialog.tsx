// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { Fragment } from 'react';
import { jsx, css } from '@emotion/react';
import formatMessage from 'format-message';
import { ActionButton, DefaultButton } from '@fluentui/react/lib/Button';
import { useBoolean } from '@fluentui/react-hooks';
import Dialog, { DialogFooter } from '@fluentui/react/lib/Dialog';
import { SharedColors } from '@fluentui/theme';
import { FontWeights } from '@fluentui/react/lib/Styling';

// -------------------- CreatePublishProfileDialog -------------------- //

type CreatePublishProfileDialogProps = {
  onShowPublishProfileWrapperDialog: () => void;
};

// -------------------- Style -------------------- //
const actionButton = {
  root: {
    fontSize: 12,
    fontWeight: FontWeights.regular,
    color: SharedColors.cyanBlue10,
    paddingLeft: 0,
    marginLeft: 5,
  },
};

export const CreatePublishProfileDialog: React.FC<CreatePublishProfileDialogProps> = (props) => {
  const { onShowPublishProfileWrapperDialog } = props;

  const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(false);

  const dialogTitle = {
    title: formatMessage('Create a publish profile to continue'),
    subText: formatMessage(
      'To make your bot available as a remote skill you will need to provision Azure resources . This process may take a few minutes depending on the resources you select.'
    ),
  };

  return (
    <Fragment>
      <Dialog
        dialogContentProps={{
          title: dialogTitle.title,
          subText: dialogTitle.subText,
        }}
        hidden={hideDialog}
        maxWidth={960}
        modalProps={{
          isBlocking: true,
          isClickableOutsideFocusTrap: true,
        }}
        styles={{
          main: {
            flex: 'auto',
          },
        }}
        onDismiss={toggleHideDialog}
      >
        <div
          css={css`
            height: 430px;
            @media screen and (max-width: 960px) /* 125% zoom */ {
              height: auto;
            }
          `}
        >
          <ActionButton
            data-testid={'addNewPublishProfile'}
            styles={actionButton}
            onClick={() => {
              toggleHideDialog();
              onShowPublishProfileWrapperDialog();
            }}
          >
            {formatMessage('Create new publish profile')}
          </ActionButton>
        </div>
        <DialogFooter>
          <DefaultButton text={formatMessage('Cancel')} onClick={toggleHideDialog} />
        </DialogFooter>
      </Dialog>
    </Fragment>
  );
};
