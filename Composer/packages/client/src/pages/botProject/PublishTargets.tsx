// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { Fragment, useState, useEffect } from 'react';
import { jsx, css } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import { PublishTarget } from '@bfc/shared';
import formatMessage from 'format-message';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { SharedColors } from '@uifabric/fluent-theme';
import { OpenConfirmModal } from '@bfc/ui-shared';

import { dispatcherState, settingsState, publishTypesState } from '../../recoilModel';
import { AuthDialog } from '../../components/Auth/AuthDialog';
import { useLocation } from '../../utils/hooks';
import { isShowAuthDialog as shouldShowTokenDialog } from '../../utils/auth';

import { PublishProfileDialog } from './create-publish-profile/PublishProfileDialog';
import { tableRow, tableRowItem, tableColumnHeader, columnSizes, actionButton } from './styles';

// -------------------- Styles -------------------- //

const publishTargetsContainer = css`
  display: flex;
  padding: 20px;
  flex-direction: column;
`;

const belowTargetsContainer = css`
  padding: 0 20px 20px 20px;
`;

const publishTargetsHeader = css`
  display: flex;
  flex-direction: row;
  height: 42px;
`;

const editPublishProfile = {
  root: {
    fontSize: 12,
    fontWeight: FontWeights.regular,
    color: SharedColors.cyanBlue10,
    paddingLeft: 0,
    paddingBottom: 5,
  },
};

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

  const [showPublishDialog, setShowingPublishDialog] = useState(false);
  const [showAuthDialog, setShowingAuthDialog] = useState(false);

  const publishTargetsRef = React.useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState<{ index: number; item: PublishTarget } | null>(null);

  const { location } = useLocation();

  useEffect(() => {
    if (location.hash === '#completePublishProfile') {
      if (publishTargets && publishTargets.length > 0) {
        // clear the hash so that the dialog doesn't open again.
        window.location.hash = '';
        setCurrent({ item: publishTargets[0], index: 0 });
        if (shouldShowTokenDialog(true)) {
          setShowingAuthDialog(true);
        } else {
          setShowingPublishDialog(true);
        }
      }
    }
  }, [location, publishTargets]);

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

  const onDeletePublishTarget = async (publishTarget: PublishTarget) => {
    if (publishTargets) {
      const targetName = publishTarget.name;
      const confirmed = await OpenConfirmModal(
        formatMessage('Delete?'),
        formatMessage(
          'Are you sure you want to remove {targetName}? This will remove only the profile and will not delete provisioned resources.',
          { targetName }
        )
      );
      if (confirmed) {
        const newPublishTargets = publishTargets.filter((t) => t.name !== targetName);
        setPublishTargets(newPublishTargets, projectId);
      }
    }
  };

  const addNewButton = (
    <ActionButton
      data-testid={'addNewPublishProfile'}
      styles={actionButton}
      onClick={() => {
        if (shouldShowTokenDialog(true)) {
          setShowingAuthDialog(true);
        } else {
          setShowingPublishDialog(true);
        }
      }}
    >
      {formatMessage('Add new')}
    </ActionButton>
  );

  return (
    <Fragment>
      <div ref={publishTargetsRef} css={publishTargetsContainer} id="addNewPublishProfile">
        <div css={publishTargetsHeader}>
          <div css={tableColumnHeader(columnSizes[0])}>{formatMessage('Name')} </div>
          <div css={tableColumnHeader(columnSizes[1])}>{formatMessage('Target')} </div>
          <div css={tableColumnHeader(columnSizes[2])}> </div>
        </div>
        {publishTargets?.map((p, index) => {
          return (
            <div key={index} css={tableRow}>
              <div css={tableRowItem(columnSizes[0])} title={p.name}>
                {p.name}
              </div>
              <div css={tableRowItem(columnSizes[1])} title={p.type}>
                {p.type}
              </div>
              <div css={tableRowItem(columnSizes[2])}>
                <ActionButton
                  data-testid={'editPublishProfile'}
                  styles={editPublishProfile}
                  onClick={() => {
                    setCurrent({ item: p, index: index });
                    if (shouldShowTokenDialog(true)) {
                      setShowingAuthDialog(true);
                    } else {
                      setShowingPublishDialog(true);
                    }
                  }}
                >
                  {formatMessage('Edit')}
                </ActionButton>
              </div>
              <div css={tableRowItem(columnSizes[2])}>
                <ActionButton
                  data-testid={'deletePublishProfile'}
                  styles={editPublishProfile}
                  onClick={() => onDeletePublishTarget(p)}
                >
                  {formatMessage('Delete')}
                </ActionButton>
              </div>
            </div>
          );
        })}
      </div>
      <div css={belowTargetsContainer}>{addNewButton}</div>
      {showAuthDialog && (
        <AuthDialog
          needGraph
          next={() => {
            setShowingPublishDialog(true);
          }}
          onDismiss={() => {
            setShowingAuthDialog(false);
          }}
        />
      )}
      {showPublishDialog ? (
        <PublishProfileDialog
          closeDialog={() => {
            setShowingPublishDialog(false);
            // reset current
            setCurrent(null);
          }}
          current={current}
          projectId={projectId}
          setPublishTargets={setPublishTargets}
          targets={publishTargets || []}
          types={publishTypes}
        />
      ) : null}
    </Fragment>
  );
};
