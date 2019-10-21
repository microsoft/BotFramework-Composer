import { RichEditor } from 'code-editor';
import formatMessage from 'format-message';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { ChoiceGroup } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import React, { useState, useContext, useEffect } from 'react';

import './style.css';

import { StoreContext } from './../../../store';
import { isAbsHosted } from './../../../utils/envUtil';
import { obfuscate } from './../../../utils/objUtil';

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
    <div className="hosted-controls">
      <h1>{hostControlLabels.botSettings}</h1>
      <p>
        {hostControlLabels.botSettingDescription}
        &nbsp;
        <Link href="//aka.ms/absh/docs/settings" target="_blank">
          {hostControlLabels.learnMore}
        </Link>
      </p>
      {absHosted ? (
        <ChoiceGroup options={slots} onChange={changeSlot} className="slot-choice" selectedKey={slot} />
      ) : null}
    </div>
  );

  const hostedToggle = () => (
    <div className="hosted-toggle">
      <Toggle label={hostControlLabels.showKeys} inlineLabel onChange={changeEditing} defaultChecked={editing} />
      {absHosted ? (
        <DefaultButton disabled={!editing} text={formatMessage('Save')} onClick={() => handleChange(value, true)} />
      ) : null}
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
    <div className="hosted-settings">
      {hostedControl()}
      {hostedToggle()}
      <div className="hosted-code-mirror">
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
