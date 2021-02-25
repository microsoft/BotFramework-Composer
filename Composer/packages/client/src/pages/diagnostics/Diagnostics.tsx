// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import formatMessage from 'format-message';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { Page } from '../../components/Page';
import { diagnosticNavLinksSelector } from '../../recoilModel/selectors/diagnosticsPageSelector';
import { dispatcherState, exportSkillModalInfoState } from '../../recoilModel';
import { navigateTo } from '../../utils/navigation';
import { INavTreeItem } from '../../components/NavTree';

import { DiagnosticsTable } from './DiagnosticsTable';
import { DiagnosticFilter } from './DiagnosticFilter';
import { IDiagnosticInfo } from './types';

const Diagnostics: React.FC<RouteComponentProps<{ projectId: string; skillId: string }>> = (props) => {
  const [showType, setShowType] = useState('');
  const setExportSkillModalInfo = useSetRecoilState(exportSkillModalInfoState);
  const navLinks = useRecoilValue(diagnosticNavLinksSelector);
  const { setCurrentProjectId } = useRecoilValue(dispatcherState);

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
      navLinkClick={(item: INavTreeItem) => {
        setCurrentProjectId(item.id);
      }}
      navLinks={navLinks}
      navRegionName={formatMessage('Diagnostics Pane')}
      pageMode={'diagnostics'}
      title={formatMessage('Diagnostics')}
      toolbarItems={[]}
      onRenderHeaderContent={onRenderHeaderContent}
    >
      <DiagnosticsTable showType={showType} onItemClick={handleItemClick} />
    </Page>
  );
};

export default Diagnostics;
