// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { FluentTheme } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { formDialogSchemaAtom, formDialogSchemaJsonSelector, formDialogSchemaValidSelector } from 'src/atoms/appState';
import { useHandlers } from 'src/atoms/handlers';
import { CommandBarUploadButton } from 'src/components/common/CommandBarUpload';
import { PropertyCardList } from 'src/components/property/PropertyCardList';
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

const EditorRoot = styled.div({
  backgroundColor: FluentTheme.palette.neutralLighter,
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  overflowY: 'auto',
});

const ListCommandBar = styled(CommandBar)('CommandBar', {
  position: 'relative',
  zIndex: 1,
  padding: '0 12px',
  borderBottom: `1px solid ${FluentTheme.palette.neutralTertiary}`,
  '& .ms-CommandBar': {
    padding: 0,
  },
  '& .ms-OverflowSet-item': {
    alignItems: 'center',
  },
});

type Props = {
  schemaExtension: string;
  showThemePicker?: boolean;
  onReset: () => void;
  onGenerateDialog: (formDialogSchemaJson: string) => void;
};

export const VisualEditor = React.memo((props: Props) => {
  const { onReset, onGenerateDialog, schemaExtension } = props;

  const schema = useRecoilValue(formDialogSchemaAtom);
  const schemaValid = useRecoilValue(formDialogSchemaValidSelector);
  const schemaJson = useRecoilValue(formDialogSchemaJsonSelector);
  const { importSchema, addProperty } = useHandlers();

  const schemaIdRef = React.useRef<string>(schema.id);
  const propertyLengthRef = React.useRef(schema.propertyIds.length);

  const containerRef = React.useRef<HTMLDivElement>();
  useUndoKeyBinding();

  React.useEffect(() => {
    if (
      containerRef.current &&
      schema.propertyIds.length &&
      schema.id === schemaIdRef.current &&
      schema.propertyIds.length === propertyLengthRef.current + 1
    ) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight - containerRef.current.clientHeight;
    } else {
      containerRef.current.scrollTop = 0;
    }
  }, [schema.propertyIds.length, schema.id]);

  React.useEffect(() => {
    schemaIdRef.current = schema.id;
  }, [schema.id]);

  React.useEffect(() => {
    if (schema.id === schemaIdRef.current) {
      propertyLengthRef.current = schema.propertyIds.length;
    }
  }, [schema.propertyIds.length]);

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
      disabled: !schema.propertyIds.length || !schemaValid,
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
          disabled={!schema.propertyIds.length || !schemaValid}
          text={formatMessage('Generate dialog')}
          title={formatMessage('Generate dialog')}
          onClick={generateDialog}
        />
      ),
    },
  ];

  return (
    <>
      <ListCommandBar farItems={farItems} items={menuItems} />
      <EditorRoot ref={containerRef}>
        <PropertyCardList />
      </EditorRoot>
    </>
  );
});
