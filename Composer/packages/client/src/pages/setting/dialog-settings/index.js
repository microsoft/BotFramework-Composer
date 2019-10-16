import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
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

  const slots = [{ key: 'production', text: 'Production' }, { key: 'integration', text: 'Integration' }];

  const changeSlot = (_, option) => {
    setSlot(option.key);
    actions.setDialogSettingsSlot(option.key, editing);
  };

  const hostedControl = () =>
    absHosted ? (
      <div className="hosted-controls">
        <Toggle label="edit" inlineLabel onChange={changeEditing} defaultChecked={editing} />
        <Dropdown label="slot:" options={slots} onChange={changeSlot} selectedKey={slot} className="slot-dropdown" />
      </div>
    ) : null;

  return botName ? (
    <div>
      {hostedControl()}
      <div>
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
