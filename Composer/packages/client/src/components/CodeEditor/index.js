/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useState, useRef, useEffect } from 'react';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import AceEditor from 'react-ace';
import 'brace/mode/json';
import 'brace/mode/xml';
import 'brace/mode/javascript';
import 'brace/mode/csharp';
import 'brace/mode/markdown';
import 'brace/theme/github';
import 'brace/theme/tomorrow';

import { actionButton, flexContentSpaceBetween, buttonGroups } from './styles';

export default function CodeEditor(props) {
  const editorRef = useRef();
  const [content, setContent] = useState(props.value || '');
  const [readOnly, setReadOnly] = useState(props.readOnly === false ? false : true);
  const [contentChanged, setContentChanged] = useState(false);

  useEffect(() => {
    setContent(props.value);
    setReadOnly(props.readOnly === false ? false : true);
    setContentChanged(false);
  }, [props.value]);

  function onChange(newContent) {
    setContent(newContent);
    if (contentChanged === false) {
      setContentChanged(true);
    }
    if (typeof props.onChange === 'function') {
      props.onChange(newContent);
    }
  }

  function onValidate(annotations) {
    console.log('onValidate', annotations);
  }

  function onSave() {
    if (typeof props.onSave === 'function') {
      props.onSave(content);
    }
  }

  function toggleReadOnly() {
    setReadOnly(!readOnly);
  }

  function discardChanges() {
    setContent(props.value);
    setContentChanged(false);
  }

  return (
    <Fragment>
      <div css={flexContentSpaceBetween}>
        <div />
        <div css={buttonGroups}>
          {!readOnly && contentChanged && (
            <Fragment>
              <ActionButton iconProps={{ iconName: 'Save' }} onClick={() => onSave()}>
                Save file
              </ActionButton>
              <ActionButton iconProps={{ iconName: 'Undo' }} onClick={() => discardChanges()}>
                Discard changes
              </ActionButton>
            </Fragment>
          )}
          <Toggle
            css={actionButton}
            checked={!readOnly}
            onText="Edit ON&nbsp;"
            offText="Edit OFF"
            onChange={() => toggleReadOnly()}
          />
        </div>
      </div>

      <AceEditor
        ref={editorRef}
        mode={props.mode || 'json'}
        theme={readOnly ? 'tomorrow' : 'github'}
        readOnly={readOnly}
        onChange={onChange}
        onValidate={onValidate}
        name={`ace-editor-${Math.random()}`}
        fontSize={14}
        maxLines={30}
        minLines={10}
        showPrintMargin={false}
        showGutter={true}
        style={{ width: '100%', borderTop: '1px solid rgb(161, 159, 157)' }}
        highlightActiveLine={true}
        value={content}
        editorProps={{ $blockScrolling: 'Infinity' }}
      />
    </Fragment>
  );
}
