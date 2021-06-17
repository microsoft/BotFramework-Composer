// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { JsonEditor } from '@bfc/code-editor';
import React, { useMemo } from 'react';

import { getDefaultFontSettings } from '../../../../../recoilModel/utils/fontUtil';

const DEFAULT_FONT_SETTINGS = getDefaultFontSettings();

const editorStyles = css`
  border: none;
`;

const objectCellStyle = (numLinesOfJson: number) => css`
  height: ${numLinesOfJson * 18}px;
  width: 360px;
`;

type WatchTabObjectValueProps = {
  value: object;
};

export const WatchTabObjectValue: React.FC<WatchTabObjectValueProps> = (props) => {
  const { value } = props;
  const objectCell = useMemo(() => {
    const newLineMatches = JSON.stringify(value, null, 2).match(/\n/g) || [];
    const numLinesOfJson = newLineMatches.length + 1;
    return objectCellStyle(numLinesOfJson);
  }, [value]);

  return (
    <div css={objectCell}>
      <JsonEditor
        editorSettings={{
          fadedWhenReadOnly: false,
          fontSettings: {
            fontFamily: DEFAULT_FONT_SETTINGS.fontFamily,
            fontSize: '12px',
            fontWeight: 'normal',
          },
        }}
        options={{
          folding: true,
          showFoldingControls: 'always',
          readOnly: true,
          lineHeight: 16,
          overviewRulerLanes: 0,
        }}
        styleOverrides={[editorStyles]}
        value={value}
        onChange={(_d) => null}
      />
    </div>
  );
};
