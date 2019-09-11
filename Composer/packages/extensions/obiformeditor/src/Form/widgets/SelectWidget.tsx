import React from 'react';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react';
import { ResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import omit from 'lodash.omit';

import { SelectWidgetProps } from '../types';

export const SelectWidget: React.FunctionComponent<SelectWidgetProps> = props => {
  const { onChange, onFocus, onBlur, value, options, ...rest } = props;

  const handleChange = (_, option?: IDropdownOption) => {
    if (option) {
      onChange(option.key);
    } else {
      onChange(null);
    }
  };

  return (
    <Dropdown
      {...omit(rest, ['label', 'description'])}
      onBlur={() => onBlur(rest.id, value)}
      onChange={handleChange}
      onFocus={() => onFocus(rest.id, value)}
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
  );
};
