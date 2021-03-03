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

import { dispatcherState, settingsState, publishTypesState } from '../../recoilModel';
import { CollapsableWrapper } from '../../components/CollapsableWrapper';
import { AuthDialog } from '../../components/Auth/AuthDialog';
import { isShowAuthDialog } from '../../utils/auth';

import { PublishProfileDialog } from './create-publish-profile/PublishProfileDialog';
import { title, tableRow, tableRowItem, tableColumnHeader, columnSizes } from './styles';

// -------------------- Styles -------------------- //

const publishTargetsContainer = css`
  display: flex;
  flex-direction: column;
`;

const publishTargetsHeader = css`
  display: flex;
  flex-direction: row;
  height: 42px;
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

  const [dialogHidden, setDialogHidden] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const publishTargetsRef = React.useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState<{ index: number; item: PublishTarget } | null>(null);

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
      <CollapsableWrapper title={formatMessage('Publish profiles')} titleStyle={title}>
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
                    styles={editPublishProfile}
                    onClick={() => {
                      setCurrent({ item: p, index: index });
                      if (isShowAuthDialog(true)) {
                        setShowAuthDialog(true);
                      } else {
                        setDialogHidden(false);
                      }
                    }}
                  >
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
              if (isShowAuthDialog(true)) {
                setShowAuthDialog(true);
              } else {
                setDialogHidden(false);
              }
            }}
          >
            {formatMessage('Add new')}
          </ActionButton>
        </div>
      </CollapsableWrapper>
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
