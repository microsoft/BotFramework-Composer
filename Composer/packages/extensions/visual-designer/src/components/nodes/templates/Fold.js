import React, { useState } from 'react';
import { IconButton } from 'office-ui-fabric-react';

export const FoldNode = ({ text, onFold }) => {
  const [isFold, setIsFold] = useState(true);

  const foldFuc = () => {
    setIsFold(!isFold);
    onFold(isFold);
  };
  return (
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
  );
};
