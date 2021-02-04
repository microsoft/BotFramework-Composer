// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import formatMessage from 'format-message';
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';
import { RouteComponentProps } from '@reach/router';
import { useRecoilValue } from 'recoil';
import { LuFile, LuIntentSection } from '@bfc/shared';

import { EditableField } from '../../components/EditableField';
import { getExtension } from '../../utils/fileUtil';
import { languageListTemplates } from '../../components/MultiLanguage';
import { navigateTo } from '../../utils/navigation';
import { dispatcherState, luFilesState, localeState, settingsState, dialogsSelectorFamily } from '../../recoilModel';

import { formCell, luPhraseCell, tableCell, editableFieldContainer } from './styles';
interface TableViewProps extends RouteComponentProps<{ dialogId: string; skillId: string; projectId: string }> {
  projectId: string;
  skillId?: string;
  dialogId?: string;
  luFileId?: string;
}

interface Intent {
  name: string;
  phrases: string;
  fileId: string;
  dialogId: string;
  used: boolean;
  state: string;
}

const TableView: React.FC<TableViewProps> = (props) => {
  const { dialogId, projectId, skillId, luFileId } = props;

  const actualProjectId = skillId ?? projectId;
  const baseURL = skillId == null ? `/bot/${projectId}/` : `/bot/${projectId}/skill/${skillId}/`;

  const { updateLuIntent } = useRecoilValue(dispatcherState);

  const luFiles = useRecoilValue(luFilesState(actualProjectId));
  const locale = useRecoilValue(localeState(actualProjectId));
  const settings = useRecoilValue(settingsState(actualProjectId));
  const dialogs = useRecoilValue(dialogsSelectorFamily(actualProjectId));

  const { languages, defaultLanguage } = settings;

  const activeDialog = dialogs.find(({ id }) => id === dialogId);

  const file = luFileId
    ? luFiles.find(({ id }) => id === luFileId)
    : luFiles.find(({ id }) => id === `${dialogId}.${locale}`);

  const defaultLangFile = luFileId
    ? luFiles.find(({ id }) => id === luFileId)
    : luFiles.find(({ id }) => id === `${dialogId}.${defaultLanguage}`);

  const [intents, setIntents] = useState<Intent[]>([]);
  const listRef = useRef(null);

  const moreLabel = formatMessage('Open inline editor');

  function getIntentState(file: LuFile): string {
    if (!file.diagnostics) {
      return formatMessage('Error');
    } else if (!file.published) {
      return formatMessage('Not yet published');
    } else if (file.published) {
      return formatMessage('Published');
    } else {
      return formatMessage('Unknown State'); // It's a bug in most cases.
    }
  }

  useEffect(() => {
    if (isEmpty(luFiles)) return;

    const allIntents = luFiles
      .filter(({ id }: { id: string }) => getExtension(id) === locale)
      .reduce((result: Intent[], luFile: LuFile) => {
        const items: Intent[] = [];
        const luDialog = dialogs.find((dialog) => luFile.id === `${dialog.id}.${locale}`);
        get(luFile, 'intents', []).forEach(({ Name: name, Body: phrases }) => {
          const state = getIntentState(luFile);
          items.push({
            name,
            phrases,
            fileId: luFile.id,
            dialogId: luDialog?.id || '',
            used: luDialog?.referredLuIntents.some((lu) => lu.name === name) ?? false, // used by it's dialog or not
            state,
          });
        });
        return result.concat(items);
      }, []);

    if (!activeDialog) {
      setIntents(allIntents);
    } else if (luFileId && file) {
      const luIntents: Intent[] = [];
      get(file, 'intents', []).forEach(({ Name: name, Body: phrases }) => {
        const state = getIntentState(file);
        luIntents.push({
          name,
          phrases,
          fileId: file.id,
          dialogId: activeDialog?.id || '',
          used: activeDialog?.referredLuIntents.some((lu) => lu.name === name), // used by it's dialog or not
          state,
        });
      });
      setIntents(luIntents);
    } else {
      const dialogIntents = allIntents.filter((t) => t.dialogId === activeDialog.id);
      setIntents(dialogIntents);
    }
  }, [luFiles, activeDialog, actualProjectId, luFileId]);

  const handleIntentUpdate = useCallback(
    (fileId: string, intentName: string, intent: LuIntentSection) => {
      const payload = {
        id: fileId,
        intentName,
        intent,
        projectId: actualProjectId,
      };
      updateLuIntent(payload);
    },
    [actualProjectId]
  );

  const handleTemplateUpdateDefaultLocale = useCallback(
    (intentName: string, intent: LuIntentSection) => {
      if (defaultLangFile) {
        const payload = {
          id: defaultLangFile.id,
          intentName,
          intent,
          projectId: actualProjectId,
        };
        updateLuIntent(payload);
      }
    },
    [defaultLangFile, actualProjectId]
  );

  const getTemplatesMoreButtons = (item, index): IContextualMenuItem[] => {
    const buttons = [
      {
        key: 'edit',
        name: formatMessage('Edit'),
        onClick: () => {
          const { name, dialogId } = intents[index];
          navigateTo(`${baseURL}language-understanding/${dialogId}/edit?t=${encodeURIComponent(name)}`);
        },
      },
    ];
    return buttons;
  };

  const getTableColums = (): IColumn[] => {
    const languagesList = languageListTemplates(languages, locale, defaultLanguage);
    const defaultLangTeamplate = languagesList.find((item) => item.locale === defaultLanguage);
    const currentLangTeamplate = languagesList.find((item) => item.locale === locale);
    // eslint-disable-next-line format-message/literal-pattern
    const currentLangResponsesHeader = formatMessage(`Sample Phrases - ${currentLangTeamplate?.language}`);
    // eslint-disable-next-line format-message/literal-pattern
    const defaultLangResponsesHeader = formatMessage(`Sample Phrases - ${defaultLangTeamplate?.language} (default)`);

    let tableColums = [
      {
        key: 'name',
        name: formatMessage('Intent'),
        fieldName: 'name',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        data: 'string',
        onRender: (item: Intent) => {
          const displayName = `#${item.name}`;
          return (
            <div data-is-focusable css={formCell}>
              <EditableField
                multiline
                ariaLabel={formatMessage(`Name is {name}`, { name: displayName })}
                containerStyles={editableFieldContainer}
                depth={0}
                id={displayName}
                name={displayName}
                value={displayName}
                onBlur={(_id, value) => {
                  const newValue = value?.trim().replace(/^#/, '');
                  if (newValue === item.name) return;
                  if (newValue) {
                    handleIntentUpdate(item.fileId, item.name, { Name: newValue, Body: item.phrases });
                  }
                }}
                onChange={() => {}}
              />
            </div>
          );
        },
      },
      {
        key: 'phrases',
        name: formatMessage('Sample Phrases'),
        fieldName: 'phrases',
        minWidth: 500,
        isResizable: true,
        data: 'string',
        onRender: (item) => {
          const text = item.phrases;
          return (
            <div data-is-focusable css={luPhraseCell}>
              <EditableField
                multiline
                ariaLabel={formatMessage(`Sample Phrases are {phrases}`, { phrases: text })}
                containerStyles={editableFieldContainer}
                depth={0}
                id={text}
                name={text}
                value={text}
                onBlur={(_id, value) => {
                  if (value === text) return;
                  const newValue = value?.trim();
                  if (newValue) {
                    const fixedBody = newValue.startsWith('-') ? newValue : `- ${newValue}`;
                    handleIntentUpdate(item.fileId, item.name, { Name: item.name, Body: fixedBody });
                  }
                }}
                onChange={() => {}}
              />
            </div>
          );
        },
      },
      {
        key: 'phrases-lang',
        name: currentLangResponsesHeader,
        fieldName: 'phrases',
        minWidth: 300,
        maxWidth: 500,
        isResizable: true,
        data: 'string',
        onRender: (item) => {
          const text = item.phrases;
          return (
            <div data-is-focusable css={luPhraseCell}>
              <EditableField
                multiline
                ariaLabel={formatMessage(`Sample Phrases are {phrases}`, { phrases: text })}
                containerStyles={editableFieldContainer}
                depth={0}
                id={text}
                name={text}
                value={text}
                onBlur={(_id, value) => {
                  if (value === text) return;
                  const newValue = value?.trim().replace(/^#/, '');
                  if (newValue) {
                    const fixedBody = newValue.startsWith('-') ? newValue : `- ${newValue}`;
                    handleIntentUpdate(item.fileId, item.name, { Name: item.name, Body: fixedBody });
                  }
                }}
                onChange={() => {}}
              />
            </div>
          );
        },
      },
      {
        key: 'phrases-default-lang',
        name: defaultLangResponsesHeader,
        fieldName: 'phrases-default-lang',
        minWidth: 300,
        isResizable: true,
        data: 'string',
        onRender: (item) => {
          const text = item[`body-${defaultLanguage}`];
          return (
            <div data-is-focusable css={luPhraseCell}>
              <EditableField
                multiline
                ariaLabel={formatMessage(`Sample Phrases are {phrases}`, { phrases: text })}
                containerStyles={editableFieldContainer}
                depth={0}
                id={text}
                name={text}
                value={text}
                onBlur={(_id, value) => {
                  if (value === text) return;
                  const newValue = value?.trim().replace(/^#/, '');
                  if (newValue) {
                    const fixedBody = newValue.startsWith('-') ? newValue : `- ${newValue}`;
                    handleTemplateUpdateDefaultLocale(item.name, {
                      Name: item.name,
                      Body: fixedBody,
                    });
                  }
                }}
                onChange={() => {}}
              />
            </div>
          );
        },
      },
      {
        key: 'definedIn',
        name: formatMessage('Defined in:'),
        fieldName: 'definedIn',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        isCollapsable: true,
        data: 'string',
        onRender: (item) => {
          const id = item.dialogId;
          return (
            <div
              key={id}
              data-is-focusable
              aria-label={formatMessage(`link to where this LUIS intent is defined`)}
              onClick={() => navigateTo(`${baseURL}dialogs/${id}`)}
            >
              <Link>{id}</Link>
            </div>
          );
        },
      },
      // {
      //   key: 'beenUsed',
      //   name: formatMessage('Been used'),
      //   fieldName: 'beenUsed',
      //   minWidth: 100,
      //   maxWidth: 100,
      //   isResizable: true,
      //   isCollapsable: true,
      //   data: 'string',
      //   onRender: item => {
      //     return item.used ? (
      //       <FontIcon iconName="Accept" aria-label={formatMessage('Used')} className={iconClass} />
      //     ) : (
      //       <div />
      //     );
      //   },
      // },
      {
        key: 'buttons',
        name: '',
        minWidth: 50,
        maxWidth: 50,
        isResizable: false,
        fieldName: 'buttons',
        data: 'string',
        onRender: (item, index) => {
          return (
            <TooltipHost calloutProps={{ gapSpace: 10 }} content={moreLabel}>
              <IconButton
                ariaLabel={moreLabel}
                menuIconProps={{ iconName: 'MoreVertical' }}
                menuProps={{
                  shouldFocusOnMount: true,
                  items: getTemplatesMoreButtons(item, index),
                }}
                styles={{ menuIcon: { color: NeutralColors.black, fontSize: FontSizes.size16 } }}
              />
            </TooltipHost>
          );
        },
      },
      {
        key: 'Activity',
        name: formatMessage('Activity'),
        fieldName: 'Activity',
        minWidth: 100,
        maxWidth: 100,
        isResizable: true,
        isCollapsable: true,
        data: 'string',
        onRender: (item) => {
          return (
            <div data-is-focusable css={tableCell}>
              <div aria-label={formatMessage(`State is {state}`, { state: item.state })} tabIndex={-1}>
                {item.state}
              </div>
            </div>
          );
        },
      },
    ];

    // show compairable column when current lang is not default lang
    if (locale === defaultLanguage) {
      tableColums = tableColums.filter(({ key }) => ['phrases-default-lang', 'phrases-lang'].includes(key) === false);
    } else {
      tableColums = tableColums.filter(({ key }) => ['phrases'].includes(key) === false);
    }

    // all view, hide defineIn column
    if (!activeDialog) {
      tableColums = tableColums.filter(({ key }) => ['definedIn'].includes(key) === false);
    }

    return tableColums;
  };

  function onRenderDetailsHeader(props, defaultRender) {
    return (
      <div data-testid="tableHeader">
        <Sticky isScrollSynced stickyPosition={StickyPositionType.Header}>
          {defaultRender({
            ...props,
            onRenderColumnHeaderTooltip: (tooltipHostProps) => <TooltipHost {...tooltipHostProps} />,
          })}
        </Sticky>
      </div>
    );
  }

  const intentsToRender = useMemo(() => {
    if (locale !== defaultLanguage) {
      let defaultLangTeamplates;
      if (activeDialog) {
        defaultLangTeamplates = luFiles.find(({ id }) => id === `${dialogId}.${defaultLanguage}`)?.intents;
      } else {
        defaultLangTeamplates = luFiles
          .filter(({ id }) => getExtension(id) === defaultLanguage)
          .reduce((result: LuIntentSection[], luFile: LuFile) => {
            return result.concat(luFile.intents);
          }, []);
      }

      return intents.map((item) => {
        const itemInDefaultLang = defaultLangTeamplates?.find(({ Name }) => Name === item.name);
        return {
          ...item,
          [`body-${defaultLanguage}`]: itemInDefaultLang?.Body || '',
        };
      });
    }
    return intents;
  }, [intents]);

  return (
    <div className={'table-view'} data-testid={'table-view'}>
      <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
        <DetailsList
          className="table-view-list"
          columns={getTableColums()}
          componentRef={listRef}
          getKey={(item) => item.Name}
          items={intentsToRender}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          styles={{
            root: {
              overflowX: 'hidden',
              // hack for https://github.com/OfficeDev/office-ui-fabric-react/issues/8783
              selectors: {
                'div[role="row"]:hover': {
                  background: 'none',
                },
              },
            },
          }}
          onRenderDetailsHeader={onRenderDetailsHeader}
        />
      </ScrollablePane>
    </div>
  );
};

export default TableView;
