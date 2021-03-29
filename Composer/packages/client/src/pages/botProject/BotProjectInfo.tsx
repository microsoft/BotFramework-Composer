// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import React, { useState, Fragment } from 'react';
import { RouteComponentProps } from '@reach/router';
import { DisplayReadme } from '@bfc/ui-shared';
import formatMessage from 'format-message';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';

import { readmeState, locationState } from '../../recoilModel/atoms';
import { localBotsDataSelector } from '../../recoilModel/selectors/project';

export const BotProjectInfo: React.FC<RouteComponentProps<{
  projectId: string;
}>> = (props) => {
  const { projectId = '' } = props;
  const botProjects = useRecoilValue(localBotsDataSelector);
  const botProject = botProjects.find((b) => b.projectId === projectId);
  const readme = useRecoilValue(readmeState(projectId));
  const location = useRecoilValue(locationState(projectId));
  const [readmeHidden, setReadmeHidden] = useState<boolean>(true);

  return (
    <div>
      <h1>{botProject?.name}</h1>
      <p>
        {formatMessage('File Location:')}
        <span
          style={{
            display: 'inline-block',
            overflowWrap: 'break-word',
            maxWidth: '100%',
            fontSize: 12,
          }}
        >
          {location}
        </span>
      </p>
      {readme && (
        <Fragment>
          <DefaultButton
            onClick={() => {
              setReadmeHidden(false);
            }}
          >
            {formatMessage('View project readme')}
          </DefaultButton>
          <DisplayReadme
            hidden={readmeHidden}
            readme={readme}
            title={'Project Readme'}
            onDismiss={() => {
              setReadmeHidden(true);
            }}
          />
        </Fragment>
      )}
    </div>
  );
};

export default BotProjectInfo;
