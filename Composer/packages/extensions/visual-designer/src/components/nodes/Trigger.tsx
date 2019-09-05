/** @jsx jsx */
import { jsx } from '@emotion/core';

import { TriggerSize } from '../../constants/ElementSizes';

import { FormCard } from './templates/FormCard';

export const Trigger = ({ data, focused, onClick }): JSX.Element => (
  <div css={{ ...TriggerSize, outline: focused ? '1px solid #0078d4' : 'none' }}>
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
