import { ChoiceGroup } from 'office-ui-fabric-react/lib/ChoiceGroup';
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

import { ToolBarPortal } from './../toolBarPortal';
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
    { key: 'production', text: 'Currently published', checked: slot === 'production' },
    { key: 'integration', text: 'In progress', checked: slot === 'integration' },
  ];

  const changeSlot = (_, option) => {
    setSlot(option.key);
    actions.setDialogSettingsSlot(option.key, editing);
  };

  const hostedControl = () =>
    absHosted ? (
      <div className="hosted-controls">
        <ToolBarPortal>
          <Toggle label="Show keys" inlineLabel onChange={changeEditing} defaultChecked={editing} />
        </ToolBarPortal>
        <h2>Bot settings</h2>
        <p>
          Here goes copy that describes what this is and why this is hidden by default which is for security reasons.
          And there should be a link to documentation if you dont understand why this is a big deal.
        </p>
        <ChoiceGroup options={slots} onChange={changeSlot} className="slot-choice" selectedKey={slot} />
      </div>
    ) : null;

  return botName ? (
    <div className={absHosted ? 'hosted-settings' : undefined}>
      {hostedControl()}
      <div className={absHosted ? 'hosted-code-mirror' : undefined}>
        <CodeMirror
          value={value}
          onBeforeChange={updateFormData}
          options={options}
          className={absHosted ? 'CodeMirror-Hosted' : undefined}
        />
      </div>
    </div>
  ) : (
    <div>Data Loading...</div>
  );
};
