// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { Fragment, useState, useEffect } from 'react';
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import { PublishTarget } from '@bfc/shared';
import formatMessage from 'format-message';
import { ActionButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { useBoolean } from '@uifabric/react-hooks';
import Dialog, { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';

import { dispatcherState, settingsState, publishTypesState } from '../../recoilModel';
import { AuthDialog } from '../../components/Auth/AuthDialog';
import { isShowAuthDialog } from '../../utils/auth';

import { PublishProfileDialog } from './create-publish-profile/PublishProfileDialog';
import { actionButton } from './styles';

// -------------------- CreatePublishProfileDialog -------------------- //

type CreatePublishProfileDialogProps = {
  projectId: string;
  OnUpdateIsCreateProfileFromSkill: (isCreateProfileFromSkill: boolean) => void;
};

export const CreatePublishProfileDialog: React.FC<CreatePublishProfileDialogProps> = (props) => {
  const { projectId, OnUpdateIsCreateProfileFromSkill } = props;
  const { publishTargets } = useRecoilValue(settingsState(projectId));
  const { getPublishTargetTypes, setPublishTargets } = useRecoilValue(dispatcherState);
  const publishTypes = useRecoilValue(publishTypesState(projectId));

  const [dialogHidden, setDialogHidden] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(false);

  const dialogTitle = {
    title: formatMessage('Create a publish profile to continue'),
    subText: formatMessage(
      'To make your bot available as a remote skill you will need to provision Azure resources . This process may take a few minutes depending on the resources you select.'
    ),
  };
  const [currentPublishProfile, setCurrentPublishProfile] = useState<{ index: number; item: PublishTarget } | null>(
    null
  );

  useEffect(() => {
    if (projectId) {
      getPublishTargetTypes(projectId);
    }
  }, [projectId]);

  return (
    <Fragment>
      <Dialog
        dialogContentProps={{
          title: dialogTitle.title,
          subText: dialogTitle.subText,
        }}
        hidden={hideDialog}
        minWidth={960}
        modalProps={{
          isBlocking: true,
        }}
        onDismiss={toggleHideDialog}
      >
        <div css={{ height: '430px' }}>
          <ActionButton
            data-testid={'addNewPublishProfile'}
            styles={actionButton}
            onClick={() => {
              isShowAuthDialog(true) ? setShowAuthDialog(true) : setDialogHidden(false);
              toggleHideDialog();
            }}
          >
            {formatMessage('Create new publish profile')}
          </ActionButton>
        </div>
        <DialogFooter>
          <DefaultButton text={formatMessage('Cancel')} onClick={toggleHideDialog} />
        </DialogFooter>
      </Dialog>
      {showAuthDialog && (
        <AuthDialog
          needGraph
          next={() => {
            setDialogHidden(false);
          }}
          onDismiss={() => {
            setShowAuthDialog(false);
          }}
        />
      )}
      {!dialogHidden ? (
        <PublishProfileDialog
          closeDialog={() => {
            setDialogHidden(true);
            setCurrentPublishProfile(null);
          }}
          current={currentPublishProfile}
          projectId={projectId}
          OnUpdateIsCreateProfileFromSkill={OnUpdateIsCreateProfileFromSkill}
          setPublishTargets={setPublishTargets}
          targets={publishTargets || []}
          types={publishTypes}
        />
      ) : null}
    </Fragment>
  );
};
