// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { FontSizes, NeutralColors } from '@uifabric/fluent-theme';
import { DefaultPalette } from '@uifabric/styling';
import * as React from 'react';

const DropZoneRoot = styled.div<{
  overZone: boolean;
  dropMessage: string | undefined;
}>({ position: 'relative', width: '100%', height: '100%' }, (props) =>
  props.overZone
    ? {
        '&:before': {
          pointerEvents: 'none',
          content: '""',
          border: `4px dashed ${DefaultPalette.accent}`,
          padding: 0,
          position: 'absolute',
          background: 'rgba(0,0,0,0.25)',
          left: 0,
          top: 0,
          height: 'calc(100% - 8px)',
          width: 'calc(100% - 8px)',
          zIndex: 1,
        },
        '&:after': {
          pointerEvents: 'none',
          display: 'flex',
          justifyContent: 'center',
          content: `"${props.dropMessage || 'Drop here ...'}"`,
          position: 'absolute',
          bottom: '50%',
          left: '50%',
          width: '100%',
          transform: 'translate(-50%, -50%)',
          fontSize: FontSizes.size20,
          fontWeight: 500,
          textAlign: 'justify',
          color: NeutralColors.gray20,
          zIndex: 1,
        },
      }
    : null
);

export type DropZoneProps = {
  children: React.ReactNode;
  onDropFiles: (files: readonly File[]) => void;
  dropMessage?: string | undefined;
  multiple?: boolean;
};

export const DropZone = (props: DropZoneProps) => {
  const { onDropFiles, dropMessage, multiple = false } = props;

  const [overZone, setOverZone] = React.useState(false);

  const onDrop = (evt: React.DragEvent<HTMLDivElement>) => {
    evt.preventDefault();
    evt.stopPropagation();
    const { dataTransfer } = evt;
    if (dataTransfer.files && dataTransfer.files.length) {
      const filesArray = Array.from(dataTransfer.files);
      const files: File[] = !multiple ? [filesArray[0]] : filesArray;
      onDropFiles(files);
    }

    setOverZone(false);
  };

  const onDragOver = (evt: React.DragEvent<HTMLDivElement>) => {
    evt.preventDefault();
    evt.stopPropagation();
    evt.dataTransfer.dropEffect = 'move';

    const { dataTransfer } = evt;
    if (dataTransfer && dataTransfer.items) {
      setOverZone(true);
    }
  };

  const onDragLeave = (evt: React.DragEvent<HTMLDivElement>) => {
    evt.preventDefault();
    const { dataTransfer } = evt;
    if (dataTransfer && dataTransfer.items) {
      setOverZone(false);
    }
  };

  return (
    <DropZoneRoot
      dropMessage={dropMessage}
      overZone={overZone}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {props.children}
    </DropZoneRoot>
  );
};
