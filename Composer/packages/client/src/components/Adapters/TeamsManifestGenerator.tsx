// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { randomBytes } from 'crypto';

import { v4 as uuidv4 } from 'uuid';
import { jsx } from '@emotion/core';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { IconButton } from 'office-ui-fabric-react/lib/components/Button';
import { FontSizes, NeutralColors } from '@uifabric/fluent-theme/lib/fluent';
import { useRef } from 'react';
import { ITextField, TextField } from 'office-ui-fabric-react/lib/components/TextField';
import { DialogTypes, DialogWrapper } from '@bfc/ui-shared/lib/components/DialogWrapper';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';

import { defaultTeamsManifest } from '../../constants';

type TeamsManifestGeneratorProps = {
  hidden: boolean;
  botAppId?: string;
  botDisplayName?: string;
  onDismiss: () => void;
};

export const TeamsManifestGenerator = (props: TeamsManifestGeneratorProps) => {
  const textFieldRef = useRef<ITextField>(null);

  const copyCodeToClipboard = () => {
    try {
      textFieldRef.current?.select;
      textFieldRef.current?.select();
      document.execCommand('copy');
      textFieldRef.current?.setSelectionRange(0, 0);
      textFieldRef.current?.blur();
    } catch (e) {
      console.error('Something went wrong when trying to copy manifest content to clipboard.', e);
    }
  };

  const generateTeamsManifest = () => {
    const appId = props.botAppId ? props.botAppId : '{AddBotAppId}';
    const botName = props.botDisplayName ? props.botDisplayName : '{AddBotDisplayName}';
    const result = defaultTeamsManifest;
    result.id = uuidv4().toString();
    result.description.short = `short description for ${botName}`;
    result.description.full = `full description for ${botName}`;
    result.packageName = botName;
    result.name.short = botName;
    result.name.full = botName;
    result.bots[0].botId = appId;
    return JSON.stringify(defaultTeamsManifest, null, 2);
  };

  return (
    <DialogWrapper
      dialogType={DialogTypes.CreateFlow}
      isOpen={!props.hidden}
      subText={formatMessage(
        'Your Teams adapter is configured for your published bot. Copy the manifest, open App Studio in Teams and add the manifest so you can test your bot in Teams'
      )}
      title={formatMessage('Teams Manifest')}
      onDismiss={props.onDismiss}
    >
      <div>
        <Text style={{ fontWeight: 700 }}>{formatMessage('Teams manifest for your bot:')}</Text>
        <a
          download={'teamsManifest.json'}
          href={'data:text/plain;charset=utf-8,' + encodeURIComponent(generateTeamsManifest())}
        >
          <IconButton
            ariaLabel={formatMessage('Download Icon')}
            menuIconProps={{ iconName: 'Download' }}
            styles={{
              root: {
                height: 'unset',
                float: 'right',
                marginRight: '10px',
              },
              menuIcon: {
                backgroundColor: NeutralColors.white,
                color: NeutralColors.gray130,
                fontSize: FontSizes.size16,
              },
              rootDisabled: {
                backgroundColor: NeutralColors.white,
              },
            }}
          />
        </a>
        <IconButton
          ariaLabel={formatMessage('Copy Icon')}
          menuIconProps={{ iconName: 'Copy' }}
          styles={{
            root: {
              height: 'unset',
              float: 'right',
              marginRight: '10px',
            },
            menuIcon: {
              backgroundColor: NeutralColors.white,
              color: NeutralColors.gray130,
              fontSize: FontSizes.size16,
            },
            rootDisabled: {
              backgroundColor: NeutralColors.white,
            },
          }}
          onClick={() => {
            copyCodeToClipboard();
          }}
        />
      </div>
      <TextField
        multiline
        componentRef={textFieldRef}
        rows={25}
        styles={{ root: { marginTop: '10px' }, fieldGroup: { backgroundColor: '#f3f2f1' } }}
        value={generateTeamsManifest()}
      />
      <DialogFooter>
        <DefaultButton
          text={formatMessage('Close')}
          onClick={() => {
            props.onDismiss();
          }}
        />
        <PrimaryButton
          href="https://teams.microsoft.com/l/app/0c5cfdbb-596f-4d39-b557-5d9516c94107"
          target="_blank"
          text={formatMessage('Open Teams')}
        />
      </DialogFooter>
    </DialogWrapper>
  );
};
