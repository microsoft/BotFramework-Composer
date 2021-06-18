// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { FontSizes, SharedColors, NeutralColors } from '@uifabric/fluent-theme';
import { DiagnosticSeverity } from '@bfc/shared';
import { FontWeights } from '@uifabric/styling';

import { outputsDebugPanelSelector, rootBotProjectIdSelector } from '../../../../../recoilModel';
import { DropdownWithAllOption } from '../../../../../components/DropdownWithAllOption/DropdownWithAllOption';

const severityTextStyle = {
  marginRight: '6px',
};

const countFontWeight = {
  fontWeight: FontWeights.bold,
};

const optionAllKey = 'All';

const getSeverityButtonStyle = (severityType: DiagnosticSeverity, isChecked: boolean): any => {
  const baseStyle = {
    root: {
      padding: '8px 4px',
      marginRight: '8px',
      fontSize: FontSizes.size12,
      fontFamily: 'Segoe UI',
      textAlign: 'center',
      border: `1px solid ${NeutralColors.gray20}`,
      boderRadius: '2px',
      height: '25px',
      fontWeight: '500',
    },
    icon: {
      color: isChecked ? SharedColors.red10 : NeutralColors.gray90,
      fontSize: FontSizes.size16,
      marginRight: '8px',
    },
  };

  if (severityType === DiagnosticSeverity.Warning) {
    return {
      ...baseStyle,
      icon: {
        ...baseStyle.icon,
        color: isChecked ? '#F4BD00' : NeutralColors.gray90,
      },
    };
  } else {
    return baseStyle;
  }
};

type DiagnosticsFiltersProps = {
  showErrors: boolean;
  projectsToFilter: string[];
  showWarnings: boolean;
  setWarningFilter: (value: boolean) => void;
  setErrorFilter: (value: boolean) => void;
  setProjectsToFilter: (projects: string[]) => void;
  errorCount: number;
  warningCount: number;
};

export const DiagnosticsFilters: React.FC<DiagnosticsFiltersProps> = (props) => {
  const {
    showErrors,
    showWarnings,
    setWarningFilter,
    setErrorFilter,
    setProjectsToFilter,
    projectsToFilter,
    errorCount,
    warningCount,
  } = props;
  const projects = useRecoilValue(outputsDebugPanelSelector);
  const [projectSelectorOptions, setProjectSelectorOptions] = useState<IDropdownOption[]>([]);
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector);

  useEffect(() => {
    if (rootBotProjectId) {
      setProjectsToFilter([rootBotProjectId]);
    }
  }, [rootBotProjectId]);

  useEffect(() => {
    const projectOptions = projects.map(({ projectId, botName }) => {
      return {
        key: projectId,
        text: botName,
      };
    });
    setProjectSelectorOptions(projectOptions);
  }, [projects]);

  if (!rootBotProjectId) {
    return null;
  }

  return (
    <div
      css={{
        display: 'flex',
        flex: '1 1 auto',
        width: '100%',
      }}
    >
      <DefaultButton
        allowDisabledFocus
        checked={showErrors}
        iconProps={{ iconName: 'StatusErrorFull' }}
        styles={getSeverityButtonStyle(DiagnosticSeverity.Error, showErrors)}
        onClick={() => {
          setErrorFilter(!showErrors);
        }}
      >
        <span style={severityTextStyle}>{formatMessage('Errors')}</span>
        <span style={countFontWeight}>{errorCount}</span>
      </DefaultButton>
      <DefaultButton
        allowDisabledFocus
        toggle
        checked={showWarnings}
        iconProps={{ iconName: 'WarningSolid' }}
        styles={getSeverityButtonStyle(DiagnosticSeverity.Warning, showWarnings)}
        onClick={() => {
          setWarningFilter(!showWarnings);
        }}
      >
        <span style={severityTextStyle}>{formatMessage('Warnings')}</span>
        <span style={countFontWeight}>{warningCount}</span>
      </DefaultButton>
      <div
        css={{
          marginLeft: 'auto !important',
        }}
      >
        <DropdownWithAllOption
          dropdownOptions={projectSelectorOptions}
          optionAllKey={optionAllKey}
          optionAllText={formatMessage('All bots')}
          placeholder={formatMessage('Select a project')}
          selectedKeys={projectsToFilter}
          setSelectedKeys={setProjectsToFilter}
        />
      </div>
    </div>
  );
};
