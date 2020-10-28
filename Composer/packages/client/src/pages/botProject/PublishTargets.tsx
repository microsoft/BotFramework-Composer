// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { Fragment, useState, useCallback, useEffect } from 'react';
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import { PublishTarget } from '@bfc/shared';
import formatMessage from 'format-message';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';

import { dispatcherState, settingsState, botDisplayNameState, publishTypesState } from '../../recoilModel';
import { CollapsableWrapper } from '../../components/CollapsableWrapper';
import { CreatePublishTarget } from '../publish/createPublishTarget';

import {
  titleStyle,
  publishTargetsContainer,
  publishTargetsHeader,
  publishTargetsHeaderText,
  publishTargetsItem,
  publishTargetsItemText,
  publishTargetsEditButton,
  editPublishProfile,
  addPublishProfile,
} from './styles';

type PublishTargetsProps = {
  projectId: string;
};

export const PublishTargets: React.FC<PublishTargetsProps> = (props) => {
  const { projectId } = props;
  const { publishTargets } = useRecoilValue(settingsState(projectId));
  const { getPublishTargetTypes, setPublishTargets } = useRecoilValue(dispatcherState);
  const publishTypes = useRecoilValue(publishTypesState(projectId));
  const botName = useRecoilValue(botDisplayNameState(projectId));
  const [editTarget, setEditTarget] = useState<{ index: number; item: PublishTarget } | null>(null);
  const [editDialogProps, setEditDialogProps] = useState({
    title: formatMessage('Title'),
    type: DialogType.normal,
    children: {},
  });

  const [dialogProps, setDialogProps] = useState({
    title: formatMessage('Title'),
    type: DialogType.normal,
    children: {},
  });

  const [addDialogHidden, setAddDialogHidden] = useState(true);
  const [editDialogHidden, setEditDialogHidden] = useState(true);

  const onEdit = async (index: number, item: PublishTarget) => {
    const newItem = { item: item, index: index };
    setEditTarget(newItem);
    setEditDialogHidden(false);
  };

  const updatePublishTarget = useCallback(
    async (name: string, type: string, configuration: string) => {
      if (!editTarget) {
        return;
      }

      const targets = publishTargets ? [...publishTargets] : [];

      targets[editTarget.index] = {
        name,
        type,
        configuration,
      };

      await setPublishTargets(targets, projectId);
    },
    [publishTargets, projectId, botName, editTarget]
  );

  const savePublishTarget = useCallback(
    async (name: string, type: string, configuration: string) => {
      const targets = [...(publishTargets || []), { name, type, configuration }];
      await setPublishTargets(targets, projectId);
    },
    [publishTargets, projectId, botName]
  );

  useEffect(() => {
    setDialogProps({
      title: formatMessage('Add a publish profile'),
      type: DialogType.normal,
      children: (
        <CreatePublishTarget
          closeDialog={() => setAddDialogHidden(true)}
          current={null}
          targets={publishTargets || []}
          types={publishTypes}
          updateSettings={savePublishTarget}
        />
      ),
    });
  }, [publishTypes, savePublishTarget, publishTargets]);

  useEffect(() => {
    setEditDialogProps({
      title: formatMessage('Edit a publish profile'),
      type: DialogType.normal,
      children: (
        <CreatePublishTarget
          closeDialog={() => setEditDialogHidden(true)}
          current={editTarget ? editTarget.item : null}
          targets={(publishTargets || []).filter((item) => editTarget && item.name != editTarget.item.name)}
          types={publishTypes}
          updateSettings={updatePublishTarget}
        />
      ),
    });
  }, [editTarget, publishTypes, updatePublishTarget]);

  useEffect(() => {
    if (projectId) {
      getPublishTargetTypes(projectId);
    }
  }, [projectId]);

  return (
    <Fragment>
      <CollapsableWrapper title={formatMessage('Publish targets')} titleStyle={titleStyle}>
        <div css={publishTargetsContainer}>
          <div css={publishTargetsHeader}>
            <div css={publishTargetsHeaderText}>{formatMessage('Name')} </div>
            <div css={publishTargetsHeaderText}>{formatMessage('Type')} </div>
            <div css={publishTargetsHeaderText}> </div>
          </div>
          {publishTargets?.map((p, index) => {
            return (
              <div key={index} css={publishTargetsItem}>
                <div css={publishTargetsItemText}>{p.name} </div>
                <div css={publishTargetsItemText}>{p.type} </div>
                <div css={publishTargetsEditButton}>
                  <ActionButton styles={editPublishProfile} onClick={async () => await onEdit(index, p)}>
                    {formatMessage('Edit')}
                  </ActionButton>
                </div>
              </div>
            );
          })}
          <ActionButton
            data-testid={'addNewPublishProfile'}
            styles={addPublishProfile}
            onClick={() => setAddDialogHidden(false)}
          >
            {formatMessage('Add new publish profile')}
          </ActionButton>
        </div>
      </CollapsableWrapper>
      <Dialog
        dialogContentProps={dialogProps}
        hidden={addDialogHidden}
        minWidth={450}
        modalProps={{ isBlocking: true }}
        onDismiss={() => setAddDialogHidden(true)}
      >
        {dialogProps.children}
      </Dialog>
      <Dialog
        dialogContentProps={editDialogProps}
        hidden={editDialogHidden}
        minWidth={450}
        modalProps={{ isBlocking: true }}
        onDismiss={() => setEditDialogHidden(true)}
      >
        {editDialogProps.children}
      </Dialog>
    </Fragment>
  );
};
