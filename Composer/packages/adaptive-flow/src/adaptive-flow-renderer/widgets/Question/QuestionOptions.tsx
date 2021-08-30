// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useRef } from 'react';
import { TextField, ITextField } from 'office-ui-fabric-react/lib/TextField';
import { ActionButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import { Label } from 'office-ui-fabric-react/lib/Label';

type QuestionOptionsProps = {
  options: { value: string; id: string }[];
  onAdd: () => void;
  onChange: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  canAdd: boolean;
};

function QuestionOptions({ options = [], onAdd, onChange, onRemove, canAdd = true }: QuestionOptionsProps) {
  const inputRefs = useRef<Record<number, ITextField | null>>({});

  const newOption = (e: React.MouseEvent<HTMLButtonElement>) => {
    const newIdx = options.length;
    onAdd();

    e.preventDefault();
    e.stopPropagation();

    setTimeout(() => {
      const newInput = inputRefs.current[newIdx];
      if (newInput) {
        newInput.focus();
      }
    }, 30);
  };

  const updateOption = (id: string, value?: string) => {
    onChange(id, value || '');
  };

  const removeOption = (id: string) => {
    onRemove(id);
  };

  return (
    <div>
      <Label styles={{ root: { margin: '5px 0' } }}>Options for user</Label>
      {options.map((option, idx) => (
        <div key={option.id} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
          <TextField
            componentRef={(el) => (inputRefs.current[idx] = el)}
            prefix={option.value?.startsWith('=') ? 'f(x)' : undefined}
            styles={{ root: { flex: 1, marginRight: '5px' } }}
            value={option.value}
            onChange={(e, val) => updateOption(option.id, val)}
          />
          <IconButton iconProps={{ iconName: 'Trash' }} onClick={() => removeOption(option.id)} />
        </div>
      ))}
      {canAdd && (
        <ActionButton iconProps={{ iconName: 'Add' }} onClick={newOption}>
          New Option
        </ActionButton>
      )}
    </div>
  );
}

export { QuestionOptions };
