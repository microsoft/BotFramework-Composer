// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Label } from '@fluentui/react/lib/Label';
import { Stack } from '@fluentui/react/lib/Stack';
import * as React from 'react';
import { TagInput } from 'src/app/components/tags/TagInput';
import { generateId } from 'src/app/utils/base';

type Props = {
  /**
   * The label of the value picker control.
   */
  label: string;
  /**
   * Array of values to show.
   */
  values: string[];
  /**
   * Callback to update hte values.
   */
  onChange: (tags: string[]) => void;
};

export const ValuePicker = (props: Props) => {
  const { label, values, onChange } = props;
  const textFieldId = React.useRef(generateId());

  return (
    <Stack>
      <Label htmlFor={textFieldId.current}>{label}</Label>
      <TagInput removeOnBackspace editable={false} tags={values} onChange={onChange} />
    </Stack>
  );
};
