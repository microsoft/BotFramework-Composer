// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useCallback, useState } from 'react';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { JSONSchema6 } from 'json-schema';
import formatMessage from 'format-message';
import { ResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import { IChoice } from '@bfc/shared';

import { WidgetLabel } from '../../../widgets/WidgetLabel';

import { StaticChoices } from './StaticChoices';
import { DynamicChoices } from './DynamicChoices';

interface ChoicesProps {
  id: string;
  schema: JSONSchema6;
  formData?: IChoice[];
  label: string;
  onChange: (data: IChoice[]) => void;
}

export const Choices: React.FC<ChoicesProps> = props => {
  const { id, label, onChange, schema } = props;
  const { oneOf: [dynamicSchema] = [] } = schema;
  const [type, setType] = useState<string>('static');

  const handleChange = useCallback(
    (_, { key }) => {
      setType(key as string);
      onChange([]);
    },
    [onChange, setType]
  );

  return (
    <React.Fragment>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <WidgetLabel
          label={label}
          description={formatMessage(
            "A list of options to present to the user. Synonyms can be used to allow for variation in a user's response."
          )}
          id={id}
        />
        <Dropdown
          onChange={handleChange}
          options={[
            { key: 'static', text: 'Static' },
            { key: 'dynamic', text: 'Dynamic' },
          ]}
          selectedKey={type}
          styles={{
            dropdown: { width: 100, padding: 0 },
            label: { fontSize: '10px' },
          }}
          responsiveMode={ResponsiveMode.large}
        />
      </div>
      {type === 'static' ? (
        <StaticChoices {...props} />
      ) : (
        <DynamicChoices {...props} schema={dynamicSchema as JSONSchema6} />
      )}
    </React.Fragment>
  );
};
