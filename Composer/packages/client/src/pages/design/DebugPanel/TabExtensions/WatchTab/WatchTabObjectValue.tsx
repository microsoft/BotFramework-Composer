// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { JsonEditor } from '@bfc/code-editor';
import React, { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { userSettingsState } from '../../../../../recoilModel';

const editorStyles = css`
  border: none;
`;

const maxJsonHeight = 100;

const objectCellStyle = (numLinesOfJson: number) => css`
  height: ${Math.min(numLinesOfJson * 18, maxJsonHeight)}px;
  width: 100%;
`;

type WatchTabObjectValueProps = {
  value: any;
};

export const WatchTabObjectValue: React.FC<WatchTabObjectValueProps> = (props) => {
  const { value } = props;
  const userSettings = useRecoilValue(userSettingsState);
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
          fontSettings: { ...userSettings.codeEditor.fontSettings },
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
