import formatMessage from 'format-message';
import { ChoiceGroup } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import React, { useState, useContext, useEffect } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import jsonlint from 'jsonlint-webpack';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/theme/neat.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/json-lint';
import './style.css';

import { StoreContext } from './../../../store';
import { isAbsHosted } from './../../../utils/envUtil';
import { obfuscate } from './../../../utils/objUtil';

window.jsonlint = jsonlint;

const cmOptions = {
  theme: 'neat',
  mode: {
    name: 'javascript',
    json: true,
    statementIndent: 2,
  },
  lineWrapping: true,
  indentWithTabs: false,
  lint: true,
  tabSize: 2,
  smartIndent: true,
};

const hostControlLabels = {
  showKeys: formatMessage('Show keys'),
  productionSlot: formatMessage('Currently published'),
  integrationSlot: formatMessage('In proress'),
  botSettings: formatMessage('Bot settings'),
  botSettingDescription: formatMessage(
    'Settings contains detailed information about your bot. For security reasons, they are hidden by default. To test your bot or publish to Azure, you may need to provide these settings.'
  ),
  learnMore: formatMessage('Learn more.'),
};

export const DialogSettings = () => {
  const { state, actions } = useContext(StoreContext);
  const { botName, settings: origSettings, editDialogSettings, botEnvironment } = state;
  const absHosted = isAbsHosted();
  const { luis, MicrosoftAppPassword, MicrosoftAppId, ...settings } = origSettings;
  const managedSettings = { luis, MicrosoftAppPassword, MicrosoftAppId };
  const visibleSettings = absHosted ? settings : origSettings;
  const [value, setValue] = useState(JSON.stringify(visibleSettings, null, 2));
  const [editing, setEditing] = useState(editDialogSettings);
  const [slot, setSlot] = useState(botEnvironment);
  const options = { ...cmOptions, readOnly: !editing };

  useEffect(() => {
    setValue(JSON.stringify(editing ? visibleSettings : obfuscate(visibleSettings), null, 2));
  }, [origSettings, editDialogSettings]);

  const updateFormData = (editor, data, newValue) => {
    try {
      setValue(newValue);
      const result = JSON.parse(newValue);
      try {
        const mergedResult = absHosted ? { ...managedSettings, ...result } : result;
        actions.setSettings(botName, mergedResult, absHosted ? slot : undefined);
      } catch (err) {
        console.error(err.message);
      }
    } catch (err) {
      //Do Nothing
    }
  };

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
    actions.setDialogSettingsSlot(option.key, editing);
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
    </div>
  );

  return botName ? (
    <div className="hosted-settings">
      {hostedControl()}
      {hostedToggle()}
      <div className="hosted-code-mirror">
        <CodeMirror
          value={value}
          onBeforeChange={updateFormData}
          options={options}
          className={absHosted ? 'CodeMirror-Hosted' : undefined}
        />
      </div>
    </div>
  ) : (
    <div>{formatMessage('Data loading...')}</div>
  );
};
