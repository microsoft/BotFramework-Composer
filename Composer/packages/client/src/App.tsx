// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useEffect, useState } from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { useRecoilValue } from 'recoil';

import { Header } from './components/Header';
import { Announcement } from './components/AppComponents/Announcement';
import { MainContainer } from './components/AppComponents/MainContainer';
import { dispatcherState, userSettingsState } from './recoilModel';
import { loadLocale } from './utils/fileUtil';
import { useInitializeLogger } from './telemetry/useInitializeLogger';
import { NodeModal } from './components/CreationFlow/v2/NodeModal';

initializeIcons(undefined, { disableWarnings: true });

const Logger = () => {
  useInitializeLogger();
  return null;
};

export const App: React.FC = () => {
  const { appLocale } = useRecoilValue(userSettingsState);
  const { fetchExtensions, fetchFeatureFlags } = useRecoilValue(dispatcherState);
  const [showNodeModal, setShowNodeModal] = useState(true);
  useEffect(() => {
    loadLocale(appLocale);
  }, [appLocale]);

  useEffect(() => {
    fetchExtensions();
    fetchFeatureFlags();
  }, []);

  return (
    <Fragment key={appLocale}>
      {showNodeModal && <NodeModal isOpen={showNodeModal} setIsOpen={setShowNodeModal} />}
      <Logger />
      <Announcement />
      <Header />
      <MainContainer />
    </Fragment>
  );
};
