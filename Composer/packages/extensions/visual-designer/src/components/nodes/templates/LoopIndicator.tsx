/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

export const LoopIndicator = ({ onClick }) => {
  return (
    <div
      css={{
        width: 24,
        height: 24,
        borderRadius: 12,
        background: '#656565',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onClick={e => {
        e.stopPropagation();
        onClick();
      }}
    >
      <Icon iconName="Sync" style={{ color: 'white' }} />
    </div>
  );
};
