import React, { useEffect } from 'react';
import nanoid from 'nanoid/generate';
import formatMessage from 'format-message';
import { TextField } from 'office-ui-fabric-react';
import { NeutralColors } from '@uifabric/fluent-theme';
import get from 'lodash.get';

import { getTimestamp } from '../utils';

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
}

export const DesignerField: React.FC<DesignerFieldProps> = props => {
  const { data, onChange } = props;

  useEffect(() => {
    // create new designer metadata
    if (!data || !data.id) {
      const timestamp = getTimestamp();
      const newDesigner: DesignerData = {
        createdAt: timestamp,
        updatedAt: timestamp,
        id: nanoid('1234567890', 6),
        ...data,
      };

      onChange(newDesigner);
    }
  }, [data]);

  const update = (field: string, val?: string) => {
    onChange({
      ...data,
      [field]: val,
      updatedAt: getTimestamp(),
    });
  };

  return (
    <div className="DesignerField">
      <div className="DesignerFieldSection">
        <TextField value={get(data, 'name')} label={formatMessage('Name')} onChange={(_, val) => update('name', val)} />
        <TextField
          multiline
          autoAdjustHeight
          value={get(data, 'description')}
          label={formatMessage('Description')}
          onChange={(_, val) => update('description', val)}
        />
      </div>
      <div className="DesignerFieldSection">
        <TextField
          value={
            get(data, 'updatedAt')
              ? formatMessage('{ updatedAt, date, short } { updatedAt, time }', {
                  updatedAt: Date.parse(get(data, 'updatedAt')),
                })
              : 'N/A'
          }
          label={formatMessage('Last Edited')}
          borderless
          readOnly
          styles={{ field: { color: NeutralColors.gray140, paddingLeft: 0 } }}
        />
        {/* HIDE ID UNTIL WE ACTUALLY HAVE A USE FOR IT */}
        <TextField
          value={get(data, 'id')}
          label={formatMessage('ID number')}
          borderless
          readOnly
          styles={{ field: { color: NeutralColors.gray140, paddingLeft: 0 } }}
        />
      </div>
    </div>
  );
};
