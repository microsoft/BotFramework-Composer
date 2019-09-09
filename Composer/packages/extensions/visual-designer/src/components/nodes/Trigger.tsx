/** @jsx jsx */
import { jsx } from '@emotion/core';

import { TriggerSize } from '../../constants/ElementSizes';

import { FormCard } from './templates/FormCard';

export const Trigger = ({ data, focused, onClick }): JSX.Element => (
  <div
    data-step="5"
    data-intro="This is your trigger"
    css={{
      ...TriggerSize,
      outline: focused ? '1px solid #0078d4' : 'none',
      '&:hover': !focused && { outline: '1px solid #323130' },
    }}
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
