// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { FontSizes, SharedColors } from '@uifabric/fluent-theme';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';

import { debugPanelExpansionState, debugPanelActiveTabState, dispatcherState } from '../../../../../recoilModel';
import { DiagnosticsTabKey } from '../types';

import { useDiagnosticsStatistics } from './useDiagnostics';

/**
 * Displays how many errors and warnings in current project.
 */
export const DiagnosticsStatus = () => {
  const setExpansion = useSetRecoilState(debugPanelExpansionState);
  const setActiveTab = useSetRecoilState(debugPanelActiveTabState);
  const { errorsCount, warningsCount } = useDiagnosticsStatistics();
  const { setWarningDiagnosticsFilter, setErrorDiagnosticsFilter } = useRecoilValue(dispatcherState);

  if (!errorsCount && !warningsCount) return null;

  const errorLabel = formatMessage(
    `{
    errorsCount, plural,
        =0 {No errors}
        =1 {One error}
      other {# errors}
    }`,
    { errorsCount }
  );

  const warningLabel = formatMessage(
    `{
    warningsCount, plural,
        =0 {No warnings}
        =1 {One warning}
      other {# warnings}
    }`,
    { warningsCount }
  );

  return (
    <div
      css={{ height: '100%', display: 'flex', alignItems: 'center', paddingLeft: '8px' }}
      data-testid="diagnostics-tab-header--collapsed"
    >
      {errorsCount > 0 && (
        <DefaultButton
          ariaLabel={`${errorLabel}`}
          styles={{
            root: {
              height: '36px',
              padding: '0',
              minWidth: '20px',
              border: 'none',
            },
            label: { fontSize: FontSizes.size18, fontFamily: 'Segoe UI', lineHeight: '20px' },
          }}
          onClick={() => {
            setErrorDiagnosticsFilter();
            setExpansion(true);
            setActiveTab(DiagnosticsTabKey);
          }}
        >
          <span css={{ marginRight: '10px', display: 'flex', alignItems: 'center' }}>
            <FontIcon
              css={{ color: SharedColors.red10, fontSize: FontSizes.size18, lineHeight: '18px', marginRight: '5px' }}
              iconName="StatusErrorFull"
            />
            {errorsCount}
          </span>
        </DefaultButton>
      )}

      {warningsCount > 0 && (
        <DefaultButton
          ariaLabel={`${warningLabel}`}
          styles={{
            root: {
              height: '36px',
              minWidth: '20px',
              border: 'none',
            },
            label: { fontSize: FontSizes.size18, fontFamily: 'Segoe UI', lineHeight: '20px' },
          }}
          onClick={() => {
            setWarningDiagnosticsFilter();
            setExpansion(true);
            setActiveTab(DiagnosticsTabKey);
          }}
        >
          <span css={{ display: 'flex', alignItems: 'center' }}>
            <FontIcon
              css={{
                color: `#F4BD00`,
                fontSize: FontSizes.size18,
                lineHeight: '18px',
                marginRight: '5px',
              }}
              iconName="WarningSolid"
            />
            {warningsCount}
          </span>
        </DefaultButton>
      )}
    </div>
  );
};
