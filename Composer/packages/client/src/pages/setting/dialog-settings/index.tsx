/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useContext, useEffect } from 'react';
import { RichEditor } from 'code-editor';
import formatMessage from 'format-message';
import { DefaultButton, ChoiceGroup, Link, Toggle } from 'office-ui-fabric-react';

import { StoreContext } from '../../../store';
import { isAbsHosted } from '../../../utils/envUtil';
import { obfuscate } from '../../../utils/objUtil';

import { hostedSettings, hostedControls, hostedToggle, slotChoice, settingsEditor } from './style';

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
  const { botName, settings: origSettings, botEnvironment } = state;
  const absHosted = isAbsHosted();
  const { luis, MicrosoftAppPassword, MicrosoftAppId, ...settings } = origSettings;
  const managedSettings = { luis, MicrosoftAppPassword, MicrosoftAppId };
  const visibleSettings = absHosted ? settings : origSettings;
  const [value, setValue] = useState(JSON.stringify(visibleSettings, null, 2));
  const [editing, setEditing] = useState(false);
  const [slot, setSlot] = useState(botEnvironment === 'editing' ? 'integration' : botEnvironment);
  const [parseError, setParseError] = useState('');

  useEffect(() => {
    setValue(JSON.stringify(editing ? visibleSettings : obfuscate(visibleSettings), null, 2));
  }, [origSettings, editing]);

  const changeEditing = (_, on) => {
    setEditing(on);
    actions.setEditDialogSettings(on, absHosted ? slot : undefined);
  };

  const slots = [
    { key: 'production', text: hostControlLabels.productionSlot, checked: slot === 'production' },
    { key: 'integration', text: hostControlLabels.integrationSlot, checked: slot === 'integration' },
  ];

  const changeSlot = (_, option) => {
    setSlot(option.key);
    actions.setDialogSettingsSlot(editing, option.key);
  };

  const hostedControl = () => (
    <div css={hostedControls}>
      <h1>{hostControlLabels.botSettings}</h1>
      <p>
        {hostControlLabels.botSettingDescription}
        &nbsp;
        <Link href="//aka.ms/absh/docs/settings" target="_blank">
          {hostControlLabels.learnMore}
        </Link>
      </p>
      {absHosted ? <ChoiceGroup options={slots} onChange={changeSlot} css={slotChoice} selectedKey={slot} /> : null}
    </div>
  );

  const toggle = () => (
    <div css={hostedToggle}>
      <Toggle label={hostControlLabels.showKeys} inlineLabel onChange={changeEditing} defaultChecked={editing} />
      {absHosted && (
        <DefaultButton disabled={!editing} text={formatMessage('Save')} onClick={() => handleChange(value, true)} />
      )}
    </div>
  );

  const saveChangeResult = result => {
    try {
      const mergedResult = absHosted ? { ...managedSettings, ...result } : result;
      actions.setSettings(botName, mergedResult, absHosted ? slot : undefined);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleChange = (value, commit) => {
    setValue(value);
    try {
      const result = JSON.parse(value);
      if (commit || !absHosted) {
        saveChangeResult(result);
      }
    } catch (err) {
      setParseError('invalid json');
    }
  };

  const handleMount = monaco => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
    });
  };

  return botName ? (
    <div css={hostedSettings}>
      {hostedControl()}
      {toggle()}
      <div css={settingsEditor}>
        <RichEditor
          language="json"
          onChange={x => handleChange(x, false)}
          errorMsg={parseError}
          editorWillMount={handleMount}
          options={{ folding: true, readOnly: !editing }}
          value={value}
          helpURL="https://www.json.org"
        />
      </div>
    </div>
  ) : (
    <div>{formatMessage('Data loading...')}</div>
  );
};
