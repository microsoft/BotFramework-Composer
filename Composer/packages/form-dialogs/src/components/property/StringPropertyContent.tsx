// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useId } from '@uifabric/react-hooks';
import formatMessage from 'format-message';
import * as React from 'react';
import { StringPropertyPayload } from 'src/atoms/types';
import { FieldLabel } from 'src/components/common/FieldLabel';
import { ValuePicker } from 'src/components/common/ValuePicker';

type Props = {
  payload: StringPropertyPayload;
  onChangePayload: (payload: StringPropertyPayload) => void;
};

export const StringPropertyContent = React.memo((props: Props) => {
  const { payload, onChangePayload } = props;

  const tooltipId = useId('enumValues');

  const changeEnum = (enums: string[]) => {
    onChangePayload({ ...payload, enums });
  };

  const onRenderLabel = React.useCallback(
    (helpText: string, tooltipId: string) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (props: any, defaultRender?: (props: any) => JSX.Element | null) => (
        <FieldLabel defaultRender={defaultRender(props)} helpText={helpText} tooltipId={tooltipId} />
      ),
    []
  );

  return (
    payload.enums && (
      <ValuePicker
        label={formatMessage('Accepted values')}
        values={payload.enums || []}
        onChange={changeEnum}
        onRenderLabel={onRenderLabel(formatMessage('Enum help text'), tooltipId)}
      />
    )
  );
});
