import React from 'react';
import { ChoiceGroup } from 'office-ui-fabric-react';
import { RadioWidgetProps } from '../types';
import { IChoiceGroupOption } from 'office-ui-fabric-react';

export function RadioWidget(props: RadioWidgetProps) {
  const { label, onChange, onBlur, onFocus, value, options, ...rest } = props;

  const choices = (options.enumOptions || []).map(o => ({
    key: o.value,
    text: o.label,
  }));

  return (
    <ChoiceGroup
      {...rest}
      label={label}
      onBlur={() => onBlur(rest.id, value)}
      onChange={(e, option?: IChoiceGroupOption) => onChange(option ? option.key : null)}
      onFocus={() => onFocus(rest.id, value)}
      options={choices}
      selectedKey={value}
    />
  );
}
