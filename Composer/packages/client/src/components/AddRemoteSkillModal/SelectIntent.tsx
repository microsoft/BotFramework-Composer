// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { Fragment, useState, useMemo, useEffect, useCallback } from 'react';
import formatMessage from 'format-message';
import { DetailsList, SelectionMode, CheckboxVisibility } from 'office-ui-fabric-react/lib/DetailsList';
import { Selection } from 'office-ui-fabric-react/lib/Selection';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { LuEditor } from '@bfc/code-editor';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { LuFile, LuIntentSection, SDKKinds, ILUFeaturesConfig } from '@bfc/shared';
import { useRecoilValue } from 'recoil';

import TelemetryClient from '../../telemetry/TelemetryClient';
import { selectIntentDialog, enableOrchestratorDialog } from '../../constants';
import httpClient from '../../utils/httpUtil';
import luWorker from '../../recoilModel/parsers/luWorker';
import { localeState, dispatcherState } from '../../recoilModel';
import { recognizersSelectorFamily } from '../../recoilModel/selectors/recognizers';

import { EnableOrchestrator } from './EnableOrchestrator';
import { join } from 'path';

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
  manifestDirPath: string
) => {
  const luFiles: { id: string; content: string }[] = [];
  try {
    for (const [key, value] of Object.entries(skillLanguages)) {
      if (composerLangeages.includes(key)) {
        value.map(async (item) => {
          if (/^http[s]?:\/\/\w+/.test(item.url)) {
            // get lu file from remote
            const { data } = await httpClient.get(`/utilities/retrieveRemoteFile`, {
              params: {
                url: item.url,
              },
            });
            luFiles.push(data);
          } else {
            // get luFile from local
            const fileKey = join(manifestDirPath, item.url);
            luFiles.push({
              id: fileKey.substr(fileKey.lastIndexOf('/') + 1),
              content: zipContent[fileKey],
            });
          }
        });
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
    onUpdateTitle,
    onBack,
    zipContent,
    manifestDirPath,
  } = props;
  const [pageIndex, setPage] = useState(0);
  const [selectedIntents, setSelectedIntents] = useState<Array<string>>([]);
  // luFiles from manifest, language was included in root bot languages
  const [luFiles, setLufiles] = useState<Array<LuFile>>([]);
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
      getRemoteLuFiles(skillLanguages, languages, setWarningMsg, zipContent, manifestDirPath)
        .then((items) => {
          items &&
            getParsedLuFiles(items, luFeatures, []).then((files) => {
              setLufiles(files);
              files.map((file) => {
                if (file.id.includes(locale) && file.id.endsWith('.lu')) {
                  setCurrentLuFile(file);
                }
              });
            });
        })
        .catch((e) => {
          console.log(e);
          setWarningMsg(formatMessage('get remote file fail'));
        });
    }
  }, [manifest.dispatchModels?.languages, locale]);

  useEffect(() => {
    if (selectedIntents.length > 0) {
      const intents: LuIntentSection[] = [];
      const multiLanguageIntents: Record<string, LuIntentSection[]> = {};
      currentLuFile?.intents?.forEach((cur) => {
        if (selectedIntents.includes(cur.Name)) {
          intents.push(cur);
        }
      });
      for (const file of luFiles) {
        const id = file.id.split('.');
        const language = id[id.length - 1];
        multiLanguageIntents[language] = [];
        for (const intent of file.intents) {
          if (selectedIntents.includes(intent.Name)) {
            multiLanguageIntents[language].push(intent);
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
  }, [selectedIntents, currentLuFile, luFiles]);

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
                text={pageIndex === 1 && hasOrchestrator ? formatMessage('Done') : formatMessage('Next')}
                onClick={(ev) => {
                  if (pageIndex === 1) {
                    if (hasOrchestrator) {
                      // skip orchestrator modal
                      handleSubmit(ev, true);
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
