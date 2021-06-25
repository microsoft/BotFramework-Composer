// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { DiagnosticSeverity } from '@botframework-composer/types';

import { allDiagnosticsSelectorFamily } from '../recoilModel';

import { ErrorInfo } from './BotRuntimeController/ErrorInfo';
import { WarningInfo } from './BotRuntimeController/warningInfo';

const iconPosition = css`
  padding-top: 6px;
`;

type DiagnosticsHeaderProps = {
  onClick?: () => void;
};

export const DiagnosticsHeader: React.FC<DiagnosticsHeaderProps> = React.memo(({ onClick = () => {} }) => {
  const errors = useRecoilValue(allDiagnosticsSelectorFamily([DiagnosticSeverity.Error]));
  const warnings = useRecoilValue(allDiagnosticsSelectorFamily([DiagnosticSeverity.Warning]));

  return (
    <div css={iconPosition}>
      <WarningInfo count={warnings.length} hidden={!warnings.length} onClick={onClick} />
      <ErrorInfo count={errors.length} hidden={!errors.length} onClick={onClick} />
    </div>
  );
});
