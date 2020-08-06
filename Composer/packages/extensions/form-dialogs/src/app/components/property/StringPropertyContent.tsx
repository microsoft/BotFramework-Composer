// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { ValuePicker } from 'src/app/components/common/ValuePicker';
import { StringPropertyPayload } from 'src/app/stores/schemaPropertyStore';

type Props = {
  payload: StringPropertyPayload;
  onChangePayload: (payload: StringPropertyPayload) => void;
};

export const StringPropertyContent = React.memo((props: Props) => {
  const { payload, onChangePayload } = props;

  const changeEnum = (enums: string[]) => {
    onChangePayload({ ...payload, enums });
  };

  return <ValuePicker label="Enums" values={payload.enums || []} onChange={changeEnum} />;
});
