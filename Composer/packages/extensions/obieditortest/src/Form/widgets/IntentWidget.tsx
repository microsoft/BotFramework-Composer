import React from 'react';
import { Dropdown, ResponsiveMode, IDropdownOption } from 'office-ui-fabric-react';
import get from 'lodash.get';
import { NeutralColors } from '@uifabric/fluent-theme';

import { LuFile } from '../../types';
import { BFDWidgetProps } from '../types';

import './styles.scss';

export const IntentWidget: React.FC<BFDWidgetProps> = props => {
  const { label, onChange, onFocus, onBlur, value, formContext, schema, ...rest } = props;
  const { description } = schema;

  const luFile: LuFile | void = formContext.luFiles.find(f => f.id === formContext.currentDialog.id);
  let options: IDropdownOption[] = [{ key: '', text: '' }];

  if (luFile) {
    const intents: { name: string }[] = get(luFile, 'parsedContent.LUISJsonStructure.intents', []);

    options = options.concat(
      intents.map(i => ({
        key: i.name,
        text: i.name,
      }))
    );
  }

  const handleChange = (_e, option): void => {
    if (option) {
      onChange(option.key);
    }
  };

  return (
    <>
      <Dropdown
        {...rest}
        label={label}
        onBlur={() => onBlur(rest.id, value)}
        onChange={handleChange}
        onFocus={() => onFocus(rest.id, value)}
        options={options}
        selectedKey={value}
        responsiveMode={ResponsiveMode.large}
      />
      {description && (
        <span style={{ fontSize: '14px' }}>
          <span style={{ margin: 0, color: NeutralColors.gray130, fontSize: '11px' }}>{description}</span>
        </span>
      )}
    </>
  );
};
