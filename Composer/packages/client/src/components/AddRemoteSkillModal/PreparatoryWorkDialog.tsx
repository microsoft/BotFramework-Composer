// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { useRecoilValue } from 'recoil';
import { settingsState, botDisplayNameState } from '../../recoilModel';
import { Fragment } from 'react';

type PreparatoryWorkDialogProps = {
  projectId: string;
  onDismiss: () => void;
  onNext: () => void;
};
const ngrokInstallation = {
  title: formatMessage('Setup tunneling software'),
  description: formatMessage(
    'To connect to a remote skill, tunneling software is required so your remote skill can call back to your bot with responses.'
  ),
  link: {
    text: formatMessage('Install ngrok'),
    onClick: () => {},
  },
};
const getProfileDescription = (botName) => ({
  title: formatMessage(`Create a publishing profile for {botName}`, { botName }),
  description: formatMessage(
    'Your root bot must have an associated Microsoft App Id and Password to connect to a skill.'
  ),
  link: {
    text: formatMessage('Create a publishing profile'),
    onClick: () => {},
  },
});
const manifestUrl = {
  title: formatMessage('Get a skill manifest URL from the skill’s author'),
  description: formatMessage(
    'To connect to a skill you will need a skill’s manifest URL. Contact the skill’s author to get the URL and paste it in the next step.'
  ),
  link: {
    text: formatMessage('Know more about skill manifest URLs'),
    onClick: () => {},
  },
};
type RenderItemProps = {
  title: string;
  description: string;
  link?: {
    text: string;
    onClick: () => void;
  };
};

const renderItem = ({ title, description, link }: RenderItemProps) => {
  const titleStyle = css``;
  const descriptionStyle = css``;
  return (
    <div>
      <FontIcon iconName="Completed" />
      <div>
        <div css={titleStyle}>
          <div>{title}</div>
        </div>
        <div css={descriptionStyle}>{description}</div>
        {link && <Link onClick={link.onClick}>{link.text}</Link>}
      </div>
    </div>
  );
};
export const PreparatoryWorkDialog: React.FC<PreparatoryWorkDialogProps> = (props) => {
  const { projectId, onDismiss, onNext } = props;
  const settings = useRecoilValue(settingsState(projectId));
  const botName = useRecoilValue(botDisplayNameState(projectId));
  const { publishTargets } = settings;
  return (
    <Fragment>
      {renderItem(ngrokInstallation)}
      {publishTargets.length === 0 ? (
        <Fragment>
          {renderItem(getProfileDescription(botName))}
          {renderItem(manifestUrl)}
        </Fragment>
      ) : null}
    </Fragment>
  );
};
