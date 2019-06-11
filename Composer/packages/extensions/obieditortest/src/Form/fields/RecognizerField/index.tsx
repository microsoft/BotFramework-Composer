import React from 'react';
import formatMessage from 'format-message';
import { FieldProps } from '@bfdesigner/react-jsonschema-form';
import { DefaultButton, IContextualMenuItem, Label, Link, ContextualMenuItemType } from 'office-ui-fabric-react';
import classnames from 'classnames';
import { FontSizes } from '@uifabric/styling';

import { BaseField } from '../BaseField';

import ToggleEditor from './ToggleEditor';
import RegexEditor from './RegexEditor';
import InlineLuEditor from './InlineLuEditor';
import './styles.scss';

export const RecognizerField: React.FC<FieldProps<MicrosoftIRecognizer>> = props => {
  const { formData, formContext } = props;

  const {
    formContext: { luFiles, shellApi, dialogName },
    onChange,
  } = props;

  const changeLuFile = (e, item) => {
    if (item) {
      onChange(`${item.key}.lu`);
    }
  };

  const isRegex = typeof formData === 'object' && formData.$type === 'Microsoft.RegexRecognizer';
  const selectedFile =
    typeof props.formData === 'string' ? luFiles.find(f => (props.formData as string).startsWith(f.id)) : null;

  const menuItems: IContextualMenuItem[] = luFiles.sort().map(f => ({
    key: f.id,
    text: f.id,
    canCheck: true,
    checked: f === selectedFile,
    disabled: f === selectedFile,
    iconProps: { iconName: 'People' },
  }));

  if (luFiles.findIndex(f => f.id === dialogName) === -1) {
    menuItems.push(
      {
        key: 'divider1',
        itemType: ContextualMenuItemType.Divider,
      },
      {
        key: 'add',
        text: formatMessage('Add Luis Recognizer'),
        iconProps: { iconName: 'Add' },
        onClick: () => {
          const { createLuFile } = shellApi;
          createLuFile(dialogName).then(() => {
            onChange(`${dialogName}.lu`);
          });
        },
      }
    );
  }

  if (selectedFile || !formData) {
    menuItems.push(
      {
        key: 'divider2',
        itemType: ContextualMenuItemType.Divider,
      },
      {
        key: 'regex',
        text: formatMessage('Use Regex Recognizer'),
        iconProps: { iconName: 'Code' },
        onClick: () => {
          onChange({ $type: 'Microsoft.RegexRecognizer' });
        },
      }
    );
  }

  if (selectedFile || isRegex) {
    menuItems.push(
      {
        key: 'divider3',
        itemType: ContextualMenuItemType.Divider,
      },
      {
        key: 'remove',
        text: formatMessage('Remove Recognizer'),
        iconProps: { iconName: 'Delete' },
        onClick: () => {
          onChange(undefined);
        },
      }
    );
  }

  return (
    <BaseField {...props}>
      <div className="LuFileSelector">
        <Label className={classnames('LuFileSelectorLabel')}>{formatMessage('LU File Name')}</Label>
        <div className="LuFileSelectorFile">
          <Link
            onClick={() => {
              if (selectedFile) {
                shellApi.shellNavigate('lu', { id: selectedFile.id });
              }
            }}
            styles={{ root: { fontSize: FontSizes.medium, padding: '5px 10px' } }}
            disabled={!selectedFile}
          >
            {selectedFile ? props.formData : 'No Lu File Selected'}
          </Link>
        </div>
        <div className="LuFileSelectorMenu">
          <DefaultButton
            menuIconProps={{ iconName: 'More' }}
            menuProps={{ items: menuItems, isBeakVisible: true, onItemClick: changeLuFile }}
            styles={{ root: { minWidth: '40px' } }}
            ariaLabel={formatMessage('Select another .lu file')}
          />
        </div>
      </div>
      <ToggleEditor title={selectedFile ? 'text editor' : 'regex editor'} formData={formData}>
        {() => {
          if (selectedFile) {
            const updateLuFile = (newValue?: string) => {
              const { updateLuFile } = formContext.shellApi;
              updateLuFile({ id: selectedFile.id, content: newValue });
            };

            return <InlineLuEditor file={selectedFile} onSave={updateLuFile} />;
          }

          if (isRegex) {
            return <RegexEditor {...props} />;
          }
        }}
      </ToggleEditor>
    </BaseField>
  );
};
