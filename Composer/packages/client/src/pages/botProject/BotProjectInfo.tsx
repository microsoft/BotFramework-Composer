// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import React, { useState, Fragment } from 'react';
import { RouteComponentProps } from '@reach/router';
import { DisplayMarkdownDialog } from '@bfc/ui-shared';
import formatMessage from 'format-message';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { Link } from 'office-ui-fabric-react/lib/Link';

import { projectReadmeState, locationState } from '../../recoilModel/atoms';
import { localBotsDataSelector } from '../../recoilModel/selectors/project';

const labelStyle = css`
  font-size: 12px;
  color: #828282;
`;

const valueStyle = css`
  font-size: 14px;
`;

const headerStyle = css`
  font-size: 16px;
  font-weight: 600;
`;

export const BotProjectInfo: React.FC<RouteComponentProps<{
  projectId: string;
}>> = (props) => {
  const { projectId = '' } = props;
  const botProjects = useRecoilValue(localBotsDataSelector);
  const botProject = botProjects.find((b) => b.projectId === projectId);
  const readme = useRecoilValue(projectReadmeState(projectId));
  const location = useRecoilValue(locationState(projectId));
  const [readmeHidden, setReadmeHidden] = useState<boolean>(true);

  return (
    <div>
      <h3 css={headerStyle}>{formatMessage('Bot Details')}</h3>
      <Stack tokens={{ childrenGap: 10 }}>
        <StackItem>
          <div css={labelStyle}>{formatMessage('Bot Name')}</div>
          <div css={valueStyle}>{botProject?.name}</div>
        </StackItem>
        <StackItem>
          <div css={labelStyle}>{formatMessage('File Location')}</div>
          <div css={valueStyle}>{location}</div>
        </StackItem>
        <StackItem styles={{ root: { marginBottom: '10px' } }}>
          <div css={labelStyle}>{formatMessage('Read Me')}</div>
          {readme && (
            <Fragment>
              <Link
                onClick={() => {
                  setReadmeHidden(false);
                }}
              >
                {formatMessage('View project readme')}
              </Link>
              <DisplayMarkdownDialog
                content={readme}
                hidden={readmeHidden}
                title={'Project Readme'}
                onDismiss={() => {
                  setReadmeHidden(true);
                }}
              />
            </Fragment>
          )}
        </StackItem>
      </Stack>
    </div>
  );
};

export default BotProjectInfo;
