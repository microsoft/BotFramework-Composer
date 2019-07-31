import React, { Fragment, useState, useEffect, useRef } from 'react';
import { render } from 'react-dom';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { PrimaryButton, DefaultButton, DirectionalHint } from 'office-ui-fabric-react';
import debounce from 'lodash.debounce';
import nanoid from 'nanoid';
import { initializeIcons } from '@uifabric/icons';

import Example from '../../src';
import { ShellApi, LuFile } from '../../src/types';
import { buildDialogOptions } from '../../src/Form/utils';

import editorSchema from './editorschema.json';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/neat.css';

import './styles.scss';

initializeIcons(undefined, { disableWarnings: true });

const cmOptions = {
  theme: 'material',
  viewportMargin: Infinity,
  mode: {
    name: 'javascript',
    json: true,
    statementIndent: 2,
  },
  lineNumbers: true,
  lineWrapping: true,
  indentWithTabs: false,
  tabSize: 2,
  smartIndent: true,
};

const defaultData = {
  $type: 'Microsoft.TextInput',
};

const defaultMemory = {
  user: {
    name: 'Chris',
  },
  converation: {},
  dialog: {},
  turn: {},
};

const dialogFiles = [
  {
    id: 'Main',
    displayName: 'MyCustomDialog1',
    name: 'Main.dialog',
    relativePath: 'Main/Main.dialog',
    path: '/Some/Cool/Path/Main/Main.dialog',
    isRoot: true,
    content: {
      $type: 'Microsoft.AdaptiveDialog',
      recognizer: 'Main',
    },
  },
  {
    id: 'MyCustomDialog2',
    displayName: 'MyCustomDialog2',
    name: 'MyCustomDialog2.dialog',
    relativePath: 'MyCustomDialog2.dialog',
    path: '/Some/Cool/Path/MyCustomDialog2.dialog',
    isRoot: false,
    content: {
      $type: 'Microsoft.AdaptiveDialog',
    },
  },
  {
    id: 'MyCustomDialog3',
    displayName: 'MyCustomDialog3',
    name: 'MyCustomDialog3.dialog',
    relativePath: 'MyCustomDialog3.dialog',
    path: '/Some/Cool/Path/MyCustomDialog3.dialog',
    isRoot: false,
    content: {
      $type: 'Microsoft.AdaptiveDialog',
    },
  },
  {
    id: 'MyCustomDialog4',
    displayName: 'MyCustomDialog4',
    name: 'MyCustomDialog4.dialog',
    relativePath: 'MyCustomDialog4.dialog',
    path: '/Some/Cool/Path/MyCustomDialog4.dialog',
    isRoot: false,
    content: {
      $type: 'Microsoft.AdaptiveDialog',
    },
  },
];

const luFiles: LuFile[] = [
  {
    id: 'Main',
    relativePath: 'SomePath/Main',
    content: '## FirstHello\n-Hi\n\n## FirstGoodBye\n-Goodbye',
    parsedContent: {
      LUISJsonStructure: {
        intents: [{ name: 'FirstHello' }, { name: 'FirstGoodBye' }],
        utterances: [{ intent: 'FirstHello', text: 'Hi' }, { intent: 'FirstGoodBye', text: 'Goodbye' }],
      },
    },
  },
  {
    id: 'MyCustomDialog2',
    relativePath: 'SomePath/MyCustomDialog2',
    content: '## SecondHello\n-Good morning\n\n## SecondGoodBye\n-See ya!',
    parsedContent: {
      LUISJsonStructure: {
        intents: [{ name: 'SecondHello' }, { name: 'SecondGoodBye' }],
        utterances: [{ intent: 'SecondHello', text: 'Good morning' }, { intent: 'SecondGoodBye', text: 'See ya!' }],
      },
    },
  },
  {
    id: 'MyCustomDialog3',
    relativePath: 'SomePath/MyCustomDialog3',
    content: '## ThirdHello\n-Hello\n\n## ThirdGoodBye\n-Later',
    parsedContent: {
      LUISJsonStructure: {
        intents: [{ name: 'ThirdHello' }, { name: 'ThirdGoodbye' }],
        utterances: [{ intent: 'ThirdHello', text: 'Hello' }, { intent: 'ThirdGoodbye', text: 'Later' }],
      },
    },
  },
];

const lgFiles = [
  {
    id: 'common',
    relativePath: 'common/common.lg',
    content: '',
  },
];

function getDefaultData() {
  const storage = window.sessionStorage.getItem('formData');

  if (storage) {
    return JSON.parse(storage);
  }

  return defaultData;
}

function getDefaultMemory() {
  const storage = window.sessionStorage.getItem('memoryFormData');

  if (storage) {
    return JSON.parse(storage);
  }

  return defaultMemory;
}

const mockShellApi = [
  'getState',
  'getData',
  'getDialogs',
  'saveData',
  'navTo',
  'navDown',
  'focusTo',
  'shellNavigate',
  'updateLuFile',
  'updateLgFile',
  'createLuFile',
  'createLgFile',
  'getLgTemplates',
  'createLgTemplate',
  'updateLgTemplate',
].reduce((mock, api) => {
  mock[api] = (...args) =>
    new Promise(resolve => {
      console.info(`shellApi.${api} called with`, ...args);
      resolve();
    });
  return mock;
}, {});

const Demo: React.FC = () => {
  const [dirtyFormData, setDirtyFormData] = useState(null);
  const [memoryData, setMemoryData] = useState(JSON.stringify(getDefaultMemory(), null, 2));
  const [dialogSelected, setDialogSelected] = useState(true);
  const [memorySelected, setMemorySelected] = useState(false);
  const [editorSchemaSelected, setEditorSchemaSelected] = useState(false);
  const [editorSchemaData, setEditorSchemaData] = useState(JSON.stringify(editorSchema, null, 2));
  const [editorSchemaFormData, setEditorSchemaFormData] = useState({ content: editorSchema });
  const [editorSchemaValid, setEditorSchemaValid] = useState(true);
  const [formData, setFormData] = useState(getDefaultData());
  const [memoryFormData, setMemoryFormData] = useState(getDefaultMemory());
  const [navPath, setNavPath] = useState(nanoid());
  const debouncedOnChange = useRef(debounce(setFormData, 200)).current;

  const [isValid, setValid] = useState(true);
  const [isMemoryValid, setMemoryValid] = useState(true);

  useEffect(() => {
    window.sessionStorage.setItem('formData', JSON.stringify(formData));
    window.sessionStorage.setItem('memoryFormData', JSON.stringify(memoryFormData));
  }, [formData, memoryFormData]);

  const updateFormData = (editor, data, value) => {
    try {
      const parsed = JSON.parse(value);
      setFormData(parsed);
      setDirtyFormData(null);
      setValid(true);
    } catch (err) {
      setDirtyFormData(value);
      setValid(false);
    }
  };

  const updateMemoryData = (editor, data, value) => {
    try {
      const parsed = JSON.parse(value);
      setMemoryFormData(parsed);
      setMemoryValid(true);
    } catch (err) {
      setMemoryValid(false);
    }
  };

  const updateEditorSchemaData = (editor, data, value) => {
    try {
      const parsed = JSON.parse(value);
      setEditorSchemaFormData({ content: parsed });
      setEditorSchemaValid(true);
    } catch (err) {
      setEditorSchemaValid(false);
    }
  };

  const handlePaste = updater => (_, e) => {
    e.preventDefault();

    const data = (e.clipboardData || (window as any).clipboardData).getData('Text');

    if (data) {
      try {
        const parsed = JSON.parse(data);
        updater(parsed);
      } catch (err) {
        // do nothing
      }
    }
  };

  const handleDialogSelect = type => {
    return () => {
      setDialogSelected(false);
      setMemorySelected(false);
      setEditorSchemaSelected(false);
      type(true);
    };
  };

  return (
    <div className="DemoContainer">
      <div style={{ display: 'flex', flexDirection: 'column' }} className="DemoJSONContainer">
        <div style={{ fontSize: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <DefaultButton
              data-automation-id="test"
              allowDisabledFocus={true}
              checked={dialogSelected}
              text="Dialog"
              onClick={handleDialogSelect(setDialogSelected)}
            />
            <DefaultButton
              data-automation-id="test"
              allowDisabledFocus={true}
              checked={memorySelected}
              text="Memory"
              onClick={handleDialogSelect(setMemorySelected)}
            />
            <DefaultButton
              data-automation-id="test"
              allowDisabledFocus={true}
              checked={editorSchemaSelected}
              text="EditorSchema"
              onClick={handleDialogSelect(setEditorSchemaSelected)}
            />
          </div>
          {dialogSelected && (
            <PrimaryButton
              style={{ width: '200px' }}
              title="Dialog Types"
              menuProps={{
                items: buildDialogOptions({ onClick: (_, item) => setFormData(item.data) }),
                directionalHint: DirectionalHint.bottomAutoEdge,
              }}
            >
              Dialog Types
            </PrimaryButton>
          )}
        </div>
        {dialogSelected && (
          <Fragment>
            <CodeMirror
              value={dirtyFormData || JSON.stringify(formData, null, 2)}
              options={cmOptions}
              onBeforeChange={updateFormData}
              onChange={updateFormData}
              autoCursor
              onPaste={handlePaste(setFormData)}
              className={isValid ? '' : 'CodeMirror--error'}
            />
          </Fragment>
        )}
        {memorySelected && (
          <Fragment>
            <CodeMirror
              value={memoryData}
              options={cmOptions}
              onBeforeChange={(editor, data, value) => {
                setMemoryData(value);
              }}
              onChange={updateMemoryData}
              autoCursor
              onPaste={handlePaste(setMemoryData)}
              className={isMemoryValid ? '' : 'CodeMirror--error'}
            />
          </Fragment>
        )}
        {editorSchemaSelected && (
          <Fragment>
            <CodeMirror
              value={editorSchemaData}
              options={cmOptions}
              onBeforeChange={(editor, data, value) => {
                setEditorSchemaData(value);
              }}
              onChange={updateEditorSchemaData}
              autoCursor
              onPaste={handlePaste(setEditorSchemaData)}
              className={editorSchemaValid ? '' : 'CodeMirror--error'}
            />
          </Fragment>
        )}
      </div>
      <div className="DemoForm">
        <Example
          navPath={navPath}
          focusPath={navPath}
          data={formData}
          dialogs={dialogFiles}
          memory={memoryFormData}
          onChange={debouncedOnChange}
          schemas={{ editor: editorSchemaFormData }}
          shellApi={mockShellApi as ShellApi}
          luFiles={luFiles}
          lgFiles={lgFiles}
          currentDialog={dialogFiles[0]}
          isRoot={true}
        />
      </div>
    </div>
  );
};

render(<Demo />, document.querySelector('#demo'));
