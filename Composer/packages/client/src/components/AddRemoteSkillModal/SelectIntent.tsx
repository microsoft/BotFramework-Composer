// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { join, isAbsolute } from 'path';

import { jsx, css } from '@emotion/core';
import React, { Fragment, useState, useMemo, useEffect, useCallback } from 'react';
import formatMessage from 'format-message';
import {
  DetailsList,
  SelectionMode,
  CheckboxVisibility,
  IDetailsRowProps,
} from 'office-ui-fabric-react/lib/DetailsList';
import { Selection } from 'office-ui-fabric-react/lib/Selection';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { LuEditor } from '@bfc/code-editor';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { LuFile, LuIntentSection, SDKKinds, ILUFeaturesConfig, DialogSetting } from '@bfc/shared';
import { useRecoilValue } from 'recoil';
import { IRenderFunction } from 'office-ui-fabric-react/lib/Utilities';

import TelemetryClient from '../../telemetry/TelemetryClient';
import { selectIntentDialog, enableOrchestratorDialog } from '../../constants';
import httpClient from '../../utils/httpUtil';
import luWorker from '../../recoilModel/parsers/luWorker';
import { localeState, dispatcherState } from '../../recoilModel';
import { recognizersSelectorFamily } from '../../recoilModel/selectors/recognizers';

import { EnableOrchestrator } from './EnableOrchestrator';
import { canImportOrchestrator } from './helper';

const detailListContainer = css`
  width: 100%;
  height: 300px;
  position: relative;
  overflow: hidden;
  flex-grow: 1;
  border: 1px solid #e5e5e5;
`;

type SelectIntentProps = {
  manifest: {
    dispatchModels: {
      intents: string[] | object;
      languages: object;
    };
  } & Record<string, any>;
  languages: string[];
  projectId: string;
  luFeatures: ILUFeaturesConfig;
  rootLuFiles: LuFile[];
  dialogId: string;
  zipContent: Record<string, string>;
  manifestDirPath: string;
  runtime: DialogSetting['runtime'];
  onSubmit: (event: Event, content: string, enable: boolean) => Promise<void>;
  onDismiss: () => void;
  onUpdateTitle: (title: { title: string; subText: string }) => void;
  onBack: () => void;
} & Record<string, any>;

const columns = [
  {
    key: 'Name',
    name: 'Name',
    minWidth: 300,
    isResizable: false,
    onRender: (item: string) => {
      return <Fragment>{item}</Fragment>;
    },
  },
];

const getRemoteLuFiles = async (
  skillLanguages: object,
  composerLangeages: string[],
  setWarningMsg,
  zipContent: Record<string, string>,
  manifestDirPath: string,
  locale: string
) => {
  const luFiles: Record<string, { id: string; content: string }[]> = {};
  try {
    for (const cl of composerLangeages) {
      let matchedLanguage = '';
      if (skillLanguages[cl]) {
        matchedLanguage = cl;
      } else {
        Object.keys(skillLanguages).forEach((sl) => {
          if (cl.startsWith(sl)) {
            matchedLanguage = sl;
          }
        });
      }
      if (matchedLanguage && Array.isArray(skillLanguages[matchedLanguage])) {
        luFiles[cl] = [];
        for (const item of skillLanguages[matchedLanguage]) {
          if (/^http[s]?:\/\/\w+/.test(item.url) || isAbsolute(item.url)) {
            // get lu file from remote
            const { data } = await httpClient.get(`/utilities/retrieveRemoteFile`, {
              params: {
                url: item.url,
              },
            });
            luFiles[cl].push(data);
          } else {
            // get luFile from local zip folder
            const fileKey = join(manifestDirPath, item.url);
            if (zipContent[fileKey]) {
              luFiles[cl].push({
                id: fileKey.substr(fileKey.lastIndexOf('/') + 1),
                content: zipContent[fileKey],
              });
            } else {
              // get lu file from remote
              const { data } = await httpClient.get(`/utilities/retrieveRemoteFile`, {
                params: {
                  url: fileKey,
                },
              });
              luFiles[cl].push(data);
            }
          }
        }
      } else if (locale === cl) {
        setWarningMsg(`no matching locale found for ${locale}`);
      }
    }
    return luFiles;
  } catch (e) {
    console.log(e);
    setWarningMsg('get remote file fail');
  }
};

const getParsedLuFiles = async (files: { id: string; content: string }[], luFeatures, lufiles) => {
  const promises = files.map((item) => {
    return luWorker.parse(item.id, item.content, luFeatures, lufiles) as Promise<LuFile>;
  });
  return await Promise.all(promises);
};

const mergeIntentsContent = (intents: LuIntentSection[]) => {
  return (
    intents
      .map((item) => {
        return `> ${item.Name}\n${item.Body}`;
      })
      .join('\n') || ''
  );
};
export const SelectIntent: React.FC<SelectIntentProps> = (props) => {
  const {
    manifest,
    onSubmit,
    onDismiss,
    languages,
    luFeatures,
    projectId,
    rootLuFiles,
    dialogId,
    runtime,
    onUpdateTitle,
    onBack,
    zipContent,
    manifestDirPath,
  } = props;
  const [pageIndex, setPage] = useState(0);
  const [selectedIntents, setSelectedIntents] = useState<Array<string>>([]);
  // luFiles from manifest, language was included in root bot languages
  const [lufilesOnLocale, setLufilesOnLocale] = useState<Array<{ locale: string; lufiles: LuFile }>>([]);
  // current locale Lufile
  const [currentLuFile, setCurrentLuFile] = useState<LuFile>();
  // selected intents in different languages
  const [multiLanguageIntents, setMultiLanguageIntents] = useState<Record<string, Array<LuIntentSection>>>({});
  // selected current locale intents content
  const [displayContent, setDisplayContent] = useState<string>('');
  const locale = useRecoilValue(localeState(projectId));
  const [showOrchestratorDialog, setShowOrchestratorDialog] = useState(false);
  const { batchUpdateLuFiles } = useRecoilValue(dispatcherState);
  const curRecognizers = useRecoilValue(recognizersSelectorFamily(projectId));
  const [warningMsg, setWarningMsg] = useState('');

  const hasOrchestrator = useMemo(() => {
    const fileName = `${dialogId}.${locale}.lu.dialog`;
    return curRecognizers.some((f) => f.id === fileName && f.content.$kind === SDKKinds.OrchestratorRecognizer);
  }, [curRecognizers, dialogId, locale]);

  const selection = useMemo(() => {
    return new Selection({
      onSelectionChanged: () => {
        const selectedItems = selection.getSelection();
        setSelectedIntents(selectedItems as string[]);
      },
    });
  }, []);

  const onRenderRow = (props?: IDetailsRowProps, defaultRender?: IRenderFunction<IDetailsRowProps>): JSX.Element => {
    return <div data-selection-toggle>{defaultRender?.(props)}</div>;
  };

  // intents from manifest, intents can be an object or array.
  const intentItems = useMemo(() => {
    let res;
    if (Array.isArray(manifest.dispatchModels?.intents)) {
      res = manifest.dispatchModels.intents;
    } else {
      res = Object.keys(manifest.dispatchModels?.intents);
    }
    return res;
  }, [manifest]);

  const updateLuFiles = useCallback(async () => {
    const payloads: { projectId: string; id: string; content: string }[] = [];
    for (const lufile of rootLuFiles) {
      const rootId = lufile.id.split('.');
      const language = rootId[rootId.length - 1];
      if (language !== locale) {
        const intents = multiLanguageIntents[language];
        if (!intents) {
          continue;
        }
        const append = mergeIntentsContent(intents);
        payloads.push({
          projectId,
          id: lufile.id,
          content: `${lufile.content}\n# ${manifest.name}\n${append}`,
        });
      }
    }
    await batchUpdateLuFiles(payloads);
  }, [rootLuFiles, projectId, locale, displayContent, multiLanguageIntents]);

  useEffect(() => {
    if (locale) {
      const skillLanguages = manifest.dispatchModels?.languages;
      getRemoteLuFiles(skillLanguages, languages, setWarningMsg, zipContent, manifestDirPath, locale)
        .then((items) => {
          const lufilesOnLocale: { locale: string; lufiles: LuFile[] }[] = [];
          for (const key in items) {
            getParsedLuFiles(items[key], luFeatures, []).then((files) => {
              lufilesOnLocale.push({ locale: key, lufiles: files });
              files.map((file) => {
                if (key === locale && file.id.endsWith('.lu')) {
                  setCurrentLuFile(file);
                }
              });
            });
          }
          setLufilesOnLocale(lufilesOnLocale);
        })
        .catch((e) => {
          console.log(e);
          setWarningMsg(formatMessage('get remote file fail'));
        });
    }
  }, [manifest.dispatchModels?.languages, locale, manifestDirPath]);

  useEffect(() => {
    if (selectedIntents.length > 0) {
      const intents: LuIntentSection[] = [];
      const multiLanguageIntents: Record<string, LuIntentSection[]> = {};
      currentLuFile?.intents?.forEach((cur) => {
        if (selectedIntents.includes(cur.Name)) {
          intents.push(cur);
        }
      });
      for (const { locale, lufiles } of lufilesOnLocale) {
        // const id = file.id.split('.');
        // const language = id[id.length - 2];
        multiLanguageIntents[locale] = [];
        for (const file of lufiles) {
          for (const intent of file.intents) {
            if (selectedIntents.includes(intent.Name)) {
              multiLanguageIntents[locale].push(intent);
            }
          }
        }
      }
      setMultiLanguageIntents(multiLanguageIntents);
      // current locale, selected intent value.
      const intentsValue = mergeIntentsContent(intents);
      setDisplayContent(intentsValue);
    } else {
      setDisplayContent('');
      setMultiLanguageIntents({});
    }
  }, [selectedIntents, currentLuFile, lufilesOnLocale]);

  const handleSubmit = async (ev, enableOchestractor) => {
    // add trigger to root
    await onSubmit(ev, displayContent, enableOchestractor);
    // append remote lufile into different language lu file
    await updateLuFiles();
  };

  return (
    <Fragment>
      {showOrchestratorDialog ? (
        <EnableOrchestrator
          projectId={projectId}
          runtime={runtime}
          onBack={() => {
            onUpdateTitle(selectIntentDialog.ADD_OR_EDIT_PHRASE(dialogId, manifest.name));
            setShowOrchestratorDialog(false);
          }}
          onSubmit={handleSubmit}
        />
      ) : (
        <Stack>
          {pageIndex === 0 ? (
            <StackItem>
              <Label>{formatMessage('Intents')}</Label>
              <div css={detailListContainer} data-is-scrollable="true">
                <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
                  <DetailsList
                    checkboxVisibility={CheckboxVisibility.always}
                    columns={columns}
                    isHeaderVisible={false}
                    items={intentItems}
                    selection={selection}
                    selectionMode={SelectionMode.multiple}
                    onRenderRow={onRenderRow}
                  />
                </ScrollablePane>
              </div>
            </StackItem>
          ) : (
            <StackItem>
              <LuEditor
                height={300}
                luOption={{
                  projectId,
                  fileId: dialogId,
                  sectionId: manifest.name,
                  luFeatures: luFeatures,
                }}
                telemetryClient={TelemetryClient}
                toolbarOptions={{ hidden: true }}
                value={displayContent}
                warningMessage={warningMsg}
                onChange={setDisplayContent}
              />
            </StackItem>
          )}
          <Separator />
          <Stack horizontal horizontalAlign="space-between">
            {pageIndex === 1 ? (
              <DefaultButton
                text={formatMessage('Back')}
                onClick={() => {
                  setPage(pageIndex - 1);
                  onUpdateTitle(selectIntentDialog.SELECT_INTENT(dialogId, manifest.name));
                }}
              />
            ) : (
              <DefaultButton text={formatMessage('Back')} onClick={onBack} />
            )}
            <span>
              <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
              <PrimaryButton
                styles={{ root: { marginLeft: '8px' } }}
                text={
                  pageIndex === 1 && (hasOrchestrator || !canImportOrchestrator(runtime?.key))
                    ? formatMessage('Done')
                    : formatMessage('Next')
                }
                onClick={(ev) => {
                  if (pageIndex === 1) {
                    if (hasOrchestrator || !canImportOrchestrator(runtime?.key)) {
                      // skip orchestrator modal
                      handleSubmit(ev, false);
                    } else {
                      // show orchestrator
                      onUpdateTitle(enableOrchestratorDialog);
                      setShowOrchestratorDialog(true);
                    }
                  } else {
                    // show next page
                    setPage(pageIndex + 1);
                    onUpdateTitle(selectIntentDialog.ADD_OR_EDIT_PHRASE(dialogId, manifest.name));
                  }
                }}
              />
            </span>
          </Stack>
        </Stack>
      )}
    </Fragment>
  );
};
