// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CommandBar, ICommandBarItemProps } from '@fluentui/react/lib/CommandBar';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { observer } from 'mobx-react';
import * as React from 'react';
import { CommandBarUploadButton } from 'src/app/components/common/CommandBarUpload';
import { PropertyBuilder } from 'src/app/components/PropertyBuilder';
import { Context } from 'src/app/context/Context';
import { getScopedTheme, getStylistV2 } from 'src/app/theme/stylist';
import { hexToRBGA } from 'src/app/utils/color';
import { useUndoKeyBinding } from 'src/app/utils/hooks/useUndoKeyBinding';

const downloadFile = async (fileName: string, content: string) => {
  const blob = new Blob([content], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = `${fileName}.schema`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const { styleDiv } = getStylistV2('VisualEditor');
const theme = getScopedTheme('VisualEditor');

const EditorRoot = styleDiv('EditorRoot', {
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  overflowY: 'auto',
});

type Props = {
  schemaExtension: string;
  showThemePicker?: boolean;
  onReset: () => void;
};

export const VisualEditor = observer((props: Props) => {
  const { onReset, showThemePicker = false, schemaExtension } = props;

  const { dispatcher, settingsStore, dataStore } = React.useContext(Context);
  const { schema, history } = dataStore;

  const propertyLengthRef = React.useRef(schema?.properties?.length || 0);
  const containerRef = React.useRef<HTMLDivElement>();
  useUndoKeyBinding();

  React.useEffect(() => {
    if (containerRef.current && schema?.properties?.length && schema?.properties?.length > propertyLengthRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight - containerRef.current.clientHeight;
    }
  }, [schema?.properties?.length]);

  const importSchema = (file: File) => {
    dispatcher.dispatch('importSchema', { id: schema.name, file });
  };

  const menuItems: ICommandBarItemProps[] = [
    {
      key: 'add',
      iconProps: { iconName: 'Add' },
      title: 'Add Property',
      ariaLabel: 'Add Property',
      onClick: () => {
        dispatcher.dispatch('addProperty');
      },
    } as ICommandBarItemProps,
    {
      key: 'undo',
      iconProps: { iconName: 'Undo' },
      title: 'Undo',
      ariaLabel: 'Undo',
      disabled: !history.canUndo,
      onClick: () => {
        dispatcher.dispatch('undo');
      },
    } as ICommandBarItemProps,
    {
      key: 'redo',
      iconProps: { iconName: 'Redo' },
      title: 'Redo',
      ariaLabel: 'Redo',
      disabled: !history.canRedo,
      onClick: () => {
        dispatcher.dispatch('redo');
      },
    } as ICommandBarItemProps,
  ];

  if (showThemePicker) {
    menuItems.push({
      key: 'theme',
      onRender: () => (
        <Dropdown
          options={['light', 'dark'].map<IDropdownOption>((opt) => ({ key: opt, text: opt }))}
          selectedKey={settingsStore.themeName}
          styles={{ root: { width: 120, alignSelf: 'center', marginLeft: 8 } }}
          onChange={(_e, option) => {
            dispatcher.dispatch('changeTheme', { themeName: option.key as ThemeName });
          }}
        />
      ),
    } as ICommandBarItemProps);
  }

  const farMenuItems = [
    {
      key: 'import',
      onRender: () => <CommandBarUploadButton accept={schemaExtension} onUpload={importSchema} />,
    },
    {
      key: 'download',
      iconProps: { iconName: 'Download' },
      text: 'Download',
      title: 'Download JSON Schema',
      ariaLabel: 'Download JSON Schema',
      disabled: !schema.properties.length || !schema.isValid,
      onClick: () => {
        downloadFile(schema.name, schema.toJson);
      },
    },
    {
      key: 'reset',
      iconProps: { iconName: 'Refresh' },
      text: 'Start Over',
      title: 'Start Over',
      ariaLabel: 'Start Over',
      onClick: () => {
        if (confirm('Are you sure you want to start over?')) {
          onReset();
        }
      },
    },
  ];

  return (
    <>
      <CommandBar
        farItems={farMenuItems}
        items={menuItems}
        styles={{
          root: {
            position: 'relative',
            zIndex: 1,
            padding: '0 12px',
            boxShadow: `0 4px 5px 0 ${hexToRBGA(theme.baseShadowColor, 0.25)}`,
          },
        }}
      />
      <EditorRoot originalRef={containerRef}>
        <PropertyBuilder schema={schema} />
      </EditorRoot>
    </>
  );
});
