// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { FieldProps } from '@bfc/extension-client';
import { IPivotStyles, Pivot, PivotItem, PivotLinkSize } from 'office-ui-fabric-react/lib/components/Pivot';

import { getFieldsets } from '../../utils';
import { useAdaptiveFormContext } from '../../AdaptiveFormContext';

import { ObjectField } from './ObjectField';

const styles: { tabs: Partial<IPivotStyles> } = {
  tabs: {
    root: {
      display: 'flex',
      padding: '0 18px',
    },
    link: {
      flex: 1,
    },
    linkIsSelected: {
      flex: 1,
    },
  },
};

const PivotFieldsets: React.FC<FieldProps<object>> = (props) => {
  const { schema, uiOptions: baseUiOptions, value } = props;
  const { focusedTab, onFocusedTab: handleFocusTab } = useAdaptiveFormContext();
  const fieldsets = getFieldsets(schema, baseUiOptions, value);

  const handleTabChange = (item?: PivotItem) => {
    if (item?.props.itemKey && handleFocusTab) {
      handleFocusTab(item.props.itemKey);
    }
  };

  return (
    <div>
      <Pivot linkSize={PivotLinkSize.large} selectedKey={focusedTab} styles={styles.tabs} onLinkClick={handleTabChange}>
        {fieldsets.map(({ schema, uiOptions, title, itemKey }) => (
          <PivotItem key={itemKey} headerText={typeof title === 'function' ? title(value) : title} itemKey={itemKey}>
            <ObjectField {...props} schema={schema} uiOptions={uiOptions} />
          </PivotItem>
        ))}
      </Pivot>
    </div>
  );
};

export { PivotFieldsets };
