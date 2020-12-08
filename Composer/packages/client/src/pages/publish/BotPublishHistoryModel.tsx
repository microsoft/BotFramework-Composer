// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Goals:
 * 1. No abuse use of useEffect().
 * 2. Background polling / Event source
 * 3. One-way data flow -> refine the state design
 * 4. Componentize
 * 5. Variable names & code format
 */

// Server returned models
export interface PublishRecord {
  botId: string;
  targetId: string;
  time: string;
  date: string;
  status: string;
  message: string;
  comment: string;
  log: string;
}

export interface BotSetting {
  botId: string;
  targets: string[];
}

// UI models
export interface PublishTargetHistory {
  targetId: string;
  records: PublishRecord[];
}

export interface BotHistory {
  botId: string;
  targets: PublishTargetHistory[];
  getLastRecord: () => PublishRecord | undefined;
}

export interface HierarchicalPublishHistory {
  bots: BotHistory[];
  insertRecord: (record: PublishRecord) => boolean;
}

// Computations
const mergeHistory = (
  botSettings: BotSetting[],
  publishRecordSet: Map<string, PublishRecord[]>
): HierarchicalPublishHistory => {
  const bots = botSettings.map(({ botId, targets }) => {
    return {
      botId,
      targets: targets.map((id) => ({ targetId: id, records: [] })),
      getLastRecord: () => undefined,
    } as BotHistory;
  });

  for (const bot of bots) {
    const { botId, targets } = bot;
    for (const target of targets) {
      target.records = publishRecordSet.get(target.targetId) || [];
    }
  }

  const insertRecord = (record: PublishRecord): boolean => {
    const targetBot = bots.find((bot) => bot.botId === record.botId);
    if (!targetBot) return false;

    const targetProfile = targetBot.targets.find((t) => t.targetId === record.targetId);
    if (!targetProfile) return false;

    targetProfile.records = [...targetProfile.records, record];
    return true;
  };

  return {
    bots,
    insertRecord,
  };
};

// UI
const BotHistoryRow: React.FC<{ botHistory: BotHistory }> = ({ botHistory }) => {
  const { botId, targets } = botHistory;
  const [selectedTargetId, onSelectTarget] = useState<string>(targets[0].targetId);

  const selectedTarget = targets.find((x) => x.targetId === selectedTargetId);
  const lastPublishRecord = selectedTarget?.records[-1];
  const getRecordStatus = (record?: PublishRecord): string => (record?.status === '202' ? 'loading' : 'success');

  return (
    <div>
      <div>Bot Id: {botId}</div>
      <div>
        Dropdown: {selectedTargetId}
        {targets.map((x) => (
          <p key={`${botId}/${x.targetId}`} onClick={() => onSelectTarget(x.targetId)}>
            {x.targetId}
          </p>
        ))}
      </div>
      <div>Status: {getRecordStatus(lastPublishRecord)}</div>
      <div>
        Last publish history:
        {JSON.stringify(lastPublishRecord)}
      </div>
      <div>
        On Expand:
        {targets
          .find((t) => t.targetId === selectedTargetId)
          ?.records.map((record) => (
            <div key={`record/${record.botId}/${record.targetId}`}>
              Value: {JSON.stringify(record)}
              Status: {getRecordStatus(record)}
            </div>
          ))}
      </div>
    </div>
  );
};

class PublishHistoryUpdater {
  targetId = '';
  startPolling(onData) {
    onData();
  }
  stopPolling() {}
}

const PublishPage = () => {
  const [botSettings] = useState<BotSetting[]>([]);
  const [publishHistory] = useState<Map<string, PublishRecord[]>>(new Map());

  // Better to use background tasks
  const historyUpdater = useRef<Map<string, PublishHistoryUpdater>>(new Map());

  const historyData = useMemo(() => mergeHistory(botSettings, publishHistory), [botSettings, publishHistory]);
  const displayedPublishTargets = historyData.bots.map((b) => b.targets[0].targetId);

  useEffect(() => {
    displayedPublishTargets.forEach(() => {
      // updater.startPolling();
      // Save updater to ref.
    });
    return () => Object.values(historyUpdater.current).forEach((updater) => updater.stopPolling());
  }, []);

  const onPublish = () => {
    const selectedIds = [];
    const selectedTargets = { bot1: 'Azure1' };
    const updaters: PublishHistoryUpdater[] = []; // create intervals
    updaters.forEach((x) =>
      x.startPolling((records) => {
        publishHistory.set('Azure1', records);
      })
    );
  };

  return (
    <div>
      {historyData.bots.map((b) => (
        <BotHistoryRow key={`history/${b.botId}`} botHistory={b} />
      ))}
      <button onClick={() => onPublish()}>Publish all selecetd</button>
    </div>
  );
};
