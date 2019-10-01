/** @jsx jsx */

import { ConceptLabels } from 'shared-menus';
import { jsx } from '@emotion/core';

import { AttrNames } from '../../constants/ElementAttributes';
import { ElementIcon } from '../../utils/obiPropertyResolver';
import { TriggerSize } from '../../constants/ElementSizes';

import { FormCard } from './templates/FormCard';

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

export const Trigger = ({ id, data, onClick = () => {} }): JSX.Element => (
  <div
    css={{
      ...TriggerSize,
    }}
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
