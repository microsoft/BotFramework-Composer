import React, { useEffect } from 'react';
import nanoid from 'nanoid/generate';
import formatMessage from 'format-message';
import { TextField } from 'office-ui-fabric-react';
import { NeutralColors } from '@uifabric/fluent-theme';

import { useFormState } from '../utils';

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
  const { data, onChange, parentData } = props;
  const [formState, setFormState] = useFormState<DesignerData>(data);

  useEffect(() => {
    if (!formState.id) {
      const newDesigner: DesignerData = {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        id: nanoid('1234567890', 6),
      };

      setFormState(newDesigner);
      onChange(newDesigner);
    }
  }, [data]);

  useEffect(() => {
    onChange(formState);
  }, [formState, parentData]);

  const update = field => (e, val) => {
    setFormState({
      [field]: val,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="DesignerField">
      <div className="DesignerFieldSection">
        <TextField value={formState.name} label={formatMessage('Name')} onChange={update('name')} />
        <TextField
          value={formState.description}
          label={formatMessage('Description')}
          onChange={update('description')}
        />
      </div>
      <div className="DesignerFieldSection">
        <TextField
          value={
            formState.updatedAt
              ? formatMessage('{ udpatedAt, date, short } { updatedAt, time }', {
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
