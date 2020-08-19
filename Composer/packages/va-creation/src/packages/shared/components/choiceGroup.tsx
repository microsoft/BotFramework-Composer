import * as React from 'react';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';

export function ChoiceGroupFactory(options: IChoiceGroupOption[], onChange: () => void) {
  return <ChoiceGroup defaultSelectedKey="B" options={options} onChange={onChange} label="Pick one" required={true} />;
}
