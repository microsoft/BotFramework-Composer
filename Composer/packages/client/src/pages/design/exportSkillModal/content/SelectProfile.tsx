// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { PublishTarget, SkillManifestFile } from '@bfc/shared';
import formatMessage from 'format-message';
import React, { useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

import { botDisplayNameState, dispatcherState, settingsState, skillManifestsState } from '../../../../recoilModel';
import { CreatePublishProfileDialog } from '../../../botProject/CreatePublishProfileDialog';
import { iconStyle } from '../../../botProject/runtime-settings/style';
import { ContentProps, VERSION_REGEX } from '../constants';

const styles = {
  container: css`
    height: 350px;
    overflow: auto;
  `,
};

const onRenderLabel = (props) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        marginBottom: '5px',
      }}
    >
      <div
        style={{
          marginRight: '5px',
          fontWeight: 600,
          fontSize: '14px',
        }}
      >
        <div
          style={{
            padding: '0 5px',
          }}
        >
          {props.label}
        </div>
      </div>
      <TooltipHost content={props.ariaLabel}>
        <Icon iconName="Info" styles={iconStyle(props.required)} />
      </TooltipHost>
    </div>
  );
};

export const getManifestId = (
  botName: string,
  skillManifests: SkillManifestFile[],
  { content: { $schema } = {} }: Partial<SkillManifestFile>
): string => {
  const [version] = VERSION_REGEX.exec($schema) || [''];

  let fileId = version ? `${botName}-${version.replace(/\./g, '-')}-manifest` : `${botName}-manifest`;
  let i = -1;

  while (skillManifests.some(({ id }) => id === fileId) && i < skillManifests.length) {
    if (i < 0) {
      fileId = fileId.concat(`-${++i}`);
    } else {
      fileId = fileId.substr(0, fileId.lastIndexOf('-')).concat(`-${++i}`);
    }
  }

  return fileId;
};

export const SelectProfile: React.FC<ContentProps> = ({
  manifest,
  setSkillManifest,
  value,
  onChange,
  projectId,
  setIsCreateProfileFromSkill,
}) => {
  const [publishingTargets, setPublishingTargets] = useState<PublishTarget[]>([]);
  const [currentTarget, setCurrentTarget] = useState<PublishTarget>();
  const { updateCurrentTarget } = useRecoilValue(dispatcherState);
  const settings = useRecoilValue(settingsState(projectId));
  const [endpointUrl, setEndpointUrl] = useState<string>();
  const [appId, setAppId] = useState<string>();
  const { id, content } = manifest;
  const botName = useRecoilValue(botDisplayNameState(projectId));
  const skillManifests = useRecoilValue(skillManifestsState(projectId));

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
      }
    } catch (err) {
      console.log(err.message);
    }
  }, [currentTarget]);
  const isProfileValid = useMemo(() => {
    try {
      if (!publishingTargets) {
        return false;
      }
      const filteredProfile = publishingTargets.filter((item) => {
        const config = JSON.parse(item.configuration);
        return (
          config.settings &&
          config.settings.MicrosoftAppId &&
          config.hostname &&
          config.settings.MicrosoftAppId.length > 0 &&
          config.hostname.length > 0
        );
      });
      return filteredProfile.length > 0;
    } catch (err) {
      console.log(err.message);
      return false;
    }
  }, [publishingTargets]);

  const publishingOptions = useMemo(() => {
    return publishingTargets.map((t) => ({
      key: t.name,
      text: t.name,
    }));
  }, [publishingTargets]);

  useEffect(() => {
    setPublishingTargets(settings.publishTargets || []);
    setCurrentTarget((settings.publishTargets || [])[0]);
  }, [settings]);

  useEffect(() => {
    if (!id) {
      const fileId = getManifestId(botName, skillManifests, manifest);
      setSkillManifest({ ...manifest, id: fileId });
    }
  }, [id]);

  return isProfileValid ? (
    <div css={styles.container}>
      <Dropdown
        required
        ariaLabel={formatMessage('Select a publishing profile')}
        label={formatMessage('Publishing Profile')}
        options={publishingOptions}
        placeholder={formatMessage('Select one')}
        selectedKey={publishingOptions[0].key}
        styles={{ root: { paddingBottom: '8px' } }}
        onChange={handleCurrentProfileChange}
      />
      <TextField
        disabled
        required
        ariaLabel={formatMessage('The endpoint url')}
        label={formatMessage('Endpoint Url')}
        placeholder={formatMessage('The endpoint url of your web app resource')}
        styles={{ root: { paddingBottom: '8px' } }}
        value={endpointUrl}
        onRenderLabel={onRenderLabel}
      />
      <TextField
        disabled
        required
        ariaLabel={formatMessage('The app id of your application registration')}
        label={formatMessage('Microsoft App Id')}
        placeholder={formatMessage('The app id')}
        styles={{ root: { paddingBottom: '8px' } }}
        value={appId}
        onRenderLabel={onRenderLabel}
      />
    </div>
  ) : (
    <div>
      <CreatePublishProfileDialog
        projectId={projectId}
        setIsCreateProfileFromSkill={setIsCreateProfileFromSkill}
      ></CreatePublishProfileDialog>
    </div>
  );
};
