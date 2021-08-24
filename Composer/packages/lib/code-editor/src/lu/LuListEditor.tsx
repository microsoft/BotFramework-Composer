// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import formatMessage from 'format-message';

import { BaseEditorProps } from '../BaseEditor';
import { StringArrayEditor } from '../lg/modalityEditors/StringArrayEditor';
import { parseTemplateBody, TelemetryClient, TemplateBodyItem, templateBodyItemsToString } from '../../../shared/lib';

export const LuListEditor: React.FC<BaseEditorProps> = ({ value = '', onChange }) => {
  const [items, setItems] = React.useState<TemplateBodyItem[]>(parseTemplateBody(value));

  const handleChange = React.useCallback(
    (newItems: TemplateBodyItem[]) => {
      setItems(newItems);
      onChange(templateBodyItemsToString(newItems));
    },
    [onChange]
  );

  return (
    <div>
      <StringArrayEditor
        isLu
        addButtonText={formatMessage('Add utterance')}
        items={items}
        placeholder={''}
        telemetryClient={{ track: () => {}, pageView: () => {} } as TelemetryClient}
        onChange={handleChange}
      />
    </div>
  );
};
