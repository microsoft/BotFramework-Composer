import React from 'react';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react';
import { ResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';

import { SelectWidgetProps } from '../types';

import { WidgetLabel } from './WidgetLabel';

export const SelectWidget: React.FunctionComponent<SelectWidgetProps> = props => {
  const { onChange, onFocus, onBlur, value, options, label, schema, id } = props;
  const { description } = schema;

  const handleChange = (_, option?: IDropdownOption) => {
    if (option) {
      onChange(option.key);
    } else {
      onChange(null);
    }
  };

  return (
    <>
      <WidgetLabel label={label} description={description} id={id} />
      <Dropdown
        id={id}
        onBlur={() => onBlur(id, value)}
        onChange={handleChange}
        onFocus={() => onFocus(id, value)}
        options={options.enumOptions.map(o => ({
          key: o.value,
          text: o.label,
        }))}
        selectedKey={value}
        responsiveMode={ResponsiveMode.large}
        styles={{
          label: { fontSize: '10px', fontWeight: '400' },
        }}
      />
    </>
  );
};

SelectWidget.defaultProps = {
  schema: {},
};
