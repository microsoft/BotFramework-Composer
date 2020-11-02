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
import { convertPathToUrl } from '../../utils/navigation';
import { Page } from '../../components/Page';
import {
  allDiagnosticsSelectorFamily,
  diagnosticNavLinksSelector,
} from '../../recoilModel/selectors/diagnosticsPageSelector';
import { IToolbarItem } from '../../components/Toolbar';
import { ErrorInfo } from '../../components/TestController/errorInfo';
import { WarningInfo } from '../../components/TestController/warningInfo';

import { DiagnosticList } from './DiagnosticList';
import { DiagnosticFilter } from './DiagnosticFilter';
import { IDiagnosticInfo, DiagnosticType } from './types';

const iconPosition = css`
  padding-top: 6px;
`;

const Diagnostics: React.FC<RouteComponentProps<{ projectId: string; skillId: string }>> = (props) => {
  const [showType, setShowType] = useState('');
  const navLinks = useRecoilValue(diagnosticNavLinksSelector);
  const errors = useRecoilValue(allDiagnosticsSelectorFamily('Error'));
  const warnings = useRecoilValue(allDiagnosticsSelectorFamily('Warning'));
  const { projectId = '', skillId } = props;

  const navigations = {
    [DiagnosticType.LG]: (item: IDiagnosticInfo) => {
      const { projectId: skillId, resourceId, diagnostic, dialogPath } = item;
      let uri = `/bot/${projectId}/skill/${skillId}/language-generation/${resourceId}/edit#L=${
        diagnostic.range?.start.line || 0
      }`;
      //the format of item.id is lgFile#inlineTemplateId
      if (dialogPath) {
        uri = convertPathToUrl(projectId, skillId, resourceId, dialogPath);
      }
      navigateTo(uri);
    },
    [DiagnosticType.LU]: (item: IDiagnosticInfo) => {
      const { projectId: skillId, resourceId, diagnostic, dialogPath } = item;
      let uri = `/bot/${projectId}/skill/${skillId}/language-understanding/${resourceId}/edit#L=${
        diagnostic.range?.start.line || 0
      }`;
      if (dialogPath) {
        uri = convertPathToUrl(projectId, skillId, resourceId, dialogPath);
      }
      navigateTo(uri);
    },
    [DiagnosticType.QNA]: (item: IDiagnosticInfo) => {
      const { projectId: skillId, resourceId, diagnostic } = item;
      const uri = `/bot/${projectId}/skill/${skillId}/knowledge-base/${resourceId}/edit#L=${
        diagnostic.range?.start.line || 0
      }`;
      navigateTo(uri);
    },
    [DiagnosticType.DIALOG]: (item: IDiagnosticInfo) => {
      //path is like main.trigers[0].actions[0]
      //uri = id?selected=triggers[0]&focused=triggers[0].actions[0]
      const { projectId: skillId, id, dialogPath } = item;
      const uri = convertPathToUrl(projectId, skillId, id, dialogPath ?? '');
      navigateTo(uri);
    },
    [DiagnosticType.SKILL]: (item: IDiagnosticInfo) => {
      const { projectId } = item;
      navigateTo(`/bot/${projectId}/skills`);
    },
    [DiagnosticType.SETTING]: (item: IDiagnosticInfo) => {
      const { projectId } = item;
      navigateTo(`/settings/bot/${projectId}/dialog-settings`);
    },
  };

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
    navigations[item.type](item);
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
      title={formatMessage('Diagnostics')}
      toolbarItems={toolbarItems}
      onRenderHeaderContent={onRenderHeaderContent}
    >
      <DiagnosticList showType={showType} skillId={skillId} onItemClick={handleItemClick} />
    </Page>
  );
};

export default Diagnostics;
