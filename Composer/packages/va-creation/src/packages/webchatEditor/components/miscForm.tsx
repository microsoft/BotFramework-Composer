import React from 'react';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { Dropdown, DropdownMenuItemType, IDropdownStyles, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';

interface IMiscForm {
  updateStyleElement: (styleElementName: string, value: any) => void;
}

export const MiscForm: React.StatelessComponent<IMiscForm> = (props: IMiscForm) => {
  const stackTokens = { childrenGap: 5 };
  return (
    <div>
      <Toggle
        defaultChecked={true}
        label="Show upload Button"
        inlineLabel
        onChange={(event: any, checked?: boolean) => {
          props.updateStyleElement('hideUploadButton', !checked);
        }}
      />
      <Toggle
        defaultChecked={true}
        label="Show send Button"
        inlineLabel
        onChange={(event: any, checked?: boolean) => {
          props.updateStyleElement('hideSendBox', !checked);
        }}
      />
    </div>
  );
};
