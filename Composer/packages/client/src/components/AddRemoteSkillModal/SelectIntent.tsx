// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { Fragment, useState, useMemo, useEffect, useCallback } from 'react';
import formatMessage from 'format-message';
import { DetailsList, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { Selection } from 'office-ui-fabric-react/lib/Selection';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { LuEditor } from '@bfc/code-editor';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { LuFile, LuIntentSection } from '@bfc/shared';
import { useRecoilValue } from 'recoil';

import { selectIntentDialog } from '../../constants';
import httpClient from '../../utils/httpUtil';
import luWorker from '../../recoilModel/parsers/luWorker';
import { localeState, dispatcherState } from '../../recoilModel';

import { Orchestractor } from './Orchestractor';

const detailListContainer = css`
  width: 100%;
  height: 400px;
  position: relative;
  overflow: hidden;
  flex-grow: 1;
  border: 1px solid E5E5E5;
`;

interface SelectIntentProps {
  manifest: {
    dispatchModels: {
      intents: Array<string> | object;
      languages: object;
    };
    [key: string]: any;
  };
  languages: string[];
  projectId: string;
  luFeatures: any;
  rootLuFiles: LuFile[];
  dialogId: string;
  onSubmit: (event, content: string, enable: boolean) => void;
  onDismiss: () => void;
  setTitle: (value) => void;
  onBack: () => void;
}

const columns = [
  {
    key: 'Name',
    name: 'Name',
    minWidth: 300,
    isResizable: false,
    onRender: (item: string) => {
      return <div>{item}</div>;
    },
  },
];

const getRemoteLuFiles = async (skillLanguages: object, composerLangeages: string[]) => {
  const luFilePromise: Promise<any>[] = [];
  try {
    for (const [key, value] of Object.entries(skillLanguages)) {
      if (composerLangeages.includes(key)) {
        value.map((item) => {
          // get lu file
          luFilePromise.push(
            httpClient.get(`/skill/retrieveRemoteFile`, {
              params: {
                url: item.url,
              },
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

const getParsedLuFiles = async (files: { id: string; content: string }[], luFeatures) => {
  const promises = files?.map((item) => {
    return luWorker.parse(item.id, item.content, luFeatures) as Promise<LuFile>;
  });
  const luFiles: LuFile[] = await Promise.all(promises);
  return luFiles;
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
    setTitle,
    onBack,
  } = props;
  const [page, setPage] = useState(0);
  const [selectedIntents, setSelectedIntents] = useState<Array<string>>([]);
  // luFiles from manifest
  const [luFiles, setLufile] = useState<Array<LuFile>>([]);
  // current locale Lufile
  const [currentLuFile, setCurrentLuFile] = useState<LuFile>();
  // selected current locale intents
  const [displayIntents, setDisplayIntent] = useState<Array<LuIntentSection>>([]);
  const [displayContent, setDisplayContent] = useState<string>('');
  // const [luFileError, setError] = useState();
  const locale = useRecoilValue(localeState(projectId));
  const [showOrchestratorDialog, setShowOrchestratorDialog] = useState(false);
  const { updateLuFile: updateLuFileDispatcher } = useRecoilValue(dispatcherState);

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

  const updateLuFile = useCallback(
    (content: string) => {
      const file = rootLuFiles.find(({ id }) => id.includes(locale));
      if (!file) return;
      const { id } = file;
      file.content;
      const payload = {
        projectId: projectId,
        id,
        content: file.content + `\n # ${manifest.name} \n` + content,
      };
      updateLuFileDispatcher(payload);
    },
    [rootLuFiles, projectId, locale]
  );

  useEffect(() => {
    if (locale) {
      const skillLanguages = manifest.dispatchModels?.languages;
      getRemoteLuFiles(skillLanguages, languages)
        .then((items) => {
          items &&
            getParsedLuFiles(items, luFeatures).then((files) => {
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
        });
    }
  }, [manifest.dispatchModels?.languages, languages, locale]);

  useEffect(() => {
    if (selectedIntents.length > 0 && currentLuFile) {
      const intents: LuIntentSection[] = [];
      currentLuFile.intents.map((intent) => {
        if (selectedIntents.includes(intent.Name)) {
          intents.push(intent);
        }
      });
      setDisplayIntent(intents);

      // current locale, selected intent value.
      const intentsValue = intents
        .map((item) => {
          return `> ${item.Name}` + '\n' + item.Body;
        })
        .join('\n');
      setDisplayContent(intentsValue);
    }
  }, [selectedIntents, currentLuFile]);

  return (
    <Fragment>
      {showOrchestratorDialog ? (
        <Orchestractor
          projectId={projectId}
          onBack={() => {
            setTitle(selectIntentDialog.ADD_OR_EDIT_PHRASE(dialogId, manifest.name));
            setShowOrchestratorDialog(false);
          }}
          onSubmit={(ev, enable) => {
            // append remote lufile into root lu file
            updateLuFile(displayContent);
            // add trigger to root
            onSubmit(ev, displayContent, enable);
          }}
        />
      ) : (
        <Stack>
          {page === 0 ? (
            <StackItem>
              <Label>{formatMessage('Intents')}</Label>
              <div css={detailListContainer} data-is-scrollable="true">
                <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
                  <DetailsList
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
              <LuEditor height={400} value={displayContent} onChange={setDisplayContent} />
            </StackItem>
          )}
          <Separator />
          <Stack horizontal horizontalAlign="space-between">
            {page === 1 ? (
              <DefaultButton
                text={formatMessage('Back')}
                onClick={() => {
                  setPage(page - 1);
                  setTitle(selectIntentDialog.SELECT_INTENT(dialogId, manifest.name));
                }}
              />
            ) : (
              <DefaultButton text={formatMessage('Back')} onClick={onBack} />
            )}
            <span>
              <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
              <PrimaryButton
                styles={{ root: { marginLeft: '8px' } }}
                text={formatMessage('Next')}
                onClick={() => {
                  if (page === 1) {
                    setShowOrchestratorDialog(true);
                  } else {
                    setPage(page + 1);
                    setTitle(selectIntentDialog.ADD_OR_EDIT_PHRASE(dialogId, manifest.name));
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
