import React, { useEffect } from 'react';
import formatMessage from 'format-message';
import { getDesignerId, DesignerData } from 'shared';
import { TextField } from 'office-ui-fabric-react';
import { NeutralColors } from '@uifabric/fluent-theme';
import get from 'lodash.get';

import './DesignerField.css';

interface DesignerFieldProps {
  placeholder: string;
  data: DesignerData;
  onChange: (data: DesignerData) => void;
}

export const DesignerField: React.FC<DesignerFieldProps> = props => {
  const { data, onChange } = props;

  useEffect(() => {
    // create new designer metadata
    if (!data || !data.id) {
      const newDesigner = getDesignerId(data);
      onChange(newDesigner);
    }
  }, [data]);

  const update = (field: string, val?: string) => {
    onChange({
      ...data,
      [field]: val,
    });
  };

  return (
    <div className="DesignerField">
      <div className="DesignerFieldSection">
        <TextField
          value={get(data, 'name')}
          placeholder={props.placeholder}
          label={formatMessage('Name')}
          onChange={(_, val) => update('name', val)}
        />
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
