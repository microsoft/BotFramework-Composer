/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
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
