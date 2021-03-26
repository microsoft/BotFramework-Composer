// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useEffect, useState } from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { useRecoilValue } from 'recoil';

import { Header } from './components/Header';
import { Announcement } from './components/AppComponents/Announcement';
import { MainContainer } from './components/AppComponents/MainContainer';
import { dispatcherState, userHasNodeInstalledState, userSettingsState } from './recoilModel';
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
  const userHasNode = useRecoilValue(userHasNodeInstalledState);

  const { fetchExtensions, fetchFeatureFlags, checkNodeVersion } = useRecoilValue(dispatcherState);
  const [showNodeModal, setShowNodeModal] = useState(false);
  useEffect(() => {
    loadLocale(appLocale);
  }, [appLocale]);

  useEffect(() => {
    checkNodeVersion();
    fetchExtensions();
    fetchFeatureFlags();
  }, []);

  useEffect(() => {
    if (!userHasNode) {
      setShowNodeModal(true);
    }
  }, [userHasNode]);

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
