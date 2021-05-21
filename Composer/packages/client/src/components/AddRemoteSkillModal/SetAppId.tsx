// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { useRecoilValue } from 'recoil';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { CommunicationColors, NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import { IDropdownOption, Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { FontSizes } from '@uifabric/fluent-theme';
import { DefaultButton, IconButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { navigate } from '@reach/router';

import { settingsState, botDisplayNameState } from '../../recoilModel';

const buttonStyle = { root: { marginLeft: '8px' } };

type SetAppIdProps = {
  projectId: string;
  onDismiss: () => void;
  onNext: (targetName: string) => void;
  onGotoCreateProfile: () => void;
};

const getCreateProfileDescription = (botName, handleCreateProfile) => ({
  iconProps: {
    iconName: 'Error',
    color: SharedColors.orange20,
  },
  title: formatMessage(`Add publishing profile for {botName}`, { botName }),
  description: formatMessage(
    'A publishing profile contains the information necessary to provision and publish your bot, including its App ID. '
  ),
  link: {
    text: formatMessage('Create profile'),
    onClick: handleCreateProfile,
  },
});

const manifestUrl = () => ({
  title: formatMessage('Enter skill manifest URL'),
  description: formatMessage(
    'To connect to a skill, your bot needs the information captured in the skill’s manifest. Contact the author or publisher of the skill for this information.'
  ),
});

const appIdInfo = () => ({
  title: formatMessage('Ensure your bot’s Microsoft App ID is on the skill’s allowed callers list'),
  description: formatMessage(
    'For security purposes, your bot can only call a skill if its Microsoft App ID is in the skill’s allowed callers list. Once you create a publishing profile, share your bot’s App ID with the skill’s author to add it. You may also need to include the skill’s App Id in the root bot’s allowed callers list.'
  ),
});

type RenderItemProps = {
  title: string;
  description: string;
  iconProps?: {
    iconName: string;
    color: string;
  };
  link?: {
    text: string;
    onClick: () => void;
  };
};

const renderItem = ({
  title,
  description,
  link,
  iconProps = { iconName: 'Completed', color: SharedColors.cyanBlue10 },
}: RenderItemProps) => {
  return (
    <div css={{ display: 'flex', marginBottom: '20px' }}>
      <FontIcon
        iconName={iconProps.iconName}
        style={{ color: iconProps.color, fontSize: '18px', margin: '4px 12px 0 0' }}
      />
      <div css={{ fontSize: '14px', lineHeight: '20px' }}>
        <div style={{ color: NeutralColors.gray160, fontWeight: 600, marginBottom: '5px' }}>{title}</div>
        <div style={{ color: NeutralColors.gray130 }}>{description}</div>
        {link && <Link onClick={link.onClick}>{link.text}</Link>}
      </div>
    </div>
  );
};
type CustomLabelProps = {
  label: string;
  description: string;
  required?: boolean;
};
const CustomLabel: React.FC<CustomLabelProps> = ({ label, description, required = false }) => {
  return (
    <Stack horizontal verticalAlign="center">
      <Label
        required={required}
        styles={{ root: { marginRight: '4px', selectors: { '::after': { paddingRight: '0px' } } } }}
      >
        {label}
      </Label>
      <TooltipHost content={description}>
        <FontIcon iconName="Info" style={{ fontSize: FontSizes.size12 }} />
      </TooltipHost>
    </Stack>
  );
};

const renderMicrosoftAppId = (MicrosoftAppId: string, label: string, description: string): JSX.Element => {
  return (
    <Fragment>
      <CustomLabel description={description} label={label} />
      <div
        style={{
          color: NeutralColors.gray90,
          backgroundColor: NeutralColors.gray20,
          fontSize: FontSizes.size14,
          display: 'flex',
          justifyContent: 'space-between',
          lineHeight: '30px',
          paddingLeft: '10px',
          width: '394px',
        }}
      >
        {MicrosoftAppId}
        <IconButton
          iconProps={{ iconName: 'copy' }}
          styles={{ icon: { fontSize: FontSizes.size12, color: CommunicationColors.primary } }}
          onClick={() => navigator.clipboard.writeText(MicrosoftAppId || '')}
        />
      </div>
    </Fragment>
  );
};
export const SetAppId: React.FC<SetAppIdProps> = (props) => {
  const { projectId, onDismiss, onNext, onGotoCreateProfile } = props;
  const settings = useRecoilValue(settingsState(projectId));
  const botName = useRecoilValue(botDisplayNameState(projectId));
  const { publishTargets = [] } = settings;
  const publishTargetOptions: IDropdownOption[] = publishTargets.map((target) => ({
    key: target.name,
    text: target.name,
  }));

  const handleNavigateToDevelopmentResources = () => {
    navigate(`/bot/${projectId}/botProjectsSettings/#LuisQna`);
  };

  const setMSAppIdAndPassword = () => ({
    iconProps: {
      iconName: 'Error',
      color: SharedColors.orange20,
    },
    title: formatMessage('Select App ID and password'),
    description: formatMessage(
      'To ensure a secure connection, the remote skill needs to know the Microsoft App ID of your bot. '
    ),
    link: {
      text: formatMessage('Select App ID and password'),
      onClick: handleNavigateToDevelopmentResources,
    },
  });

  const [currentTargetName, setCurrentTargetName] = useState(publishTargets.length === 0 ? '' : publishTargets[0].name);

  const appId = useMemo(() => {
    if (publishTargets.length === 0) return '';

    const { settings } = JSON.parse(
      publishTargets.find((target) => target.name === currentTargetName)?.configuration || '{}'
    );
    return settings?.MicrosoftAppId || '';
  }, [publishTargets, currentTargetName]);

  useEffect(() => {
    if (publishTargets.length > 0) {
      setCurrentTargetName(publishTargets[0].name);
    }
  }, [publishTargets.length]);

  return (
    <Fragment>
      {publishTargets.length === 0 ? (
        <Fragment>
          {renderItem(getCreateProfileDescription(botName, onGotoCreateProfile))}
          {renderItem(setMSAppIdAndPassword())}
          {renderItem(appIdInfo())}
          {renderItem(manifestUrl())}
        </Fragment>
      ) : (
        <Fragment>
          {renderItem(appIdInfo())}
          {publishTargets.length === 1 ? (
            <div style={{ margin: '0 0 40px 30px' }}>
              {renderMicrosoftAppId(
                appId,
                formatMessage('Your bot’s Microsoft App ID'),
                formatMessage('Microsoft App ID')
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', margin: '0 0 40px 30px' }}>
              <div style={{ marginRight: '20px' }}>
                <CustomLabel
                  required
                  description={formatMessage('Publish profile')}
                  label={formatMessage('Publish profile')}
                />
                <Dropdown
                  options={publishTargetOptions}
                  placeholder={formatMessage('Select an option')}
                  selectedKey={currentTargetName}
                  styles={{ root: { width: '187px' } }}
                  onChange={(_, option) => {
                    setCurrentTargetName(option?.key as string);
                  }}
                />
              </div>
              <div>
                {renderMicrosoftAppId(appId, formatMessage('Microsoft App Id'), formatMessage('Microsoft App Id'))}
              </div>
            </div>
          )}
          {renderItem(setMSAppIdAndPassword())}
          {renderItem(manifestUrl())}
        </Fragment>
      )}
      <Stack>
        <Separator />
        <StackItem align={'end'}>
          <DefaultButton data-testid="SkillFormCancel" text={formatMessage('Cancel')} onClick={onDismiss} />
          <PrimaryButton
            data-testid="SetAppIdNext"
            disabled={publishTargets.length === 0}
            styles={buttonStyle}
            text={formatMessage('Next')}
            onClick={() => onNext(currentTargetName)}
          />
        </StackItem>
      </Stack>
    </Fragment>
  );
};
