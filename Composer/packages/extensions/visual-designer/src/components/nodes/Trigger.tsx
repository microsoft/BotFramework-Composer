/** @jsx jsx */
import { jsx } from '@emotion/core';

import { TriggerSize } from '../../shared/elementSizes';

import { FormCard } from './templates/FormCard';

export const Trigger = ({ data, focused, onClick }): JSX.Element => (
  <div css={{ ...TriggerSize, outline: focused ? '2px solid grey' : 'none' }}>
    <FormCard
      nodeColors={{
        themeColor: '#BFEAE9',
        iconColor: 'black',
      }}
      icon={'Relationship'}
      header={'Trigger'}
      label={'asdasd'}
      onClick={onClick}
    />
  </div>
);
