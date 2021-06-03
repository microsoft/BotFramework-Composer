// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { FluentTheme, NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { OpenConfirmModal } from '@bfc/ui-shared';

import {
  allFormDialogPropertyIdsSelector,
  formDialogSchemaAtom,
  formDialogSchemaJsonSelector,
  formDialogSchemaValidSelector,
} from '../atoms/appState';
import { useHandlers } from '../atoms/handlers';
import { useUndo } from '../undo/useUndo';
import { useUndoKeyBinding } from '../utils/hooks/useUndoKeyBinding';

import { CommandBarUploadButton } from './common/CommandBarUpload';
import { FormDialogSchemaDetails } from './property/FormDialogSchemaDetails';

const Root = styled(Stack)({
  backgroundColor: NeutralColors.gray20,
  position: 'relative',
});

const EditorRoot = styled.div({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  overflowY: 'auto',
});

const GenerationProgressIndicator = styled(ProgressIndicator)({
  position: 'absolute',
  top: 80,
  width: '100%',
});

const ListCommandBar = styled(CommandBar)({
  position: 'relative',
  margin: '0 0 1px 0',
  '& .ms-CommandBar': {
    padding: '0 12px',
  },
  '& .ms-OverflowSet-item': {
    alignItems: 'center',
  },
});

const SchemaName = styled(Stack)({
  height: 44,
  padding: '0 24px',
  backgroundColor: FluentTheme.palette.white,
});

const downloadFile = async (fileName: string, schemaExtension: string, content: string) => {
  const blob = new Blob([content], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = `${fileName}.${schemaExtension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

type Props = {
  schemaExtension: string;
  isGenerating: boolean;
  allowUndo: boolean;
  onReset: () => void;
  onGenerateDialog: (schemaId: string) => void;
};

export const FormDialogPropertiesEditor = React.memo((props: Props) => {
  const { onReset, onGenerateDialog, schemaExtension, allowUndo, isGenerating } = props;

  const schema = useRecoilValue(formDialogSchemaAtom);
  const propertyIds = useRecoilValue(allFormDialogPropertyIdsSelector);
  const schemaValid = useRecoilValue(formDialogSchemaValidSelector);
  const schemaJson = useRecoilValue(formDialogSchemaJsonSelector);

  const { importSchema, addProperty } = useHandlers();

  const schemaIdRef = React.useRef<string>(schema.id);

  const { undo, redo, canUndo, canRedo } = useUndo();
  useUndoKeyBinding();

  React.useEffect(() => {
    schemaIdRef.current = schema.id;
  }, [schema.id]);

  const upload = (file: File) => {
    importSchema({ id: schema.id, file });
  };

  const generateDialog = React.useCallback(() => {
    onGenerateDialog(schema.name);
  }, [onGenerateDialog, schema]);

  const menuItems: ICommandBarItemProps[] = [
    {
      key: 'add',
      text: formatMessage('Add Property'),
      iconProps: { iconName: 'Add' },
      title: formatMessage('Add Property'),
      ariaLabel: formatMessage('Add Property'),
      disabled: isGenerating,
      onClick: () => {
        addProperty();
      },
    },
    ...(allowUndo
      ? [
          {
            key: 'undo',
            text: formatMessage('Undo'),
            iconProps: { iconName: 'Undo' },
            title: formatMessage('Undo'),
            ariaLabel: formatMessage('Undo'),
            disabled: isGenerating || !canUndo(),
            onClick: () => {
              undo();
            },
          },
          {
            key: 'redo',
            text: formatMessage('Redo'),
            iconProps: { iconName: 'Redo' },
            title: formatMessage('Redo'),
            ariaLabel: formatMessage('Redo'),
            disabled: isGenerating || !canRedo(),
            onClick: () => {
              redo();
            },
          },
        ]
      : []),
    {
      key: 'import',
      onRender: () => <CommandBarUploadButton accept={schemaExtension} disabled={isGenerating} onUpload={upload} />,
    },
    {
      key: 'export',
      iconProps: { iconName: 'Export' },
      text: formatMessage('Export JSON'),
      title: formatMessage('Export JSON'),
      ariaLabel: formatMessage('Export JSON'),
      disabled: !propertyIds.length || !schemaValid,
      onClick: () => {
        downloadFile(schema.name, schemaExtension, schemaJson);
      },
    },
    {
      key: 'reset',
      iconProps: { iconName: 'Clear' },
      text: formatMessage('Clear all'),
      title: formatMessage('Clear all'),
      ariaLabel: formatMessage('Clear all'),
      disabled: isGenerating || !propertyIds.length,
      onClick: async () => {
        const result = await OpenConfirmModal(
          formatMessage('Start over?'),
          formatMessage('Are you sure you want to start over? Your progress will be lost.')
        );

        if (result) {
          onReset();
        }
      },
    },
  ];

  const farItems: ICommandBarItemProps[] = [
    {
      key: 'generate',
      onRender: () => (
        <DefaultButton
          ariaLabel={formatMessage('Generate dialog')}
          disabled={isGenerating || !propertyIds.length || !schemaValid}
          text={formatMessage('Generate dialog')}
          title={formatMessage('Generate dialog')}
          onClick={generateDialog}
        />
      ),
    },
  ];

  return (
    <Root verticalFill>
      <ListCommandBar farItems={farItems} items={menuItems} />
      <SchemaName verticalAlign="center">
        <Text>{schema.name}</Text>
      </SchemaName>
      {isGenerating && <GenerationProgressIndicator />}
      <EditorRoot>
        <FormDialogSchemaDetails />
      </EditorRoot>
    </Root>
  );
});
