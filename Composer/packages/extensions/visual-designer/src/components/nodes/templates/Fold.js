import React, { useState } from 'react';
import { IconButton } from 'office-ui-fabric-react';

export const Fold = ({ text, children }) => {
  const [isFold, setIsFold] = useState(true);
  const [itemStyle, setItemStyle] = useState({ display: 'block' });

  const foldFuc = () => {
    setIsFold(!isFold);
    setItemStyle(preStyle => {
      if (preStyle.display === 'block') {
        return { display: 'none' };
      } else {
        return { display: 'block' };
      }
    });
  };
  return (
    <div>
      <div
        style={{
          display: 'flex',
        }}
      >
        <div
          style={{
            flex: 1,
            color: '#605E5C',
            fontSize: '12px',
            lineHeight: '19px',
            height: '22px',
            borderBottom: '1px solid #000000',
          }}
        >
          {text}
        </div>
        <IconButton iconProps={{ iconName: isFold ? 'ChevronDown' : 'ChevronUp' }} onClick={foldFuc} />
      </div>
      <div style={itemStyle}>{children}</div>
    </div>
  );
};
