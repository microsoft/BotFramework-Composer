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
import { PublishProfileDialog } from '../../constants';

import { CreatePublishTarget } from './createPublishTarget';

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
  width: 200px;
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

  const [dialogProps, setDialogProps] = useState({
    title: formatMessage('Title'),
    type: DialogType.normal,
  });

  const [dialogHidden, setDialogHidden] = useState(true);
  const [dialogChildren, setDialogChildren] = useState({});

  const publishTargetsRef = React.useRef<HTMLDivElement>(null);

  // CRUD publish target
  const updatePublishTarget = useCallback(
    async (name: string, type: string, configuration: string, editTarget: any) => {
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
    [publishTargets, projectId]
  );
  const savePublishTarget = useCallback(
    async (name: string, type: string, configuration: string) => {
      const targets = [...(publishTargets || []), { name, type, configuration }];
      await setPublishTargets(targets, projectId);
    },
    [publishTargets, projectId]
  );

  // add profile
  const openAddProfileDialog = useCallback(() => {
    setDialogProps({
      ...PublishProfileDialog.ADD_PROFILE,
      type: DialogType.normal,
    });
    setDialogChildren(
      <CreatePublishTarget
        closeDialog={() => setDialogHidden(true)}
        current={null}
        projectId={projectId}
        setDialogProps={setDialogProps}
        targets={publishTargets || []}
        types={publishTypes}
        updateSettings={savePublishTarget}
      />
    );
    setDialogHidden(false);
  }, [publishTypes, savePublishTarget, publishTargets]);

  // edit profile
  const openEditProfileDialog = useCallback(
    (editTarget) => {
      setDialogProps({
        ...PublishProfileDialog.EDIT_PROFILE,
        type: DialogType.normal,
      });
      setDialogChildren(
        <CreatePublishTarget
          closeDialog={() => setDialogHidden(true)}
          current={editTarget ? editTarget : null}
          projectId={projectId}
          setDialogProps={setDialogProps}
          targets={(publishTargets || []).filter((item) => editTarget && item.name != editTarget.item.name)}
          types={publishTypes}
          updateSettings={updatePublishTarget}
        />
      );
      setDialogHidden(false);
    },
    [publishTypes, publishTargets, updatePublishTarget]
  );

  const onEdit = useCallback(
    async (index: number, item: PublishTarget) => {
      const newItem = { item: item, index: index };
      openEditProfileDialog(newItem);
    },
    [publishTargets]
  );

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
                <div css={publishTargetsItemText}>{p.name} </div>
                <div css={publishTargetsItemText}>{p.type} </div>
                <div css={publishTargetsEditButton}>
                  <ActionButton styles={editPublishProfile} onClick={() => onEdit(index, p)}>
                    {formatMessage('Edit')}
                  </ActionButton>
                </div>
              </div>
            );
          })}
          <ActionButton
            data-testid={'addNewPublishProfile'}
            styles={addPublishProfile}
            onClick={() => openAddProfileDialog()}
          >
            {formatMessage('Add new publish profile')}
          </ActionButton>
        </div>
      </CollapsableWrapper>
      <DialogWrapper
        dialogType={DialogTypes.Customer}
        isOpen={!dialogHidden}
        minWidth={900}
        title={dialogProps.title}
        onDismiss={() => setDialogHidden(true)}
      >
        {dialogChildren}
      </DialogWrapper>
    </Fragment>
  );
};
