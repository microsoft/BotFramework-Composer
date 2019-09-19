/** @jsx jsx */

import { AttrNames } from '../../constants/ElementAttributes';
import { ConceptLabels } from 'shared-menus';
import { ElementIcon } from '../../utils/obiPropertyResolver';
import { FormCard } from './templates/FormCard';
import { TriggerSize } from '../../constants/ElementSizes';
import { jsx } from '@emotion/core';

function getLabel(data: any): string {
  if (data.intent) {
    return data.intent;
  }

  const labelOverrides = ConceptLabels[data.$type];

  if (labelOverrides.title) {
    return labelOverrides.title;
  }

  return data.$type;
}

const declareElementAttributes = (id: string) => {
  return {
    [AttrNames.SelectableElement]: true,
    [AttrNames.NodeElement]: true,
    [AttrNames.SelectedId]: id,
    [AttrNames.FocusedId]: id,
  };
};

export const Trigger = ({ id, data, focused, onClick }): JSX.Element => (
  <div
    css={{
      ...TriggerSize,
      outline: focused ? '1px solid #0078d4' : 'none',
      '&:hover': !focused && { outline: '1px solid #323130' },
    }}
    {...declareElementAttributes(id)}
  >
    <FormCard
      nodeColors={{
        themeColor: '#BFEAE9',
        iconColor: 'black',
      }}
      icon={ElementIcon.Flow}
      header={'Trigger'}
      label={getLabel(data)}
      onClick={onClick}
    />
  </div>
);
