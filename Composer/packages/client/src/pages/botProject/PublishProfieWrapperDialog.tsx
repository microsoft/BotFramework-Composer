// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { Fragment, useState, useEffect } from 'react';
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import { PublishTarget } from '@bfc/shared';

import { dispatcherState, settingsState, publishTypesState } from '../../recoilModel';
import { AuthDialog } from '../../components/Auth/AuthDialog';
import { isShowAuthDialog } from '../../utils/auth';

import { PublishProfileDialog } from './create-publish-profile/PublishProfileDialog';

// -------------------- CreatePublishProfileDialog -------------------- //

type PublishProfileWrapperDialogProps = {
  projectId: string;
  onClose: () => void;
  onOpen: () => void;
  onUpdateIsCreateProfileFromSkill: (isCreateProfileFromSkill: boolean) => void;
};

export const PublishProfileWrapperDialog: React.FC<PublishProfileWrapperDialogProps> = (props) => {
  const { projectId, onClose, onOpen, onUpdateIsCreateProfileFromSkill } = props;
  const { publishTargets } = useRecoilValue(settingsState(projectId));
  const { getPublishTargetTypes, setPublishTargets } = useRecoilValue(dispatcherState);
  const publishTypes = useRecoilValue(publishTypesState(projectId));

  const [showPublishProfileDialog, setShowPublishProfileDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const [currentPublishProfile, setCurrentPublishProfile] = useState<{ index: number; item: PublishTarget } | null>(
    null
  );

  useEffect(() => {
    isShowAuthDialog(true) ? setShowAuthDialog(true) : setShowPublishProfileDialog(true);
  });

  useEffect(() => {
    if (projectId) {
      getPublishTargetTypes(projectId);
    }
  }, [projectId]);

  return (
    <Fragment>
      {showAuthDialog && (
        <AuthDialog
          needGraph
          next={() => {
            setShowPublishProfileDialog(true);
            onOpen();
          }}
          onDismiss={() => {
            setShowAuthDialog(false);
            onClose();
          }}
        />
      )}
      {showPublishProfileDialog ? (
        <PublishProfileDialog
          closeDialog={() => {
            setShowPublishProfileDialog(false);
            setCurrentPublishProfile(null);
            onClose();
          }}
          current={currentPublishProfile}
          projectId={projectId}
          setPublishTargets={setPublishTargets}
          targets={publishTargets || []}
          types={publishTypes}
          onUpdateIsCreateProfileFromSkill={onUpdateIsCreateProfileFromSkill}
        />
      ) : null}
    </Fragment>
  );
};
