import { Dropdown, IDropdownOption, IDropdownStyles } from 'office-ui-fabric-react/lib/Dropdown';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import React from 'react';

interface IFontForm {
  updateStyleElement: (styleElementName: string, value: any) => void;
}

export const FontForm: React.StatelessComponent<IFontForm> = (props: IFontForm) => {
  const fontOptions: IDropdownOption[] = [
    { key: '0', text: 'Calibri' },
    { key: '1', text: 'Arial' },
    { key: '2', text: 'sans-serif' },
    { key: '3', text: 'Consolas' },
    { key: '4', text: 'Courier New' },
    { key: '5', text: 'Helvetica Neue' },
  ];

  const fontSizeOptions: IDropdownOption[] = [
    { key: '0', text: '50%' },
    { key: '1', text: '60%' },
    { key: '2', text: '70%' },
    { key: '3', text: '80%' },
    { key: '4', text: '90%' },
    { key: '5', text: '100%' },
  ];

  const dropdownStyles: Partial<IDropdownStyles> = {
    dropdown: { width: 300 },
  };

  const stackTokens = { childrenGap: 5 };
  return (
    <div>
      <Stack tokens={stackTokens}>
        <Dropdown
          placeholder="Select an option"
          label="Font Family"
          options={fontOptions}
          styles={dropdownStyles}
          onChange={(event?: any, option?: IDropdownOption) => {
            props.updateStyleElement('primaryFont', option?.text);
          }}
        />
        <Dropdown
          placeholder="Select an option"
          label="Font Size"
          options={fontSizeOptions}
          styles={dropdownStyles}
          onChange={(event?: any, option?: IDropdownOption) => {
            props.updateStyleElement('fontSizeSmall', option?.text);
          }}
        />
      </Stack>
    </div>
  );
};
