// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';
import { IToolbarItem } from '@bfc/ui-shared';

import { Page } from '../../components/Page';
import { diagnosticNavLinksSelector } from '../../recoilModel/selectors/diagnosticsPageSelector';
import implementedDebugExtensions from '../design/DebugPanel/TabExtensions';

import { DiagnosticsTable } from './DiagnosticsTable';
import { DiagnosticFilter } from './DiagnosticFilter';

const Diagnostics: React.FC<RouteComponentProps<{ projectId: string; skillId: string }>> = (props) => {
  const [showType, setShowType] = useState('');
  const navLinks = useRecoilValue(diagnosticNavLinksSelector);

  const { projectId = '' } = props;
  const toolbarItems: IToolbarItem[] = implementedDebugExtensions
    .map(({ key, ToolbarWidget }) => {
      if (!ToolbarWidget) return;
      return {
        type: 'element',
        element: <ToolbarWidget key={`ToolbarWidget-${key}`} />,
        align: 'right',
      };
    })
    .filter((item) => Boolean(item)) as IToolbarItem[];

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
      <DiagnosticsTable projectId={projectId} showType={showType} />
    </Page>
  );
};

export default Diagnostics;
