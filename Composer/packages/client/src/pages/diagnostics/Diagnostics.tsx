// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import formatMessage from 'format-message';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { navigateTo } from '../../utils/navigation';
import { Page } from '../../components/Page';
import { diagnosticNavLinksSelector } from '../../recoilModel/selectors/diagnosticsPageSelector';
import { exportSkillModalInfoState } from '../../recoilModel';

import { DiagnosticsTable } from './DiagnosticsTable';
import { DiagnosticFilter } from './DiagnosticFilter';
import { IDiagnosticInfo } from './types';

const Diagnostics: React.FC<RouteComponentProps<{ projectId: string; skillId: string }>> = (props) => {
  const [showType, setShowType] = useState('');
  const setExportSkillModalInfo = useSetRecoilState(exportSkillModalInfoState);
  const navLinks = useRecoilValue(diagnosticNavLinksSelector);

  const { projectId = '' } = props;

  const handleItemClick = (item: IDiagnosticInfo) => {
    navigateTo(item.getUrl());
    if (item.location === 'manifest.json') {
      setExportSkillModalInfo(item.projectId);
    }
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
      toolbarItems={[]}
      onRenderHeaderContent={onRenderHeaderContent}
    >
      <DiagnosticsTable projectId={projectId} showType={showType} onItemClick={handleItemClick} />
    </Page>
  );
};

export default Diagnostics;
