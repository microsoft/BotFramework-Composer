// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { extractSchemaProperties, groupTriggersByPropertyReference } from '@bfc/indexers';
import { DialogInfo, ITrigger } from '@bfc/shared';
import * as React from 'react';
import { useRecoilValue } from 'recoil';

import { AssetItem, AugmentedBotInProject, BotBoundAssetData, DialogBoundAssetData } from '../components/Search/types';
import {
  allLgFilesSelector,
  allLuFilesSelector,
  allQnaFilesSelector,
  botProjectSpaceSelector,
  jsonSchemaFilesByProjectIdSelector,
} from '../recoilModel';
import { getFriendlyName } from '../utils/dialogUtil';

const getTriggerName = (trigger: ITrigger) => {
  return trigger.displayName || getFriendlyName({ $kind: trigger.type });
};

export const useProjectAssetItems = <T>(): AssetItem<T>[] => {
  const projectCollection = useRecoilValue<AugmentedBotInProject[]>(botProjectSpaceSelector);
  const jsonSchemaFilesByProjectId = useRecoilValue(jsonSchemaFilesByProjectIdSelector);
  const allLuFiles = useRecoilValue(allLuFilesSelector);
  const allLgFiles = useRecoilValue(allLgFilesSelector);
  const allQnaFiles = useRecoilValue(allQnaFilesSelector);
  const locale = 'en-us';

  const getFormDialogTriggerAssets = React.useCallback(
    (bot: AugmentedBotInProject, dialog: DialogInfo) => {
      const formAssets: AssetItem<DialogBoundAssetData>[] = [];

      const jsonSchemaFiles = jsonSchemaFilesByProjectId[bot.projectId];
      const dialogSchemaProperties = extractSchemaProperties(dialog, jsonSchemaFiles);
      const groupedTriggers = groupTriggersByPropertyReference(dialog, { validProperties: dialogSchemaProperties });

      const formTriggerAssets = Object.keys(groupedTriggers).reduce<AssetItem<DialogBoundAssetData>[]>(
        (acc, property) => {
          acc.push(
            ...groupedTriggers[property].map<AssetItem<DialogBoundAssetData>>((t) => ({
              uniqueId: `${dialog.id}:trigger:${t.id}`,
              id: t.id,
              kind: 'trigger',
              data: { botId: bot.projectId, dialogId: dialog.id, label: getTriggerName(t) },
              path: [bot.name, dialog.displayName, property, getTriggerName(t)],
            }))
          );

          return acc;
        },
        [] as AssetItem<DialogBoundAssetData>[]
      );

      formAssets.push(...formTriggerAssets);

      return formAssets;
    },
    [jsonSchemaFilesByProjectId]
  );

  const getDialogTriggerAssets = React.useCallback(
    (bot: AugmentedBotInProject, dialog: DialogInfo) => {
      return dialog.isFormDialog
        ? getFormDialogTriggerAssets(bot, dialog)
        : dialog.triggers.map<AssetItem<DialogBoundAssetData>>((t) => ({
            uniqueId: `${dialog.id}:trigger:${t.id}`,
            id: t.id,
            kind: 'trigger',
            data: { label: getTriggerName(t), botId: bot.projectId, dialogId: dialog.id },
            path: [bot.name, dialog.displayName, getTriggerName(t)],
          }));
    },
    [getFormDialogTriggerAssets]
  );

  const getDialogLuAssets = React.useCallback(
    (bot: AugmentedBotInProject, dialog: DialogInfo) => {
      if (dialog.isFormDialog) {
        return [
          ...allLuFiles[bot.projectId]
            .filter((luFile) => luFile.id === dialog.id || luFile.id === `${dialog.id}.${locale}`)
            .map<AssetItem<DialogBoundAssetData>>((luFile) => ({
              id: luFile.id,
              uniqueId: `${dialog.id}:lu:${luFile.id}`,
              kind: 'lu',
              data: { botId: bot.projectId, dialogId: dialog.id, label: luFile.id },
              path: [bot.name, dialog.displayName, luFile.id],
            })),
          ...bot.luImports[dialog.id].map<AssetItem<DialogBoundAssetData>>((luImport) => ({
            uniqueId: `${dialog.id}:lu:${luImport.id}`,
            id: luImport.id,
            kind: 'luImport',
            data: { botId: bot.projectId, dialogId: dialog.id, label: luImport.displayName },
            path: [bot.name, dialog.displayName, luImport.displayName],
          })),
        ];
      } else {
        return allLuFiles[bot.projectId]
          .filter((luFile) => luFile.id.startsWith(dialog.id))
          .map<AssetItem<DialogBoundAssetData>>((luFile) => ({
            uniqueId: `${dialog.id}:lu:${luFile.id}`,
            id: luFile.id,
            kind: 'lu',
            data: { botId: bot.projectId, dialogId: dialog.id, label: luFile.id },
            path: [bot.name, dialog.displayName, luFile.id],
          }));
      }
    },
    [allLuFiles]
  );

  const getDialogQnaAssets = React.useCallback(
    (bot: AugmentedBotInProject, dialog: DialogInfo) => {
      return allQnaFiles[bot.projectId]
        .filter((qnaFile) => qnaFile.id.startsWith(dialog.id))
        .map<AssetItem<DialogBoundAssetData>>((qnaFile) => ({
          uniqueId: `${dialog.id}:qna:${qnaFile.id}`,
          id: qnaFile.id,
          kind: 'qna',
          data: { botId: bot.projectId, dialogId: dialog.id, label: qnaFile.id },
          path: [bot.name, dialog.displayName, qnaFile.id],
        }));
    },
    [allQnaFiles]
  );

  const getDialogLgAssets = React.useCallback(
    (bot: AugmentedBotInProject, dialog: DialogInfo) => {
      if (dialog.isFormDialog) {
        return [
          ...allLgFiles[bot.projectId]
            .filter((lgFile) => lgFile.id === dialog.id || lgFile.id === `${dialog.id}.${locale}`)
            .map<AssetItem<DialogBoundAssetData>>((lgFile) => ({
              uniqueId: `${dialog.id}:lg:${lgFile.id}`,
              id: lgFile.id,
              kind: 'lg',
              data: { botId: bot.projectId, dialogId: dialog.id, label: lgFile.id },
              path: [bot.name, dialog.displayName, lgFile.id],
            })),
          ...bot.lgImports[dialog.id].map<AssetItem<DialogBoundAssetData>>((lgImport) => ({
            uniqueId: lgImport.id,
            id: lgImport.id,
            kind: 'lgImport',
            data: { botId: bot.projectId, dialogId: dialog.id, label: lgImport.displayName },
            path: [bot.name, dialog.displayName, lgImport.displayName],
          })),
        ];
      } else {
        return allLgFiles[bot.projectId]
          .filter((lgFile) => lgFile.id.startsWith('common') || lgFile.id.startsWith(dialog.id))
          .map<AssetItem<DialogBoundAssetData>>((lgFile) => ({
            uniqueId: `${dialog.id}:lg:${lgFile.id}`,
            id: lgFile.id,
            kind: 'lg',
            data: { botId: bot.projectId, dialogId: dialog.id, label: lgFile.id },
            path: [bot.name, dialog.displayName, lgFile.id],
          }));
      }
    },
    [allLgFiles]
  );

  const getBotDialogAssets = React.useCallback(
    (bot: AugmentedBotInProject) => {
      return bot.dialogs.reduce<AssetItem<any>[]>((acc, d) => {
        const lgAssets = getDialogLgAssets(bot, d);
        const luAssets = getDialogLuAssets(bot, d);
        const qnaAssets = getDialogQnaAssets(bot, d);
        const triggerAssets = getDialogTriggerAssets(bot, d);

        acc.push(
          {
            id: d.id,
            kind: d.isFormDialog ? 'formDialog' : 'dialog',
            uniqueId: `${d.isFormDialog ? 'formDialog' : 'dialog'}:${d.id}`,
            data: { botId: bot.projectId, label: d.displayName },
            path: [bot.name, d.displayName],
          },
          ...triggerAssets,
          ...qnaAssets,
          ...lgAssets,
          ...luAssets
        );

        return acc;
      }, [] as AssetItem<any>[]);
    },
    [getDialogLgAssets, getDialogLuAssets, getDialogQnaAssets, getDialogTriggerAssets]
  );

  const getFormDialogSchemaAssets = React.useCallback((bot: AugmentedBotInProject) => {
    return bot.formDialogSchemas.map<AssetItem<BotBoundAssetData>>((fd) => ({
      uniqueId: `formSchema:${fd.id}`,
      id: fd.id,
      kind: 'formSchema',
      path: [bot.name, fd.id],
      data: { botId: bot.projectId, label: fd.id },
    }));
  }, []);

  const getBotAssets = React.useCallback(
    (bot: AugmentedBotInProject): AssetItem<any>[] => {
      const schemasAssets = getFormDialogSchemaAssets(bot);
      const dialogsAssets = getBotDialogAssets(bot);

      const botAssets: AssetItem<any>[] = [];

      if (schemasAssets.length) {
        botAssets.push(...schemasAssets);
      }

      if (dialogsAssets.length) {
        botAssets.push(...dialogsAssets);
      }

      return botAssets;
    },
    [getFormDialogSchemaAssets, getBotDialogAssets]
  );

  const allAssetItems: AssetItem<any>[] = React.useMemo(
    () =>
      projectCollection.reduce<AssetItem<any>[]>((acc, bot) => {
        acc.push(...getBotAssets(bot));
        return acc;
      }, [] as AssetItem<any>[]),
    [projectCollection]
  );

  return allAssetItems;
};
