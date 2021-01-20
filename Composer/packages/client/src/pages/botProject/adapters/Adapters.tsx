// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { Fragment, useState } from 'react';
import { jsx } from '@emotion/core';
//import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';

import { CollapsableWrapper } from '../../../components/CollapsableWrapper';
//import { rootBotProjectIdSelector, enabledExtensionsSelector } from '../../../recoilModel/selectors';
//import { dispatcherState, settingsState } from '../../../recoilModel';
import { titleStyle, sectionHeader, tableRow, tableItem, tableHeader, tableHeaderText } from '../common';

// -------------------- SkillHostEndPoint -------------------- //

const header = () => (
  <div css={sectionHeader}>
    {formatMessage('Adapters are installed by the package manager. Add adapters to connect your bot to channels.')}
  </div>
);
export const Adapters: React.FC = () => {
  // const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector) ?? '';
  // const settings = useRecoilValue(settingsState(rootBotProjectId));
  //const { adapters } = settings;

  const [showModal, setModalVisibility] = useState<boolean>(false);

  const adapters = new Set<{ key: string; name: string; enabled: boolean }>();
  adapters.add({
    key: 'contoso',
    name: 'Contoso',
    enabled: false,
  });

  const adapterList = Array.from(adapters);
  adapterList.sort((a1, a2) => a1.name.localeCompare(a2.name));

  return (
    <Fragment>
      <CollapsableWrapper title={formatMessage('Adapters')} titleStyle={titleStyle}>
        {header()}
        <div css={tableHeader}>
          <div css={tableHeaderText}>{formatMessage('Name')} </div>
          <div css={tableHeaderText}>{formatMessage('Connected')} </div>
          <div css={tableHeaderText}>{formatMessage('Enabled')} </div>
        </div>
        {adapterList.map((adapter) => (
          <div key={adapter.key} css={tableRow}>
            <div css={tableItem}>{adapter.name}</div>
            <div css={tableItem}>
              <Link
                onClick={() => {
                  setModalVisibility(true);
                }}
              >
                {formatMessage('Connect')}
              </Link>
            </div>
            <div css={tableItem}>
              <Toggle disabled offText="Off" onText="On" />
            </div>
          </div>
        ))}
      </CollapsableWrapper>

      <DialogWrapper
        dialogType={DialogTypes.Customer}
        isOpen={showModal}
        title={formatMessage('Configure adapter')}
        onDismiss={() => setModalVisibility(false)}
      >
        <DialogFooter>
          <PrimaryButton onClick={() => setModalVisibility(false)}>{formatMessage('Back')}</PrimaryButton>
          <DefaultButton onClick={() => setModalVisibility(false)}>{formatMessage('Create')}</DefaultButton>
        </DialogFooter>
      </DialogWrapper>
    </Fragment>
  );
};
