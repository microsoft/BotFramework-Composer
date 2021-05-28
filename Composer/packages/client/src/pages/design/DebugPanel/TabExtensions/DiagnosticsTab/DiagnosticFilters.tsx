// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import React, { Fragment, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { FontSizes, SharedColors, NeutralColors } from '@uifabric/fluent-theme';
import { DiagnosticSeverity } from '@bfc/shared';

import { outputsDebugPanelSelector } from '../../../../../recoilModel';
import { DropdownWithAllOption } from '../../../../../components/DropdownWithAllOption/DropdownWithAllOption';

import { useDiagnosticsStatistics } from './useDiagnostics';

const severityTextStyle = {
  marginRight: '6px',
};

const getSeverityButtonStyle = (severityType: DiagnosticSeverity, isChecked: boolean): any => {
  const baseStyle = {
    root: {
      padding: '3px 8px',
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
  setShowWarnings: () => void;
  setShowErrors: () => void;
  setProjectsToFilter: (projects: string[]) => void;
};

export const DiagnosticsFilters: React.FC<DiagnosticsFiltersProps> = (props) => {
  const { errorsCount, warningsCount } = useDiagnosticsStatistics();
  const { showErrors, showWarnings, setShowWarnings, setShowErrors, setProjectsToFilter, projectsToFilter } = props;
  const projects = useRecoilValue(outputsDebugPanelSelector);
  const [projectSelectorOptions, setProjectSelectorOptions] = useState<IDropdownOption[]>([]);

  useEffect(() => {
    const projectOptions = projects.map(({ projectId, botName }) => {
      return {
        key: projectId,
        text: botName,
      };
    });
    setProjectSelectorOptions(projectOptions);
  }, [projects]);

  return (
    <Fragment>
      <div
        css={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
          margin: '10px 15px',
        }}
      >
        <DefaultButton
          allowDisabledFocus
          toggle
          checked={showErrors}
          iconProps={{ iconName: 'StatusErrorFull' }}
          styles={getSeverityButtonStyle(DiagnosticSeverity.Error, showErrors)}
          onClick={setShowErrors}
        >
          <span style={severityTextStyle}>{formatMessage('Errors')}</span>
          <span>{errorsCount}</span>
        </DefaultButton>
        <DefaultButton
          allowDisabledFocus
          toggle
          checked={showWarnings}
          iconProps={{ iconName: 'WarningSolid' }}
          styles={getSeverityButtonStyle(DiagnosticSeverity.Warning, showWarnings)}
          onClick={setShowWarnings}
        >
          <span style={severityTextStyle}>{formatMessage('Warnings')}</span>
          <span>{warningsCount}</span>
        </DefaultButton>

        <div
          style={{
            marginLeft: 'auto',
          }}
        >
          <DropdownWithAllOption
            dropdownOptions={projectSelectorOptions}
            optionAllText={formatMessage('All bots')}
            placeholder={formatMessage('Select a project')}
            selectedKeys={projectsToFilter}
            setSelectedKeys={setProjectsToFilter}
          />
        </div>
      </div>
    </Fragment>
  );
};
