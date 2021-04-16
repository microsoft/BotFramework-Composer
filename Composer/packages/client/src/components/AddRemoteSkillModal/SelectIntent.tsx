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

import { Orchestractor } from './Orchestractor';
import { getLuDiagnostics } from './helper';

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
  onSubmit: (event: Event, content: string, enable: boolean) => void;
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

const getRemoteLuFiles = async (skillLanguages: object, composerLangeages: string[], setWarningMsg) => {
  const luFilePromise: Promise<any>[] = [];
  try {
    for (const [key, value] of Object.entries(skillLanguages)) {
      if (composerLangeages.includes(key)) {
        value.map((item) => {
          // get lu file
          luFilePromise.push(
            httpClient
              .get(`/utilities/retrieveRemoteFile`, {
                params: {
                  url: item.url,
                },
              })
              .catch((err) => {
                console.error(err);
                setWarningMsg('get remote file fail');
              })
          );
        });
      }
    }
    const responses = await Promise.all(luFilePromise);
    const files: { id: string; content: string }[] = responses.map((response) => {
      return response.data;
    });
    return files;
  } catch (e) {
    console.log(e);
  }
};

const getParsedLuFiles = async (files: { id: string; content: string }[], luFeatures, lufiles) => {
  const promises = files.map((item) => {
    return luWorker.parse(item.id, item.content, luFeatures, lufiles) as Promise<LuFile>;
  });
  const luFiles: LuFile[] = await Promise.all(promises);
  return luFiles;
};

const mergeIntentsContent = (intents: LuIntentSection[]) => {
  return (
    intents
      ?.map((item) => {
        return `> ${item.Name}` + '\n' + item.Body;
      })
      ?.join('\n') || ''
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
  } = props;
  const [page, setPage] = useState(0);
  const [selectedIntents, setSelectedIntents] = useState<Array<string>>([]);
  // luFiles from manifest, language was included in root bot languages
  const [luFiles, setLufile] = useState<Array<LuFile>>([]);
  // current locale Lufile
  const [currentLuFile, setCurrentLuFile] = useState<LuFile>();
  // selected intents in different languages
  const [multiLanguageIntents, setMultiLanguageIntents] = useState<Record<string, Array<LuIntentSection>>>({});
  // selected current locale intents content
  const [displayContent, setDisplayContent] = useState<string>('');
  // const [diagnostics, setDiagnostics] = useState([]);
  const locale = useRecoilValue(localeState(projectId));
  const [showOrchestratorDialog, setShowOrchestratorDialog] = useState(false);
  const { batchUpdateLuFiles } = useRecoilValue(dispatcherState);
  const curRecognizers = useRecoilValue(recognizersSelectorFamily(projectId));
  const [triggerErrorMessage, setTriggerErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');

  const hasOrchestrator = useMemo(() => {
    const fileName = `${dialogId}.${locale}.lu.dialog`;
    for (const file of curRecognizers) {
      if (file.id === fileName && file.content.$kind === SDKKinds.OrchestratorRecognizer) {
        return true;
      }
    }
    return false;
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

  const updateLuFiles = useCallback(() => {
    const payloads: { projectId: string; id: string; content: string }[] = [];
    rootLuFiles?.map(async (lufile) => {
      const rootId = lufile.id.split('.');
      const language = rootId[rootId.length - 1];
      let append = '';
      if (language === locale) {
        append = displayContent;
      } else {
        const intents = multiLanguageIntents[language];
        if (!intents) {
          return;
        }
        append = mergeIntentsContent(intents);
      }
      payloads.push({
        projectId,
        id: lufile.id,
        content: lufile.content + `\n # ${manifest.name} \n` + append,
      });
    });
    batchUpdateLuFiles(payloads);
  }, [rootLuFiles, projectId, locale, displayContent, multiLanguageIntents]);

  useEffect(() => {
    if (locale) {
      const skillLanguages = manifest.dispatchModels?.languages;
      const luFeaturesTemp = {
        enableMLEntities: false,
        enableListEntities: false,
        enableCompositeEntities: false,
        enablePrebuiltEntities: false,
        enableRegexEntities: false,
      };
      getRemoteLuFiles(skillLanguages, languages, setWarningMsg)
        .then((items) => {
          items &&
            getParsedLuFiles(items, luFeaturesTemp, []).then((files) => {
              setLufile(files);
              files.map((file) => {
                if (file.id.includes(locale)) {
                  setCurrentLuFile(file);
                }
              });
            });
        })
        .catch((e) => {
          console.log(e);
          setWarningMsg('get remote file fail');
        });
    }
  }, [manifest.dispatchModels?.languages, languages, locale]);

  useEffect(() => {
    if (selectedIntents.length > 0) {
      const intents: LuIntentSection[] = [];
      const multiLanguageIntents: Record<string, LuIntentSection[]> = {};
      currentLuFile?.intents?.map((intent) => {
        if (selectedIntents.includes(intent.Name)) {
          intents.push(intent);
        }
      });

      luFiles?.map((file) => {
        const id = file.id.split('.');
        const language = id[id.length - 1];
        multiLanguageIntents[language] = [];
        file.intents?.map((intent) => {
          if (selectedIntents.includes(intent.Name)) {
            multiLanguageIntents[language].push(intent);
          }
        });
      });
      setMultiLanguageIntents(multiLanguageIntents);
      // current locale, selected intent value.
      const intentsValue = mergeIntentsContent(intents);
      setDisplayContent(intentsValue);
    } else {
      setDisplayContent('');
      setMultiLanguageIntents({});
    }
  }, [selectedIntents, currentLuFile, luFiles]);

  useEffect(() => {
    if (displayContent) {
      const error = getLuDiagnostics('manifestName', displayContent);
      setTriggerErrorMsg(error);
    } else {
      setTriggerErrorMsg('');
    }
  }, [displayContent]);

  const handleSubmit = (ev, enableOchestractor) => {
    // append remote lufile into root lu file
    updateLuFiles();
    // add trigger to root
    onSubmit(ev, displayContent, enableOchestractor);
  };

  return (
    <Fragment>
      {showOrchestratorDialog ? (
        <Orchestractor
          projectId={projectId}
          onBack={() => {
            onUpdateTitle(selectIntentDialog.ADD_OR_EDIT_PHRASE(dialogId, manifest.name));
            setShowOrchestratorDialog(false);
          }}
          onSubmit={handleSubmit}
        />
      ) : (
        <Stack>
          {page === 0 ? (
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
                toolbarHidden
                errorMessage={triggerErrorMessage}
                height={300}
                luOption={{
                  projectId,
                  fileId: dialogId,
                  sectionId: manifest.name,
                  luFeatures: luFeatures,
                }}
                telemetryClient={TelemetryClient}
                value={displayContent}
                warningMessage={warningMsg}
                onChange={setDisplayContent}
              />
            </StackItem>
          )}
          <Separator />
          <Stack horizontal horizontalAlign="space-between">
            {page === 1 ? (
              <DefaultButton
                text={formatMessage('Back')}
                onClick={() => {
                  setPage(page - 1);
                  onUpdateTitle(selectIntentDialog.SELECT_INTENT(dialogId, manifest.name));
                }}
              />
            ) : (
              <DefaultButton text={formatMessage('Back')} onClick={onBack} />
            )}
            <span>
              <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
              <PrimaryButton
                disabled={triggerErrorMessage && page === 1 ? true : false}
                styles={{ root: { marginLeft: '8px' } }}
                text={page === 1 && hasOrchestrator ? formatMessage('Done') : formatMessage('Next')}
                onClick={(ev) => {
                  if (page === 1) {
                    if (hasOrchestrator) {
                      // skip orchestractor modal
                      handleSubmit(ev, true);
                    } else {
                      // show orchestractor
                      onUpdateTitle(enableOrchestratorDialog);
                      setShowOrchestratorDialog(true);
                    }
                  } else {
                    // show next page
                    setPage(page + 1);
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
