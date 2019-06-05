import React from 'react';
import formatMessage from 'format-message';
import { FieldProps } from '@bfdesigner/react-jsonschema-form';
import {
  DefaultButton,
  IContextualMenuItem,
  Label,
  Link,
  TextField,
  ContextualMenuItemType,
} from 'office-ui-fabric-react';
import classnames from 'classnames';
import { FontSizes } from '@uifabric/styling';

import { BaseField } from '../BaseField';

import LuEditor from './LuEditor';
import RegexEditor from './RegexEditor';
import './styles.scss';

export const RecognizerField: React.FC<FieldProps<MicrosoftIRecognizer>> = props => {
  const { formData, formContext } = props;

  const {
    formContext: { luFiles, shellApi },
    onChange,
  } = props;

  const changeLuFile = (e, item) => {
    if (item) {
      onChange(`${item.key}.lu`);
    }
  };

  const selectedFile =
    typeof props.formData === 'string' ? luFiles.find(f => (props.formData as string).startsWith(f.id)) : null;

  const menuItems: IContextualMenuItem[] = luFiles
    .filter(f => f !== selectedFile)
    .map(f => ({
      key: f.id,
      text: f.id,
      iconProps: { iconName: 'People' },
    }));

  if (selectedFile || !formData) {
    menuItems.push(
      {
        key: 'divider',
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
      <LuEditor title={selectedFile ? 'text editor' : 'regex editor'} formData={formData}>
        {() => {
          if (selectedFile) {
            const updateLuFile = (_, newValue?: string) => {
              const { updateLuFile } = formContext.shellApi;
              updateLuFile({ id: selectedFile.id, content: newValue });
            };

            return <TextField value={selectedFile.content || ''} rows={20} multiline onChange={updateLuFile} />;
          }

          if (typeof formData === 'object' && formData.$type === 'Microsoft.RegexRecognizer') {
            return <RegexEditor {...props} />;
          }
        }}
      </LuEditor>
    </BaseField>
  );
};
