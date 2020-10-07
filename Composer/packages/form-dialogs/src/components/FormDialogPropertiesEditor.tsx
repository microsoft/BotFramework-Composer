// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { FluentTheme, NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import * as React from 'react';
import { useRecoilValue } from 'recoil';
import {
  allFormDialogPropertyIdsSelector,
  formDialogSchemaAtom,
  formDialogSchemaJsonSelector,
  formDialogSchemaValidSelector,
} from 'src/atoms/appState';
import { useHandlers } from 'src/atoms/handlers';
import { CommandBarUploadButton } from 'src/components/common/CommandBarUpload';
import { FormDialogSchemaDetails } from 'src/components/property/FormDialogSchemaDetails';
import { useUndo } from 'src/undo/useUndo';
import { useUndoKeyBinding } from 'src/utils/hooks/useUndoKeyBinding';

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

const Root = styled(Stack)({
  backgroundColor: NeutralColors.gray20,
});

const EditorRoot = styled.div({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  overflowY: 'auto',
});

const ListCommandBar = styled(CommandBar)({
  position: 'relative',
  zIndex: 1,
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

type Props = {
  schemaExtension: string;
  allowUndo: boolean;
  onReset: () => void;
  onGenerateDialog: (formDialogSchemaJson: string) => void;
};

export const FormDialogPropertiesEditor = React.memo((props: Props) => {
  const { onReset, onGenerateDialog, schemaExtension, allowUndo } = props;

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

  const menuItems: ICommandBarItemProps[] = [
    {
      key: 'add',
      text: formatMessage('Add Property'),
      iconProps: { iconName: 'Add' },
      title: formatMessage('Add Property'),
      ariaLabel: formatMessage('Add Property'),
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
            disabled: !canUndo(),
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
            disabled: !canRedo(),
            onClick: () => {
              redo();
            },
          },
        ]
      : []),
    {
      key: 'import',
      onRender: () => <CommandBarUploadButton accept={schemaExtension} onUpload={upload} />,
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
      onClick: () => {
        if (confirm(formatMessage('Are you sure you want to start over? Your progress will be lost.'))) {
          onReset();
        }
      },
    },
  ];

  const generateDialog = React.useCallback(() => {
    onGenerateDialog(schemaJson);
  }, [schemaJson, onGenerateDialog]);

  const farItems: ICommandBarItemProps[] = [
    {
      key: 'generate',
      onRender: () => (
        <DefaultButton
          ariaLabel={formatMessage('Generate dialog')}
          disabled={!propertyIds.length || !schemaValid}
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
      <EditorRoot>
        <FormDialogSchemaDetails />
      </EditorRoot>
    </Root>
  );
});
