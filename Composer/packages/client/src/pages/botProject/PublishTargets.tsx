// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { Fragment, useState, useEffect } from 'react';
import { jsx, css } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import { PublishTarget } from '@bfc/shared';
import formatMessage from 'format-message';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { FontSizes, FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';

import { dispatcherState, settingsState, publishTypesState } from '../../recoilModel';
import { CollapsableWrapper } from '../../components/CollapsableWrapper';

import { PublishProfileDialog } from './create-publish-profile/PublishProfileDialog';

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
  width: 300px;
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

  const [dialogHidden, setDialogHidden] = useState(true);

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
      <CollapsableWrapper title={formatMessage('Publish profiles')} titleStyle={titleStyle}>
        <div ref={publishTargetsRef} css={publishTargetsContainer} id="addNewPublishProfile">
          <div css={publishTargetsHeader}>
            <div css={publishTargetsHeaderText}>{formatMessage('Name')} </div>
            <div css={publishTargetsHeaderText}>{formatMessage('Target')} </div>
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
                  <ActionButton
                    styles={editPublishProfile}
                    onClick={() => {
                      setCurrent({ item: p, index: index });
                      setDialogHidden(false);
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
            onClick={() => setDialogHidden(false)}
          >
            {formatMessage('Add new')}
          </ActionButton>
        </div>
      </CollapsableWrapper>
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
