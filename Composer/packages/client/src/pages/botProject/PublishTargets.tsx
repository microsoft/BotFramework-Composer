// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { Fragment, useState, useCallback, useEffect } from 'react';
import { jsx, css } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import { PublishTarget } from '@bfc/shared';
import formatMessage from 'format-message';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { FontSizes, FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';

import { dispatcherState, settingsState, publishTypesState } from '../../recoilModel';
import { CollapsableWrapper } from '../../components/CollapsableWrapper';
import { CreatePublishTarget } from '../publish/createPublishTarget';
import TelemetryClient from '../../telemetry/TelemetryClient';

// -------------------- Styles -------------------- //

const titleStyle = css`
  font-size: ${FontSizes.medium};
  font-weight: ${FontWeights.semibold};
  margin-left: 22px;
  margin-top: 6px;
`;

const publishTargetsContainer = css`
  display: flex;
  flex-direction: column;
`;

const publishTargetsHeader = css`
  display: flex;
  flex-direction: row;
  height: 42px;
`;

const publishTargetsHeaderText = css`
  width: 300px;
  font-size: ${FontSizes.medium};
  font-weight: ${FontWeights.semibold};
  border-bottom: 1px solid ${NeutralColors.gray30};
  padding-top: 10px;
  padding-left: 10px;
`;

const publishTargetsItem = css`
  display: flex;
  flex-direction: row;
  height: 42px;
`;

const publishTargetsItemText = css`
  width: 200px;
  font-size: ${FontSizes.medium};
  font-weight: ${FontWeights.regular};
  border-bottom: 1px solid ${NeutralColors.gray30};
  padding-top: 10px;
  padding-left: 10px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const addPublishProfile = {
  root: {
    fontSize: 12,
    fontWeight: FontWeights.regular,
    color: SharedColors.cyanBlue10,
    paddingLeft: 0,
    marginLeft: 5,
  },
};

const editPublishProfile = {
  root: {
    fontSize: 12,
    fontWeight: FontWeights.regular,
    color: SharedColors.cyanBlue10,
    paddingLeft: 0,
    paddingBottom: 5,
  },
};

const publishTargetsEditButton = css`
  width: 200px;
  font-size: ${FontSizes.medium};
  font-weight: ${FontWeights.regular};
  border-bottom: 1px solid ${NeutralColors.gray30};
  padding-top: 3px;
  padding-left: 10px;
`;

// -------------------- PublishTargets -------------------- //

type PublishTargetsProps = {
  projectId: string;
  scrollToSectionId?: string;
};

export const PublishTargets: React.FC<PublishTargetsProps> = (props) => {
  const { projectId, scrollToSectionId = '' } = props;
  const { publishTargets } = useRecoilValue(settingsState(projectId));
  const { getPublishTargetTypes, setPublishTargets } = useRecoilValue(dispatcherState);
  const publishTypes = useRecoilValue(publishTypesState(projectId));
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

  const publishTargetsRef = React.useRef<HTMLDivElement>(null);

  const onEdit = useCallback(
    async (index: number, item: PublishTarget) => {
      const newItem = { item: item, index: index };
      setEditTarget(newItem);
      setEditDialogHidden(false);
    },
    [publishTargets]
  );

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
    [publishTargets, projectId, editTarget]
  );

  const savePublishTarget = useCallback(
    async (name: string, type: string, configuration: string) => {
      const targets = [...(publishTargets || []), { name, type, configuration }];
      await setPublishTargets(targets, projectId);
      TelemetryClient.track('NewPublishingProfileSaved', { type });
    },
    [publishTargets, projectId]
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
          targets={(publishTargets || []).filter((item) => editTarget && item.name !== editTarget.item.name)}
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

  useEffect(() => {
    if (publishTargetsRef.current && scrollToSectionId === '#addNewPublishProfile') {
      publishTargetsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scrollToSectionId]);

  return (
    <Fragment>
      <CollapsableWrapper title={formatMessage('Publish targets')} titleStyle={titleStyle}>
        <div ref={publishTargetsRef} css={publishTargetsContainer} id="addNewPublishProfile">
          <div css={publishTargetsHeader}>
            <div css={publishTargetsHeaderText}>{formatMessage('Name')} </div>
            <div css={publishTargetsHeaderText}>{formatMessage('Type')} </div>
            <div css={publishTargetsHeaderText}> </div>
          </div>
          {publishTargets?.map((p, index) => {
            return (
              <div key={index} css={publishTargetsItem}>
                <div css={publishTargetsItemText} title={p.name}>
                  {p.name}
                </div>
                <div css={publishTargetsItemText} title={p.type}>
                  {p.type}
                </div>
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
            onClick={() => {
              setAddDialogHidden(false);
              TelemetryClient.track('NewPublishingProfileStarted');
            }}
          >
            {formatMessage('Add new publish profile')}
          </ActionButton>
        </div>
      </CollapsableWrapper>
      <DialogWrapper
        dialogType={DialogTypes.Customer}
        isOpen={!addDialogHidden}
        minWidth={450}
        title={dialogProps.title}
        onDismiss={() => setAddDialogHidden(true)}
      >
        {dialogProps.children}
      </DialogWrapper>
      <DialogWrapper
        dialogType={DialogTypes.Customer}
        isOpen={!editDialogHidden}
        minWidth={450}
        title={editDialogProps.title}
        onDismiss={() => setEditDialogHidden(true)}
      >
        {editDialogProps.children}
      </DialogWrapper>
    </Fragment>
  );
};
