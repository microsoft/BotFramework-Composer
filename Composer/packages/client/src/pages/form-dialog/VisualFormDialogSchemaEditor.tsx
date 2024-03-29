// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JsonEditor } from '@bfc/code-editor';
import { FormDialogSchemaEditor } from '@bfc/form-dialogs';
import { FileExtensions, FormDialogSchemaTemplate } from '@bfc/shared';
import styled from '@emotion/styled';
import { NeutralColors } from '@fluentui/theme';
import formatMessage from 'format-message';
import { ActionButton } from '@fluentui/react/lib/Button';
import { IStackProps, IStackStyles, Stack } from '@fluentui/react/lib/Stack';
import { classNamesFunction } from '@fluentui/react/lib/Utilities';
import * as React from 'react';
import { useRecoilValue } from 'recoil';

import { formDialogSchemaState, localeState, userSettingsState } from '../../recoilModel';
import TelemetryClient from '../../telemetry/TelemetryClient';

const Root = styled(Stack)<{
  inProgress: boolean;
}>(
  {
    position: 'relative',
    width: '100%',
    backgroundColor: NeutralColors.gray20,
  },
  (props) =>
    props.inProgress
      ? {
          '&:after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(255,255,255, 0.6)',
          },
        }
      : null,
);

const noop = () => {};
const defaultValue: object = {};

const editorTopBarStyles = classNamesFunction<IStackProps, IStackStyles>()({
  root: { backgroundColor: '#fff', height: '45px', marginBottom: 1 },
});

type Props = {
  projectId: string;
  schemaId: string;
  generationInProgress?: boolean;
  templates: FormDialogSchemaTemplate[];
  onChange: (id: string, content: string) => void;
  onGenerate: (schemaId: string) => void;
};

export const VisualFormDialogSchemaEditor = React.memo((props: Props) => {
  const { projectId, schemaId, templates, onChange, onGenerate, generationInProgress = false } = props;

  const locale = useRecoilValue(localeState(projectId));
  const schema = useRecoilValue(formDialogSchemaState({ projectId, schemaId }));
  const userSettings = useRecoilValue(userSettingsState);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = React.useRef<any>();
  const getEditorValueRef = React.useRef<() => string>(() => schema.content || JSON.stringify(defaultValue, null, 2));
  const dialogSchemaContentRef = React.useRef(schema.content || JSON.stringify(defaultValue, null, 2));

  const [showEditor, setShowEditor] = React.useState(false);

  React.useEffect(() => {
    if (showEditor) {
      dialogSchemaContentRef.current = schema.content || JSON.stringify(defaultValue, null, 2);
    }
    editorRef.current?.setValue(schema.content);
  }, [schema.content]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onEditorDidMount = (getValue: () => string, editor: any) => {
    editorRef.current = editor;
    getEditorValueRef.current = getValue;
    editorRef.current.setValue(dialogSchemaContentRef.current);
  };

  const onSchemaUpdated = (id: string, content: string) => {
    onChange(id, content);

    dialogSchemaContentRef.current = content;
    editorRef.current?.setValue(content);
  };

  return (
    <Root verticalFill inProgress={generationInProgress}>
      <Stack horizontal horizontalAlign="end" styles={editorTopBarStyles} verticalAlign="center">
        <ActionButton
          onClick={() => {
            setShowEditor(!showEditor);
            TelemetryClient.track('EditModeToggled', { jsonView: !showEditor });
          }}
        >
          {showEditor ? formatMessage('Hide code') : formatMessage('Show code')}
        </ActionButton>
      </Stack>

      <Stack
        grow
        styles={{
          root: {
            flex: 1,
            position: 'relative',
            overflowY: 'auto',
            backgroundColor: showEditor ? '#fff' : 'transparent',
          },
        }}
      >
        {!showEditor ? (
          <FormDialogSchemaEditor
            allowUndo
            editorId={`${projectId}:${schema.id}`}
            isGenerating={generationInProgress}
            locale={locale}
            schema={schema}
            schemaExtension={FileExtensions.FormDialogSchema}
            templates={templates}
            onGenerateDialog={onGenerate}
            onSchemaUpdated={onSchemaUpdated}
          />
        ) : (
          <JsonEditor
            editorDidMount={onEditorDidMount}
            editorSettings={{
              ...userSettings.codeEditor,
              fadedWhenReadOnly: false,
            }}
            height="calc(100%)"
            options={{ readOnly: true }}
            value={defaultValue}
            onChange={noop}
            onError={noop}
          />
        )}
      </Stack>
    </Root>
  );
});
