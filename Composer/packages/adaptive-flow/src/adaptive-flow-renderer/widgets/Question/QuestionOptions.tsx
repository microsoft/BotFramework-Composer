// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useRef } from 'react';
import { TextField, ITextField } from 'office-ui-fabric-react/lib/TextField';
import { ActionButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import { Label } from 'office-ui-fabric-react/lib/Label';

type QuestionOptionsProps = {
  options: string[];
  onChange: (options: string[]) => void;
  onRemove: (removedOption: string) => void;
};

function QuestionOptions({ options = [], onChange, onRemove }: QuestionOptionsProps) {
  const inputRefs = useRef<Record<number, ITextField | null>>({});

  const newOption = (e: React.MouseEvent<HTMLButtonElement>) => {
    const newIdx = options.length;
    updateOption(newIdx);

    setTimeout(() => {
      const newInput = inputRefs.current[newIdx];
      if (newInput) {
        newInput.focus();
      }
    }, 10);

    e.preventDefault();
    e.stopPropagation();
  };

  const updateOption = (idx: number, value?: string) => {
    const copy = [...options];
    copy[idx] = value || '';

    onChange(copy);
  };

  const removeOption = (idx: number) => () => {
    const copy = [...options];
    const [removedOption] = copy.splice(idx, 1);
    onChange(copy);
    onRemove(removedOption);
  };

  return (
    <div>
      <Label styles={{ root: { margin: '5px 0' } }}>Options for user</Label>
      {options.map((option, idx) => (
        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
          <TextField
            componentRef={(el) => (inputRefs.current[idx] = el)}
            styles={{ root: { flex: 1, marginRight: '5px' } }}
            value={option}
            onChange={(e, val) => updateOption(idx, val)}
          />
          <IconButton iconProps={{ iconName: 'Trash' }} onClick={removeOption(idx)} />
        </div>
      ))}
      <ActionButton iconProps={{ iconName: 'Add' }} onClick={newOption}>
        New Option
      </ActionButton>
    </div>
  );
}

export { QuestionOptions };
