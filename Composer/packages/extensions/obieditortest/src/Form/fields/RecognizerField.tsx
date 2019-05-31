import React, { useState } from 'react';
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
import { JSONSchema6 } from 'json-schema';
import classnames from 'classnames';
import { FontSizes } from '@uifabric/styling';

import './styles.scss';
import { BaseField } from './BaseField';

function LuEditor(props) {
  const [showEditor, setShowEditor] = useState(true);

  if (!props.formData) {
    return null;
  }

  return (
    <>
      <Link
        onClick={() => setShowEditor(!showEditor)}
        styles={{ root: { fontSize: FontSizes.smallPlus, marginBottom: '10px' } }}
      >
        {showEditor
          ? formatMessage('Hide {title}', { title: props.title })
          : formatMessage('View {title}', { title: props.title })}
      </Link>
      {showEditor && props.children()}
    </>
  );
}

export const RecognizerField: React.FC<FieldProps<MicrosoftIRecognizer>> = props => {
  const { formData, registry } = props;

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
            return <TextField value={selectedFile.content} rows={20} multiline />;
          }

          const {
            fields: { ObjectField },
          } = registry;
          const recognizerSchema =
            formData && typeof formData === 'object'
              ? (props.schema.oneOf as JSONSchema6[]).find(s => s.title === formData.$type)
              : {};
          return <ObjectField {...props} schema={recognizerSchema as JSONSchema6} uiSchema={{}} />;
        }}
      </LuEditor>
    </BaseField>
  );
};
