import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import React from 'react';

interface IMiscForm {
  updateStyleElement: (styleElementName: string, value: any) => void;
}

export const MiscForm: React.StatelessComponent<IMiscForm> = (props: IMiscForm) => {
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
