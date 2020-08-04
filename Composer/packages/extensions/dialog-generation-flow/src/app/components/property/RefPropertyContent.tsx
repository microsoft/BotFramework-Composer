// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import * as React from 'react';
import { RefPropertyPayload } from 'src/app/stores/schemaPropertyStore';
import { Context } from 'src/app/context/Context';

type Props = {
  payload: RefPropertyPayload;
  onChangePayload: (payload: RefPropertyPayload) => void;
};

export const RefPropertyContent = React.memo((props: Props) => {
  const { payload, onChangePayload } = props;

  const { templates } = React.useContext(Context);
  const options = React.useMemo(
    () => templates.map<IDropdownOption>((t) => ({ key: t, text: t })),
    [templates]
  );

  return (
    <Dropdown
      label="Select from templates"
      options={options}
      selectedKey={payload.ref}
      onChange={(_e, option) => onChangePayload({ kind: 'ref', ref: option.key } as RefPropertyPayload)}
    />
  );
});
