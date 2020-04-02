// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useContext } from 'react';
import { JsonEditor } from '@bfc/code-editor';
import formatMessage from 'format-message';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { ChoiceGroup } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';

import { StoreContext } from '../../../store';
import { isAbsHosted } from '../../../utils/envUtil';

import { hostedSettings, hostedControls, hostedControlsTitle, hostedToggle, slotChoice, settingsEditor } from './style';

const hostControlLabels = {
  showKeys: formatMessage('Show keys'),
  productionSlot: formatMessage('In production'),
  integrationSlot: formatMessage('In test'),
  botSettings: formatMessage('Settings'),
  botSettingDescription: formatMessage(
    'Settings contains detailed information about your bot. For security reasons, they are hidden by default. To test your bot or publish to Azure, you may need to provide these settings.'
  ),
  learnMore: formatMessage('Learn more.'),
};

export const DialogSettings = () => {
  const { state, actions } = useContext(StoreContext);
  const { botName, settings: origSettings, botEnvironment, projectId } = state;
  const absHosted = isAbsHosted();
  const { luis, MicrosoftAppPassword, MicrosoftAppId, ...settings } = origSettings;
  const managedSettings = { luis, MicrosoftAppPassword, MicrosoftAppId };
  const visibleSettings = absHosted ? settings : origSettings;
  const [value, setValue] = useState(visibleSettings);
  const [editing, setEditing] = useState(false);
  const [slot, setSlot] = useState(botEnvironment === 'editing' ? 'integration' : botEnvironment);

  const changeEditing = (_, on) => {
    setEditing(on);
    console.log(on);
    actions.setEditDialogSettings(projectId, on, absHosted ? slot : undefined);
  };

  const slots = [
    { key: 'production', text: hostControlLabels.productionSlot, checked: slot === 'production' },
    { key: 'integration', text: hostControlLabels.integrationSlot, checked: slot === 'integration' },
  ];

  const changeSlot = (_, option) => {
    setSlot(option.key);
    actions.setDialogSettingsSlot(projectId, editing, option.key);
  };

  const saveChangeResult = result => {
    try {
      const mergedResult = absHosted ? { ...managedSettings, ...result } : result;
      actions.setSettings(projectId, botName, mergedResult, absHosted ? slot : undefined);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err.message);
    }
  };

  const handleChange = (result, commit) => {
    setValue(result);
    console.log('on change');
    if (commit && editing) {
      saveChangeResult(result);
    }
  };

  const hostedControl = () => (
    <div css={hostedControls}>
      <h1 css={hostedControlsTitle}>{hostControlLabels.botSettings}</h1>
      <p>
        {hostControlLabels.botSettingDescription}
        &nbsp;
        <Link
          href={
            absHosted
              ? 'https://aka.ms/absh/docs/settings'
              : 'https://github.com/microsoft/BotFramework-Composer/blob/stable/docs/deploy-bot.md'
          }
          target="_blank"
        >
          {hostControlLabels.learnMore}
        </Link>
      </p>
      {absHosted ? <ChoiceGroup options={slots} onChange={changeSlot} css={slotChoice} selectedKey={slot} /> : null}
    </div>
  );

  const toggle = () => (
    <div css={hostedToggle}>
      <Toggle label={hostControlLabels.showKeys} inlineLabel onChange={changeEditing} defaultChecked={editing} />
      {/* {absHosted && (
        <DefaultButton disabled={!editing} text={formatMessage('Save')} onClick={() => handleChange(value, true)} />
      )} */}
    </div>
  );

  return botName ? (
    <div css={hostedSettings}>
      {hostedControl()}
      {toggle()}
      <div css={settingsEditor}>
        <JsonEditor
          onChange={x => handleChange(x, true)}
          options={{ readOnly: !editing }}
          value={visibleSettings}
          obfuscate={!editing}
        />
      </div>
    </div>
  ) : (
    <div>{formatMessage('Data loading...')}</div>
  );
};
