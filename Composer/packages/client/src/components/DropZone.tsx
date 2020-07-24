// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { FontSizes, NeutralColors } from '@uifabric/fluent-theme';
import { DefaultPalette } from '@uifabric/styling';
import * as React from 'react';

const validateAccept = (file: File, accept: string | undefined) => {
  if (file && accept) {
    const acceptedFilesArray = Array.isArray(accept) ? accept : accept.split(',');
    const fileName = file.name || '';
    const mimeType = file.type || '';
    const baseMimeType = mimeType.replace(/\/.*$/, '');

    return acceptedFilesArray.some((type) => {
      const validType = type.trim();
      if (validType.charAt(0) === '.') {
        return fileName.toLowerCase().endsWith(validType.toLowerCase());
      } else if (validType.endsWith('/*')) {
        // This is something like a image/* mime type
        return baseMimeType === validType.replace(/\/.*$/, '');
      }
      return mimeType === validType;
    });
  }
  return true;
};

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
          background: 'rgba(0,0,0,0.75)',
          left: 0,
          top: 0,
          height: 'calc(100% - 8px)',
          width: 'calc(100% - 8px)',
          zIndex: 2,
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
          zIndex: 2,
        },
      }
    : null
);

export type DropZoneProps = {
  children: React.ReactNode;
  onDropFiles: (acceptedFiles: readonly File[], rejectedFiles: readonly File[]) => void;
  dropMessage?: string | undefined;
  style?: React.CSSProperties;
  multiple?: boolean;
  accept?: string;
};

export const DropZone = (props: DropZoneProps) => {
  const { onDropFiles, dropMessage, multiple = false, accept, style } = props;

  const [overZone, setOverZone] = React.useState(false);

  const onDrop = (evt: React.DragEvent<HTMLDivElement>) => {
    evt.preventDefault();
    evt.stopPropagation();
    const { dataTransfer } = evt;
    if (dataTransfer.files && dataTransfer.files.length) {
      const filesArray = Array.from(dataTransfer.files);
      const acceptedFiles = (!multiple ? [filesArray[0]] : filesArray).filter((f) => validateAccept(f, accept));
      const rejectedFiles = (!multiple ? [filesArray[0]] : filesArray).filter((f) => !validateAccept(f, accept));

      onDropFiles(acceptedFiles, rejectedFiles);
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
      style={style}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {props.children}
    </DropZoneRoot>
  );
};
