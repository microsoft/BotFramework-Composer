// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { useMemo, useState } from 'react';
import formatMessage from 'format-message';
import { RouteComponentProps } from '@reach/router';
import { css } from '@emotion/core';
import { useRecoilValue } from 'recoil';

import { Pagination } from '../../components/Pagination';
import { diagnosticsSelectorFamily } from '../../recoilModel';

import { DiagnosticList } from './DiagnosticList';
import { IDiagnosticInfo } from './types';

// -------------------- Styles -------------------- //

const listRoot = css`
  position: relative;
  overflow-y: auto;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const tableView = css`
  position: relative;
  flex-grow: 1;
`;

// -------------------- Diagnosticist -------------------- //
export interface IDiagnosticListProps extends RouteComponentProps {
  projectId: string;
  showType: string;
  onItemClick: (item: IDiagnosticInfo) => void;
}

const itemCount = 10;

export const DiagnosticsTable: React.FC<IDiagnosticListProps> = (props) => {
  const { onItemClick, projectId, showType } = props;
  const diagnostics = useRecoilValue(diagnosticsSelectorFamily(projectId));
  const availableDiagnostics = showType ? diagnostics.filter((x) => x.severity === showType) : diagnostics;
  const [pageIndex, setPageIndex] = useState<number>(1);

  const pageCount: number = useMemo(() => {
    return Math.ceil(availableDiagnostics.length / itemCount) || 1;
  }, [availableDiagnostics]);

  const showItems = availableDiagnostics.slice((pageIndex - 1) * itemCount, pageIndex * itemCount);

  return (
    <div css={listRoot} data-testid="diagnostics-table-view" role="main">
      <div aria-label={formatMessage('Diagnostic list')} css={tableView} role="region">
        <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
          <DiagnosticList diagnosticItems={showItems} onItemClick={onItemClick} />
        </ScrollablePane>
      </div>
      <Pagination pageCount={pageCount} onChange={setPageIndex} />
    </div>
  );
};
