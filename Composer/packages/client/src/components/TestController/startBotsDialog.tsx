// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, ActionButton } from 'office-ui-fabric-react/lib/Button';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import formatMessage from 'format-message';
import {
  DetailsList,
  DetailsListLayoutMode,
  IDetailsRowProps,
  SelectionMode,
} from 'office-ui-fabric-react/lib/DetailsList';
import { useRecoilValue } from 'recoil';
import { IRenderFunction } from 'office-ui-fabric-react/lib/Utilities';
import { IPublishConfig } from '@bfc/shared';

import { botProjectSpaceSelector } from '../../recoilModel';
import {
  buildConfigurationSelector,
  botRuntimeOperationsSelector,
  trackBotStatusesSelector,
} from '../../recoilModel/selectors';

import { BotStatusIndicator } from './BotStatusIndicator';
import { BotRuntimeOperations } from './BotRuntimeOperations';

const styles = {
  detailListContainer: css`
    flex-grow: 1;
    height: 350px;
    position: relative;
    overflow: hidden;
  `,
};

export const actionButton = css`
  font-size: 14px;
  margin-top: 2px;
  color: #0078d4;
`;

const dialog = {
  title: {
    fontWeight: FontWeights.bold,
  },
};

function useBotStatusTracker(postSkillsStartAction: () => void, trackedProjectIds: string[]) {
  const savedCallback: any = useRef();
  const areBotsStarting = useRecoilValue(trackBotStatusesSelector(trackedProjectIds));

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = postSkillsStartAction;
  }, [postSkillsStartAction]);

  useEffect(() => {
    const trackedBotsStarted = !areBotsStarting;
    if (trackedProjectIds.length && trackedBotsStarted) {
      // Start the root bot now after skills are started.
      savedCallback.current();
    }
  }, [areBotsStarting]);
}

interface IStartBotsDialogProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export const StartBotsDialog: React.FC<IStartBotsDialogProps> = (props) => {
  const { isOpen, onDismiss } = props;
  const projectCollection = useRecoilValue(botProjectSpaceSelector);
  const [items, setItems] = useState<{ displayName: string; projectId: string }[]>([]);
  const [allBotsStarted, setAllBotsStarted] = useState<boolean>(false);
  const builderEssentials = useRecoilValue(buildConfigurationSelector);
  const botRuntimeOperations = useRecoilValue(botRuntimeOperationsSelector);
  const [trackedProjectIds, setProjectsToTrack] = useState<string[]>([]);

  useEffect(() => {
    const result = projectCollection.map(({ name, projectId }) => ({ displayName: name, projectId }));
    setItems(result);
  }, [projectCollection]);

  const handleBotStart = async (projectId: string, config: IPublishConfig, botBuildRequired: boolean) => {
    if (botBuildRequired) {
      // Default recognizer
      botRuntimeOperations?.buildWithDefaultRecognizer(projectId, config);
    } else {
      // Regex recognizer
      botRuntimeOperations?.startBot(projectId, config);
    }
  };

  const startRootBot = () => {
    setProjectsToTrack([]);
    const rootBot = builderEssentials[0];
    const { projectId, configuration, buildRequired } = rootBot;
    handleBotStart(projectId, configuration, buildRequired);
  };

  // Custom hook to make sure root bot is started after all skills have been started.
  useBotStatusTracker(() => {
    startRootBot();
  }, trackedProjectIds);

  const onRenderRow = (props?: IDetailsRowProps, defaultRender?: IRenderFunction<IDetailsRowProps>): JSX.Element => {
    return <div>{defaultRender && defaultRender(props)}</div>;
  };

  const startAllBots = () => {
    const [_, ...skillsBots] = builderEssentials;
    const trackProjects: string[] = [];
    for (const botBuildConfig of skillsBots) {
      const { projectId, configuration, buildRequired } = botBuildConfig;
      trackProjects.push(projectId);
      handleBotStart(projectId, configuration, buildRequired);
    }
    setProjectsToTrack(trackProjects);
    setAllBotsStarted(true);
  };

  const stopAllBots = () => {
    setProjectsToTrack([]);
    builderEssentials.forEach(({ projectId }) => botRuntimeOperations?.stopBot(projectId));
    setAllBotsStarted(false);
  };

  const tableColumns: any = [
    {
      key: 'botName',
      name: formatMessage('Bot'),
      fieldName: 'id',
      isRowHeader: true,
      isResizable: true,
      isSortedDescending: false,
      sortAscendingAriaLabel: formatMessage('Sorted A to Z'),
      sortDescendingAriaLabel: formatMessage('Sorted Z to A'),
      data: 'string',
      onRender: (item: { displayName: string; projectId: string }) => {
        return <BotRuntimeOperations displayName={item.displayName} projectId={item.projectId} />;
      },
      isPadded: true,
    },
    {
      key: 'status',
      name: formatMessage('Status'),
      fieldName: 'type',
      isRowHeader: true,
      isResizable: true,
      isSorted: true,
      data: 'string',
      onRender: (item: { displayName: string; projectId: string }) => {
        return <BotStatusIndicator projectId={item.projectId} />;
      },
      isPadded: true,
    },
  ];

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: formatMessage('Local bot runtime manager'),
        styles: dialog,
      }}
      hidden={!isOpen}
      maxWidth={700}
      minWidth={700}
      modalProps={{
        isBlocking: false,
        isModeless: true,
      }}
      onDismiss={onDismiss}
    >
      <div css={styles.detailListContainer}>
        <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
          <ActionButton css={actionButton}>
            {allBotsStarted ? (
              <button onClick={stopAllBots}> Stop all Bots </button>
            ) : (
              <button onClick={startAllBots}>Start all bots</button>
            )}
          </ActionButton>
          <DetailsList
            columns={tableColumns}
            compact={false}
            getKey={(item) => item.id}
            items={items}
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.none}
            onRenderRow={onRenderRow}
          />
        </ScrollablePane>
      </div>
      <DialogFooter>
        <DefaultButton data-testid={'start-bots-dialog'} text={formatMessage('Close')} onClick={onDismiss} />
      </DialogFooter>
    </Dialog>
  );
};
