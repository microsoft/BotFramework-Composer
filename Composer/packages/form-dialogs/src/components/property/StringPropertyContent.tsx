// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useId } from '@uifabric/react-hooks';
import formatMessage from 'format-message';
import * as React from 'react';

import { StringPropertyPayload } from '../../atoms/types';
import { FieldLabel } from '../common/FieldLabel';
import { ValuePicker } from '../common/ValuePicker';

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
        onRenderLabel={onRenderLabel(
          formatMessage(
            'For properties of type list (or enum), your bot accepts only the values you define. After your dialog is generated, you can provide synonyms for each value.'
          ),
          tooltipId
        )}
      />
    )
  );
});
