/** @jsx jsx */
import { jsx } from '@emotion/core';

import { TriggerSize } from '../../shared/elementSizes';

import { Icon } from './icons/icon';

export const Trigger = (): JSX.Element => (
  <div
    css={{ ...TriggerSize, border: '1px solid #979797', background: 'white', display: 'flex', alignItems: 'center' }}
  >
    <div css={{ width: 30, height: 30, padding: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon icon="MessageBot" size={30} color="#5C2D91" />
    </div>
    Trigger
  </div>
);
