import React, { useState, FC } from 'react';

import { InitNodeSize } from '../../shared/elementSizes';

import { getDndData } from './dndHelpers';

const isCopyMode = (e: React.DragEvent): boolean => e.ctrlKey || e.shiftKey;

export const DropZone: FC<any> = ({ onDrop, children }): JSX.Element => {
  const [active, setActive] = useState(false);
  return (
    <div
      className="drop-zone"
      style={{
        width: InitNodeSize.width,
        height: 30,
        left: -InitNodeSize.width / 2,
        top: -10,
        border: active ? '2px dashed lightblue' : 'none',
        position: 'absolute',
        display: 'flex',
        justifyContent: 'center',
      }}
      onDragOver={(e): void => {
        e.stopPropagation();

        e.preventDefault();
        if (isCopyMode(e)) {
          e.dataTransfer.dropEffect = 'copy';
        }
      }}
      onDragEnter={(e): void => {
        e.stopPropagation();

        setActive(true);
      }}
      onDrop={(e): void => {
        setActive(false);
        const sourceData = getDndData(e);
        onDrop(sourceData, isCopyMode(e));
      }}
      onDragLeave={(e): void => {
        e.stopPropagation();
        setActive(false);
      }}
    >
      {children}
    </div>
  );
};
