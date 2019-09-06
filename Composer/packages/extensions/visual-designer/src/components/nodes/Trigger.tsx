/** @jsx jsx */
import { jsx } from '@emotion/core';

import { TriggerSize } from '../../constants/ElementSizes';

import { FormCard } from './templates/FormCard';

export const Trigger = ({ data, focused, onClick }): JSX.Element => (
  <div
    data-step="5"
    data-intro="This is your trigger"
    css={{ ...TriggerSize, outline: focused ? '2px solid grey' : 'none' }}
  >
    <FormCard
      nodeColors={{
        themeColor: '#BFEAE9',
        iconColor: 'black',
      }}
      icon={'Flow'}
      header={'Trigger'}
      label={data.intent || data.$type}
      onClick={onClick}
    />
  </div>
);
