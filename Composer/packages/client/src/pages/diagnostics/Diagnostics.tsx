// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';
import { css } from '@emotion/core';

import { navigateTo } from '../../utils/navigation';
import { Page } from '../../components/Page';
import {
  allDiagnosticsSelectorFamily,
  diagnosticNavLinksSelector,
} from '../../recoilModel/selectors/diagnosticsPageSelector';
import { IToolbarItem } from '../../components/Toolbar';
import { WarningInfo } from '../../components/BotRuntimeController/warningInfo';
import { ErrorInfo } from '../../components/BotRuntimeController/errorInfo';

import { DiagnosticList } from './DiagnosticList';
import { DiagnosticFilter } from './DiagnosticFilter';
import { IDiagnosticInfo } from './types';

const iconPosition = css`
  padding-top: 6px;
`;

const Diagnostics: React.FC<RouteComponentProps<{ projectId: string; skillId: string }>> = (props) => {
  const [showType, setShowType] = useState('');
  const navLinks = useRecoilValue(diagnosticNavLinksSelector);
  const errors = useRecoilValue(allDiagnosticsSelectorFamily('Error'));
  const warnings = useRecoilValue(allDiagnosticsSelectorFamily('Warning'));

  const { projectId = '', skillId } = props;
  const toolbarItems: IToolbarItem[] = [
    {
      type: 'element',
      element: (
        <div css={iconPosition}>
          <WarningInfo count={warnings.length} hidden={!warnings.length} onClick={() => {}} />
          <ErrorInfo count={errors.length} hidden={!errors.length} onClick={() => {}} />
        </div>
      ),
      align: 'right',
    },
  ];

  const handleItemClick = (item: IDiagnosticInfo) => {
    navigateTo(item.getUrl());
  };

  const onRenderHeaderContent = () => {
    return <DiagnosticFilter onChange={setShowType} />;
  };

  return (
    <Page
      data-testid="LUPage"
      mainRegionName={formatMessage('Diagnostic List')}
      navLinks={navLinks}
      navRegionName={formatMessage('Diagnostics Pane')}
      pageMode={'diagnostics'}
      title={formatMessage('Diagnostics')}
      toolbarItems={toolbarItems}
      onRenderHeaderContent={onRenderHeaderContent}
    >
      <DiagnosticList showType={showType} skillId={skillId ?? projectId} onItemClick={handleItemClick} />
    </Page>
  );
};

export default Diagnostics;
