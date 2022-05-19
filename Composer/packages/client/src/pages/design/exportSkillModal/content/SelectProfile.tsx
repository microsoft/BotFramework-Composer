// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { PublishTarget } from '@bfc/shared';
import formatMessage from 'format-message';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Icon } from '@fluentui/react/lib/Icon';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { FluentTheme, NeutralColors } from '@fluentui/theme';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { Link } from '@fluentui/react/lib/Link';
import { TextField } from '@bfc/ui-shared';

import { botDisplayNameState, dispatcherState, settingsState } from '../../../../recoilModel';
import { CreatePublishProfileDialog } from '../../../botProject/CreatePublishProfileDialog';
import { ContentProps } from '../constants';
import { PublishProfileWrapperDialog } from '../../../botProject/PublishProfieWrapperDialog';

const styles = {
  container: css`
    height: 350px;
    overflow: auto;
  `,
};

const inputStyles = {
  root: { paddingBottom: '8px' },
  subComponentStyles: {
    label: {
      root: {
        color: FluentTheme.palette.neutralPrimary,
      },
    },
  },
};

const onRenderInvalidProfileWarning = (hasValidProfile, handleShowPublishProfileWrapperDialog) => {
  return (
    <MessageBar dismissButtonAriaLabel="Close" isMultiline={false} messageBarType={MessageBarType.warning}>
      {formatMessage('Publish profile is missing App ID and host name. ')}
      {hasValidProfile ? (
        formatMessage('Choose a valid publish profile to continue')
      ) : (
        <Link onClick={handleShowPublishProfileWrapperDialog}>
          {formatMessage('Create a valid publish profile to continue')}
        </Link>
      )}
    </MessageBar>
  );
};

export const getManifestId = (botName: string): string => {
  return `${botName}-manifest`;
};

const onRenderTitle = (options: IDropdownOption[] | undefined): JSX.Element | null => {
  const option = options?.[0];

  return option ? (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span>{option.text}</span>
      {option.data?.icon && (
        <Icon
          aria-hidden="true"
          iconName={option.data.icon}
          style={{ color: option.data.color, marginLeft: '8px', fontSize: '16px' }}
          title={option.data.icon}
        />
      )}
    </div>
  ) : null;
};

export const SelectProfile: React.FC<ContentProps> = ({
  manifest,
  setSkillManifest,
  value,
  onChange,
  projectId,
  onUpdateIsCreateProfileFromSkill,
}) => {
  const [publishingTargets, setPublishingTargets] = useState<PublishTarget[]>([]);
  const [currentTarget, setCurrentTarget] = useState<PublishTarget>();
  const { updateCurrentTarget } = useRecoilValue(dispatcherState);
  const settings = useRecoilValue(settingsState(projectId));
  const [endpointUrl, setEndpointUrl] = useState<string>();
  const [appId, setAppId] = useState<string>();
  const { id, content } = manifest;
  const botName = useRecoilValue(botDisplayNameState(projectId));

  const [showCreateProfileDialog, setShowCreateProfileDialog] = useState(true);
  const [selectedKey, setSelectedKey] = useState('');
  const [showPublishProfileWrapperDialog, setShowPublishProfileWrapperDialog] = useState(false);

  const handleShowPublishProfileWrapperDialog = () => {
    setShowPublishProfileWrapperDialog(true);
  };

  const handleHiddenPublishProfileWrapperDialog = () => {
    setShowPublishProfileWrapperDialog(false);
  };

  const handleCurrentProfileChange = useMemo(
    () => (_e, option?: IDropdownOption) => {
      const target = publishingTargets.find((t) => {
        return t.name === option?.key;
      });
      setCurrentTarget(target);
    },
    [publishingTargets]
  );

  useEffect(() => {
    try {
      if (currentTarget) {
        updateCurrentTarget(projectId, currentTarget);
        const config = JSON.parse(currentTarget.configuration);
        setEndpointUrl(`https://${config.hostname}.azurewebsites.net/api/messages`);
        setAppId(config.settings.MicrosoftAppId);

        setSkillManifest({
          content: {
            ...content,
            endpoints: [
              {
                protocol: 'BotFrameworkV3',
                name: currentTarget.name,
                endpointUrl: `https://${config.hostname}.azurewebsites.net/api/messages`,
                description: '<description>',
                msAppId: config.settings.MicrosoftAppId,
              },
            ],
          },
          id: id,
        });
        setSelectedKey(currentTarget.name);
      }
    } catch (err) {
      console.log(err.message);
    }
  }, [currentTarget]);

  const isValidProfile = (publishTarget) => {
    try {
      const config = JSON.parse(publishTarget.configuration);

      return (
        config.settings &&
        config.settings.MicrosoftAppId &&
        config.hostname &&
        config.settings.MicrosoftAppId.length > 0 &&
        config.hostname.length > 0
      );
    } catch (err) {
      console.log(err.message);
      return false;
    }
  };

  const hasValidProfile = useMemo(() => !!publishingTargets.some((target) => isValidProfile(target)), [
    publishingTargets,
  ]);

  const publishingOptions = useMemo(() => {
    return publishingTargets.map((t) => ({
      key: t.name,
      text: t.name,
      data: !isValidProfile(t) ? { icon: 'TriangleSolid', color: NeutralColors.gray60 } : undefined,
    }));
  }, [publishingTargets]);

  useEffect(() => {
    setPublishingTargets(settings.publishTargets || []);
    setCurrentTarget((settings.publishTargets || [])[0]);
    setShowCreateProfileDialog(!settings.publishTargets || settings.publishTargets.length === 0);
  }, [settings]);

  useEffect(() => {
    const fileId = getManifestId(botName);
    setSkillManifest({ ...manifest, id: fileId });
  }, [id]);

  return (
    <Fragment>
      {!showCreateProfileDialog ? (
        <div css={styles.container}>
          <Dropdown
            required
            ariaLabel={formatMessage('Select a publishing profile')}
            label={formatMessage('Publishing Profile')}
            options={publishingOptions}
            placeholder={formatMessage('Select one')}
            selectedKey={selectedKey}
            styles={inputStyles}
            onChange={handleCurrentProfileChange}
            onRenderTitle={onRenderTitle}
          />
          {!isValidProfile(currentTarget) ? (
            onRenderInvalidProfileWarning(hasValidProfile, handleShowPublishProfileWrapperDialog)
          ) : (
            <Fragment>
              <TextField
                disabled
                required
                label={formatMessage('Endpoint Url')}
                placeholder={formatMessage('The endpoint url of your web app resource')}
                styles={inputStyles}
                tooltip={formatMessage('The endpoint url')}
                tooltipIconProps={{ iconName: 'Info' }}
                value={endpointUrl}
              />
              <TextField
                disabled
                required
                label={formatMessage('Microsoft App ID')}
                placeholder={formatMessage('The App ID')}
                styles={inputStyles}
                tooltip={formatMessage('The app id of your application registration')}
                tooltipIconProps={{ iconName: 'Info' }}
                value={appId}
              />
            </Fragment>
          )}
        </div>
      ) : (
        <div>
          <CreatePublishProfileDialog onShowPublishProfileWrapperDialog={handleShowPublishProfileWrapperDialog} />
        </div>
      )}
      {showPublishProfileWrapperDialog && (
        <PublishProfileWrapperDialog
          projectId={projectId}
          onClose={handleHiddenPublishProfileWrapperDialog}
          onUpdateIsCreateProfileFromSkill={onUpdateIsCreateProfileFromSkill}
        />
      )}
    </Fragment>
  );
};
