import React from 'react';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react';
import { ResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';

import { SelectWidgetProps } from '../types';

export const SelectWidget: React.FunctionComponent<SelectWidgetProps> = props => {
  const { label, onChange, onFocus, onBlur, value, options, ...rest } = props;

  const handleChange = (_, option?: IDropdownOption) => {
    if (option) {
      onChange(option.key);
    } else {
      onChange(null);
    }
  };

  return (
    <Dropdown
      {...rest}
      label={label}
      onBlur={() => onBlur(rest.id, value)}
      onChange={handleChange}
      onFocus={() => onFocus(rest.id, value)}
      options={options.enumOptions.map(o => ({
        key: o.value,
        text: o.label,
      }))}
      selectedKey={value}
      responsiveMode={ResponsiveMode.large}
    />
  );
};
