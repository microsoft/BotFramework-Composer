// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { WidgetContainerProps } from '@bfc/extension-client';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';

interface QuestionConditionWidget extends WidgetContainerProps {
  value: string;
  question: any;
  isDefault?: boolean;
}

function QuestionConditionWidget({ data }: QuestionConditionWidget) {
  const { question, value, isDefault } = data;

  if (isDefault) {
    return <div style={{ padding: '4px' }}>All other conditions</div>;
  }

  return (
    <div>
      <TextField
        readOnly
        prefix="{x}"
        styles={{ fieldGroup: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 } }}
        value={question.property}
      />
      <TextField
        readOnly
        styles={{ root: { margin: '-1px 0' }, fieldGroup: { borderRadius: 0 } }}
        value="Is equal to"
      />
      <TextField
        readOnly
        styles={{ fieldGroup: { borderTopLeftRadius: 0, borderTopRightRadius: 0 } }}
        value={value.toString()}
      />

      <ActionButton iconProps={{ iconName: 'Add' }} styles={{ root: { marginTop: '5px' } }}>
        Add Condition
      </ActionButton>
    </div>
  );
}

export { QuestionConditionWidget };
