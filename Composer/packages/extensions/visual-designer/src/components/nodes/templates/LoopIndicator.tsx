import React from 'react';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

export const LoopIndicator = ({ onClick }) => {
  return (
    <div
      style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        background: '#038387',
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
