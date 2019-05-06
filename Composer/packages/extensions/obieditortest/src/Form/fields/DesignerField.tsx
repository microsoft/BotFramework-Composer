import React, { useEffect } from 'react';
import nanoid from 'nanoid/generate';
import formatMessage from 'format-message';
import { TextField } from 'office-ui-fabric-react';
import { NeutralColors } from '@uifabric/fluent-theme';

import { useFormState, getTimestamp } from '../utils';

import './DesignerField.scss';

interface DesignerData {
  name?: string;
  description?: string;
  id: string;
  createdAt: string;
  updatedAt: string;
}

interface DesignerFieldProps {
  data: DesignerData;
  onChange: (data: DesignerData) => void;
  parentData: any;
}

export const DesignerField: React.FC<DesignerFieldProps> = props => {
  const { data, onChange } = props;
  const [formState, setFormState] = useFormState<DesignerData>(data);

  useEffect(() => {
    // create new designer metadata
    if (!formState.id) {
      const timestamp = getTimestamp();
      const newDesigner: DesignerData = {
        createdAt: timestamp,
        updatedAt: timestamp,
        id: nanoid('1234567890', 6),
        ...data,
      };

      setFormState(newDesigner);
      onChange(newDesigner);
      // dialog data has been updated, need sync updatedAt
    } else if (data.updatedAt && formState.updatedAt !== data.updatedAt && !isNaN(Date.parse(data.updatedAt))) {
      setFormState({ updatedAt: data.updatedAt });
    }
  }, [data]);

  useEffect(() => {
    onChange(formState);
  }, [formState]);

  const update = (field: string, val?: string) => {
    setFormState({
      updatedAt: getTimestamp(),
      [field]: val,
    });
  };

  return (
    <div className="DesignerField">
      <div className="DesignerFieldSection">
        <TextField value={formState.name} label={formatMessage('Name')} onChange={(_, val) => update('name', val)} />
        <TextField
          value={formState.description}
          label={formatMessage('Description')}
          onChange={(_, val) => update('description', val)}
        />
      </div>
      <div className="DesignerFieldSection">
        <TextField
          value={
            formState.updatedAt
              ? formatMessage('{ updatedAt, date, short } { updatedAt, time }', {
                  updatedAt: Date.parse(formState.updatedAt),
                })
              : 'N/A'
          }
          label={formatMessage('Last Edited')}
          borderless
          readOnly
          styles={{ field: { color: NeutralColors.gray140, paddingLeft: 0 } }}
        />
        <TextField
          value={formState.id}
          label={formatMessage('ID number')}
          borderless
          readOnly
          styles={{ field: { color: NeutralColors.gray140, paddingLeft: 0 } }}
        />
      </div>
    </div>
  );
};
