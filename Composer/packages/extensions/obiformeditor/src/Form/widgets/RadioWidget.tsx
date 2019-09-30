import React from 'react';
import { ChoiceGroup } from 'office-ui-fabric-react';
import { IChoiceGroupOption } from 'office-ui-fabric-react';

import { RadioWidgetProps } from '../types';

import { WidgetLabel } from './WidgetLabel';

export function RadioWidget(props: RadioWidgetProps) {
  const { label, onChange, onBlur, onFocus, value, options, id, schema } = props;
  const { description } = schema;

  const choices = (options.enumOptions || []).map(o => ({
    key: o.value,
    text: o.label,
  }));

  return (
    <>
      <WidgetLabel label={label} description={description} id={id} />
      <ChoiceGroup
        id={id}
        onBlur={() => onBlur(id, value)}
        onChange={(e, option?: IChoiceGroupOption) => onChange(option ? option.key : null)}
        onFocus={() => onFocus(id, value)}
        options={choices}
        selectedKey={value}
      />
    </>
  );
}
