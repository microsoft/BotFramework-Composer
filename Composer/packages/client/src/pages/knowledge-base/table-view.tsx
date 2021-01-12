// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import React, { useEffect, useState, useCallback, Fragment, useRef } from 'react';
import {
  DetailsList,
  DetailsRow,
  DetailsListLayoutMode,
  SelectionMode,
  CheckboxVisibility,
  IDetailsGroupRenderProps,
  IGroup,
  IDetailsList,
} from 'office-ui-fabric-react/lib/DetailsList';
import { GroupHeader, CollapseAllVisibility } from 'office-ui-fabric-react/lib/GroupedList';
import { IOverflowSetItemProps, OverflowSet } from 'office-ui-fabric-react/lib/OverflowSet';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { IconButton, ActionButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import formatMessage from 'format-message';
import { RouteComponentProps } from '@reach/router';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import flatMap from 'lodash/flatMap';
import { QnASection, QnAFile } from '@bfc/shared';
import { qnaUtil } from '@bfc/indexers';
import { NeutralColors } from '@uifabric/fluent-theme';

import emptyQnAIcon from '../../images/emptyQnAIcon.svg';
import { navigateTo } from '../../utils/navigation';
import { dialogsSelectorFamily, qnaFilesState, localeState } from '../../recoilModel';
import { dispatcherState } from '../../recoilModel';
import { getBaseName } from '../../utils/fileUtil';
import { EditableField } from '../../components/EditableField';
import { EditQnAModal } from '../../components/QnA/EditQnAFrom';
import { getQnAFileUrlOption } from '../../utils/qnaUtil';
import TelemetryClient from '../../telemetry/TelemetryClient';

import {
  formCell,
  addQnAPair,
  divider,
  rowDetails,
  icon,
  addAlternative,
  editableField,
  groupHeader,
  groupNameStyle,
  detailsHeaderStyle,
  classNames,
} from './styles';

interface QnASectionItem extends QnASection {
  fileId: string;
  dialogId: string | undefined;
  used: boolean;
  usedIn: { id: string; displayName: string }[];
  sectionId: string;
}

const createQnASectionItem = (fileId: string): QnASectionItem => {
  return {
    fileId,
    dialogId: '',
    used: false,
    usedIn: [],
    sectionId: '',
    Questions: [],
    Answer: '',
    Body: qnaUtil.generateQnAPair(),
  };
};

interface TableViewProps extends RouteComponentProps<{ dialogId: string; skillId: string; projectId: string }> {
  projectId: string;
  dialogId: string;
  skillId?: string;
  qnaFileId?: string;
}

const TableView: React.FC<TableViewProps> = (props) => {
  const { dialogId, projectId, skillId, qnaFileId } = props;

  const actualProjectId = skillId ?? projectId;
  const baseURL = skillId == null ? `/bot/${projectId}/` : `/bot/${projectId}/skill/${skillId}/`;

  const actions = useRecoilValue(dispatcherState);
  const dialogs = useRecoilValue(dialogsSelectorFamily(actualProjectId));
  const qnaFiles = useRecoilValue(qnaFilesState(actualProjectId));
  const locale = useRecoilValue(localeState(actualProjectId));
  const {
    removeQnAImport,
    removeQnAFile,
    createQnAPairs,
    removeQnAPairs,
    createQnAQuestion,
    updateQnAAnswer,
    updateQnAQuestion,
  } = useRecoilValue(dispatcherState);

  const targetFileId = dialogId.endsWith('.source') ? dialogId : `${dialogId}.${locale}`;
  const qnaFile = qnaFileId
    ? qnaFiles.find(({ id }) => id === qnaFileId)
    : qnaFiles.find(({ id }) => id === targetFileId);

  const generateQnASections = (file: QnAFile): QnASectionItem[] => {
    if (!file) return [];
    const usedInDialog: any[] = [];
    dialogs.forEach((dialog) => {
      const dialogQnAFile =
        qnaFiles.find(({ id }) => id === dialog.qnaFile) ||
        qnaFiles.find(({ id }) => id === `${dialog.qnaFile}.${locale}`);
      if (dialogQnAFile) {
        dialogQnAFile.imports.forEach(({ id }) => {
          if (id === `${file.id}.qna`) {
            usedInDialog.push({ id: dialog.id, displayName: dialog.displayName });
          }
        });
      }
    });

    return file.qnaSections.map((qnaSection) => {
      const qnaDialog = dialogs.find((dialog) => file.id === `${dialog.id}.${locale}`);
      return {
        fileId: file.id,
        dialogId: qnaDialog?.id,
        used: !!qnaDialog,
        usedIn: usedInDialog,
        key: qnaSection.sectionId,
        ...qnaSection,
      };
    });
  };

  const detailListRef = useRef<IDetailsList | null>(null);
  const [editQnAFile, setEditQnAFile] = useState<QnAFile | undefined>(undefined);
  const [expandedIndex, setExpandedIndex] = useState(-1);
  const [kthSectionIsCreatingQuestion, setCreatingQuestionInKthSection] = useState<string>('');
  const [creatQnAPairSettings, setCreatQnAPairSettings] = useState<{
    groupKey: string;
    sectionIndex: number;
    item?: { Qustion: string; Answer: string };
  }>({
    groupKey: '-1',
    sectionIndex: -1,
  });
  const currentDialogImportedFileIds = qnaFile?.imports.map(({ id }) => getBaseName(id)) || [];
  const currentDialogImportedFiles = qnaFiles.filter(({ id }) => currentDialogImportedFileIds.includes(id));
  const currentDialogImportedSourceFiles = currentDialogImportedFiles.filter(({ id }) => id.endsWith('.source'));
  const allSourceFiles = qnaFiles.filter(({ id }) => id.endsWith('.source'));

  const initializeQnASections = (qnaFiles: QnAFile[], dialogId: string) => {
    if (isEmpty(qnaFiles)) return [];

    const allSections = flatMap(
      qnaFiles.filter(({ id }) => id.endsWith('.source')),
      generateQnASections
    );
    if (dialogId === 'all') {
      return allSections;
    } else {
      const dialogSections = allSections.filter((t: QnASectionItem) => currentDialogImportedFileIds.includes(t.fileId));
      return dialogSections;
    }
  };

  const [qnaSections, setQnASections] = useState<QnASectionItem[]>(initializeQnASections(qnaFiles, dialogId));

  useEffect(() => {
    if (isEmpty(qnaFiles)) return;

    const allSections = flatMap(
      qnaFiles.filter(({ id }) => id.endsWith('.source')),
      generateQnASections
    );
    if (dialogId === 'all') {
      setQnASections(allSections);
    } else {
      const dialogSections = allSections.filter((t) => currentDialogImportedFileIds.includes(t.fileId));

      setQnASections(dialogSections);
    }
  }, [qnaFiles, dialogId, actualProjectId]);

  const onUpdateQnAQuestion = (fileId: string, sectionId: string, questionId: string, content: string) => {
    if (!fileId) return;
    actions.setMessage('item updated');
    updateQnAQuestion({
      id: fileId,
      sectionId,
      questionId,
      content,
      projectId: actualProjectId,
    });
  };

  const onUpdateQnAAnswer = (fileId: string, sectionId: string, content: string) => {
    if (!fileId) return;
    actions.setMessage('item updated');
    updateQnAAnswer({
      id: fileId,
      sectionId,
      content,
      projectId: actualProjectId,
    });
  };

  const onRemoveQnAPairs = (fileId: string, sectionId: string) => {
    if (!fileId) return;
    actions.setMessage('item deleted');
    const sectionIndex = qnaSections.findIndex((item) => item.fileId === fileId);
    removeQnAPairs({
      id: fileId,
      sectionId,
      projectId: actualProjectId,
    });
    // update expand status
    if (expandedIndex) {
      if (sectionIndex < expandedIndex) {
        setExpandedIndex(expandedIndex - 1);
      } else if (sectionIndex === expandedIndex) {
        setExpandedIndex(-1);
      }
    }
  };

  const onCreateNewQnAPairsEnd = (fileId, updatedItem) => {
    const { Question, Answer } = updatedItem;
    if (!Question || !Answer) return;
    const createdQnAPair = qnaUtil.generateQnAPair(Question, Answer);
    setCreatQnAPairSettings({ groupKey: '', sectionIndex: -1 });
    createQnAPairs({ id: fileId, content: createdQnAPair, projectId: actualProjectId });
  };

  const onCreateNewQnAPairsStart = (fileId: string | undefined) => {
    if (!fileId) return;
    const groupStartIndex = qnaSections.findIndex((item) => item.fileId === fileId);
    // create on empty KB.
    let insertPosition = groupStartIndex;
    if (groupStartIndex === -1) {
      insertPosition = 0;
    }
    const newGroups = getGroups(fileId);
    setGroups(newGroups);
    const newItem = createQnASectionItem(fileId);
    const newQnaSections = [...qnaSections];
    newQnaSections.splice(insertPosition, 0, newItem);
    setQnASections(newQnaSections);
    setExpandedIndex(insertPosition);
    setCreatQnAPairSettings({ groupKey: fileId, sectionIndex: insertPosition, item: { Answer: '', Qustion: '' } });
  };

  const onCreateNewQuestion = (fileId, sectionId, content?: string) => {
    if (!fileId || !sectionId) return;
    const payload = {
      id: fileId,
      sectionId,
      content: content || 'Add new question',
      projectId: actualProjectId,
    };
    createQnAQuestion(payload);
  };

  const onSubmitEditKB = async ({ name }: { name: string }) => {
    if (!editQnAFile) return;
    const newId = `${name}.source`;
    await actions.renameQnAKB({ id: editQnAFile.id, name: newId, projectId: actualProjectId });
    if (!qnaFile) return;
    await actions.updateQnAImport({
      id: qnaFile.id,
      sourceId: editQnAFile.id,
      newSourceId: newId,
      projectId: actualProjectId,
    });
    setEditQnAFile(undefined);
  };

  const onRenderGroupHeader: IDetailsGroupRenderProps['onRenderHeader'] = useCallback(
    (props) => {
      const groupName = props?.group?.name || '';
      const containerId = props?.group?.key || '';
      const containerQnAFile = qnaFiles.find(({ id }) => id === containerId);
      const isImportedSource = containerId.endsWith('.source');
      const sourceUrl = isImportedSource && containerQnAFile && getQnAFileUrlOption(containerQnAFile);
      const isAllTab = dialogId === 'all';
      const isCreatingQnA = creatQnAPairSettings.groupKey === containerId && creatQnAPairSettings.sectionIndex > -1;
      const onRenderItem = (item: IOverflowSetItemProps): JSX.Element => {
        return (
          <IconButton
            menuIconProps={{ iconName: 'Edit' }}
            styles={{
              root: {
                color: NeutralColors.black,
                visibility: isAllTab ? 'hidden' : 'visiable',
              },
            }}
            onClick={item.onClick}
          />
        );
      };

      const onRenderOverflowButton = (overflowItems?: IContextualMenuItem[]): JSX.Element => {
        return (
          <IconButton
            hidden
            menuIconProps={{ iconName: 'More' }}
            menuProps={{ items: overflowItems || [] }}
            role="menuitem"
            styles={{
              root: {
                padding: 0,
                color: NeutralColors.black,
                visibility: isAllTab ? 'hidden' : 'visiable',
              },
            }}
            title="More options"
          />
        );
      };

      const onRenderTitle = () => {
        return (
          <div className={classNames.groupHeader}>
            {isImportedSource && (
              <Fragment>
                {sourceUrl && (
                  <Fragment>
                    <Link css={groupNameStyle} href={sourceUrl} target={'_blank'}>
                      {groupName}
                    </Link>
                  </Fragment>
                )}
                {!sourceUrl && <div css={groupNameStyle}>{groupName}</div>}

                <OverflowSet
                  aria-label={formatMessage('Edit source')}
                  items={[
                    {
                      key: 'edit',
                      name: 'edit',
                      onClick: () => {
                        setEditQnAFile(containerQnAFile);
                      },
                    },
                  ]}
                  overflowItems={
                    [
                      {
                        key: 'edit',
                        name: formatMessage('Show code'),
                        iconProps: { iconName: 'CodeEdit' },
                        onClick: () => {
                          navigateTo(`${baseURL}knowledge-base/${dialogId}/edit?C=${containerId}`);
                          TelemetryClient.track('EditModeToggled', { jsonView: true });
                        },
                      },
                      {
                        key: 'delete',
                        iconProps: { iconName: 'Delete' },
                        name: formatMessage('Delete knowledge base'),
                        disabled: dialogId === 'all',
                        onClick: async () => {
                          if (!qnaFile) return;
                          await removeQnAImport({ id: qnaFile.id, sourceId: containerId, projectId: actualProjectId });
                          await removeQnAFile({ id: containerId, projectId: actualProjectId });
                        },
                      },
                    ] as IOverflowSetItemProps[]
                  }
                  role="menubar"
                  onRenderItem={onRenderItem}
                  onRenderOverflowButton={onRenderOverflowButton}
                />
              </Fragment>
            )}
            {!isImportedSource && <div>{groupName}</div>}
          </div>
        );
      };
      if (props) {
        return (
          <Fragment>
            <GroupHeader
              {...props}
              selectionMode={SelectionMode.none}
              styles={groupHeader}
              onRenderTitle={onRenderTitle}
            />
            {!isCreatingQnA && (
              <ActionButton
                data-testid={'addQnAPairButton'}
                styles={addQnAPair}
                onClick={() => {
                  onCreateNewQnAPairsStart(props.group?.key);
                  actions.setMessage('item added');
                  TelemetryClient.track('NewQnAPair');
                }}
              >
                {formatMessage('+ Add QnA Pair')}
              </ActionButton>
            )}

            <div css={divider}> </div>
          </Fragment>
        );
      }

      return null;
    },
    [dialogId, qnaSections]
  );

  const getTableColums = () => {
    const tableColums = [
      {
        key: 'ToggleShowAll',
        name: '',
        fieldName: 'ToggleShowAll',
        minWidth: 30,
        maxWidth: 30,
        isResizable: true,
        onRender: (item, index) => {
          return (
            <IconButton
              ariaLabel="ChevronDown"
              iconProps={{ iconName: expandedIndex === index ? 'ChevronDown' : 'ChevronRight' }}
              styles={{
                root: { ...icon.root, marginTop: 2, marginLeft: 7, fontSize: 12 },
                icon: { fontSize: 8, color: NeutralColors.black },
              }}
              title={formatMessage('Toggle show all')}
              onClick={() => setExpandedIndex(expandedIndex === index ? -1 : index)}
            />
          );
        },
      },
      {
        key: 'Question',
        name: formatMessage('Question'),
        fieldName: 'question',
        minWidth: 250,
        maxWidth: 450,
        isResizable: true,
        data: 'string',
        onRender: (item: QnASectionItem, index) => {
          const isExpanded = expandedIndex === index;
          const questions = isExpanded ? item.Questions : item.Questions.slice(0, 1);
          const isSourceSectionInDialog = item.fileId.endsWith('.source') && !dialogId.endsWith('.source');
          const isAllowEdit = dialogId !== 'all' && !isSourceSectionInDialog;
          const isCreatingQnA =
            item.fileId === creatQnAPairSettings.groupKey && index === creatQnAPairSettings.sectionIndex;

          const addQuestionButton = (
            <ActionButton
              styles={addAlternative}
              onClick={() => {
                setCreatingQuestionInKthSection(item.sectionId);
                TelemetryClient.track('AlternateQnAPhraseAdded');
              }}
            >
              {formatMessage('+ Add alternative phrasing')}
            </ActionButton>
          );

          return (
            <div data-is-focusable css={formCell}>
              {questions.map((question, qIndex: number) => {
                const isQuestionEmpty = question.content === '';
                const isOnlyQuestion = questions.length === 1 && qIndex === 0;
                return (
                  <div key={question.id}>
                    <EditableField
                      key={question.id}
                      ariaLabel={formatMessage(`Question is {content}`, { content: question.content })}
                      depth={0}
                      disabled={isAllowEdit}
                      enableIcon={isExpanded}
                      extraContent={
                        qIndex === 0 && !isExpanded && !isQuestionEmpty ? ` (${item.Questions.length})` : ''
                      }
                      iconProps={{
                        iconName: 'Cancel',
                      }}
                      id={question.id}
                      name={question.content}
                      placeholder={formatMessage('Add new question')}
                      required={isOnlyQuestion}
                      requiredMessage={formatMessage('At least one question is required')}
                      resizable={false}
                      styles={editableField}
                      value={question.content}
                      onBlur={(_id, value = '') => {
                        const newValue = value?.trim();
                        const isChanged = question.content !== newValue;
                        if ((!newValue && isOnlyQuestion) || !isChanged) return;

                        if (isCreatingQnA) {
                          const creatingQnAItem = creatQnAPairSettings.item;
                          const fileId = creatQnAPairSettings.groupKey;
                          if (!creatingQnAItem) return;
                          const updatedItem = {
                            ...creatingQnAItem,
                            Question: newValue,
                          };
                          setCreatQnAPairSettings({
                            ...creatQnAPairSettings,
                            item: updatedItem,
                          });
                          onCreateNewQnAPairsEnd(fileId, updatedItem);
                        } else {
                          onUpdateQnAQuestion(item.fileId, item.sectionId, question.id, newValue);
                        }
                      }}
                      onChange={() => {}}
                      onFocus={() => setExpandedIndex(index)}
                    />
                  </div>
                );
              })}

              {kthSectionIsCreatingQuestion === item.sectionId ? (
                <EditableField
                  key={''}
                  componentFocusOnMount
                  required
                  ariaLabel={formatMessage('Question is empty now')}
                  depth={0}
                  disabled={isAllowEdit}
                  id={'NewQuestion'}
                  name={'New Question'}
                  placeholder={formatMessage('Add new question')}
                  styles={editableField}
                  value={''}
                  onBlur={(_id, value) => {
                    const newValue = value?.trim();
                    if (!newValue) {
                      setCreatingQuestionInKthSection('');
                      return;
                    }

                    if (isCreatingQnA) {
                      const creatingQnAItem = creatQnAPairSettings.item;
                      const fileId = creatQnAPairSettings.groupKey;
                      if (!creatingQnAItem) return;
                      const updatedItem = {
                        ...creatingQnAItem,
                        Question: newValue,
                      };
                      setCreatQnAPairSettings({
                        ...creatQnAPairSettings,
                        item: updatedItem,
                      });
                      onCreateNewQnAPairsEnd(fileId, updatedItem);
                    } else {
                      onCreateNewQuestion(item.fileId, item.sectionId, newValue);
                    }

                    setCreatingQuestionInKthSection('');
                  }}
                  onChange={() => {}}
                  onFocus={() => setExpandedIndex(index)}
                />
              ) : (
                addQuestionButton
              )}
            </div>
          );
        },
      },
      {
        key: 'Answer',
        name: formatMessage('Answer'),
        fieldName: 'answer',
        minWidth: 350,
        isResizable: true,
        data: 'string',
        onRender: (item, index) => {
          const isSourceSectionInDialog = item.fileId.endsWith('.source') && !dialogId.endsWith('.source');
          const isAllowEdit = dialogId !== 'all' && !isSourceSectionInDialog;
          const isExpanded = expandedIndex === index;
          const isCreatingQnA =
            item.fileId === creatQnAPairSettings.groupKey && index === creatQnAPairSettings.sectionIndex;

          return (
            <div data-is-focusable css={formCell}>
              <EditableField
                required
                ariaLabel={formatMessage(`Answer is {content}`, { content: item.Answer })}
                depth={0}
                disabled={isAllowEdit}
                enableIcon={isExpanded}
                expanded={isExpanded}
                iconProps={{
                  iconName: 'Cancel',
                }}
                id={item.sectionId}
                name={item.Answer}
                placeholder={formatMessage('Add new answer')}
                requiredMessage={formatMessage('Answer is required')}
                resizable={false}
                styles={editableField}
                value={item.Answer}
                onBlur={(_id, value) => {
                  const newValue = value?.trim();
                  const isChanged = item.Answer !== newValue;
                  if (!newValue || !isChanged) return;

                  if (isCreatingQnA) {
                    const creatingQnAItem = creatQnAPairSettings.item;
                    const fileId = creatQnAPairSettings.groupKey;
                    if (!creatingQnAItem) return;
                    const updatedItem = {
                      ...creatingQnAItem,
                      Answer: newValue,
                    };
                    setCreatQnAPairSettings({
                      ...creatQnAPairSettings,
                      item: updatedItem,
                    });
                    onCreateNewQnAPairsEnd(fileId, updatedItem);
                  } else {
                    onUpdateQnAAnswer(item.fileId, item.sectionId, newValue);
                  }
                }}
                onChange={() => {}}
                onFocus={() => setExpandedIndex(index)}
              />
            </div>
          );
        },
      },
      {
        key: 'UsedIn',
        name: formatMessage('Used In'),
        fieldName: 'UsedIn',
        minWidth: 150,
        maxWidth: 200,
        isResizable: true,
        data: 'string',
        onRender: (item) => {
          return (
            <div data-is-focusable css={formCell} style={{ marginTop: 10, marginLeft: 13 }}>
              {item.usedIn.map(({ id, displayName }) => {
                return (
                  <Link
                    key={id}
                    onClick={() => {
                      navigateTo(`${baseURL}knowledge-base/${id}`);
                    }}
                  >
                    {displayName}
                  </Link>
                );
              })}
            </div>
          );
        },
      },
      {
        key: 'buttons',
        name: '',
        minWidth: 50,
        maxWidth: 50,
        isResizable: true,
        fieldName: 'buttons',
        data: 'string',
        onRender: (item) => {
          return (
            <IconButton
              ariaLabel="Delete"
              iconProps={{ iconName: 'Delete' }}
              styles={{ root: { ...icon.root, marginTop: '4px' } }}
              title="Delete"
              onClick={() => {
                onRemoveQnAPairs(item.fileId, item.sectionId);
              }}
            />
          );
        },
      },
    ];
    if (dialogId !== 'all') {
      tableColums.splice(3, 1);
    }

    return tableColums;
  };

  const [groups, setGroups] = useState<IGroup[] | undefined>(undefined);
  const getGroups = (createOnGroupId = ''): IGroup[] | undefined => {
    let containerFiles = currentDialogImportedSourceFiles;
    if (dialogId === 'all') {
      containerFiles = allSourceFiles;
    } else {
      if (!qnaFile) return undefined;
    }

    const newGroups: IGroup[] = [];
    containerFiles.forEach((currentFile) => {
      const lastGroup = newGroups[newGroups.length - 1];
      const startIndex = lastGroup ? lastGroup.startIndex + lastGroup.count : 0;
      const { id } = currentFile;
      let count = currentFile.qnaSections.length;
      // create on file, insert a place-holder section.
      if (createOnGroupId === id) {
        count += 1;
      }
      const name = getBaseName(id);

      // restore last group collapse state
      const prevGroup = groups?.find(({ key }) => key === id);
      const newGroup = prevGroup || { isCollapsed: false };
      newGroups.push({
        ...newGroup,
        key: id,
        name,
        startIndex,
        count,
        level: 0,
      });
    });
    return newGroups;
  };
  useEffect(() => {
    const newGroups = getGroups();
    const isChanged = !isEqual(groups, newGroups);
    if (isChanged) setGroups(newGroups);
  }, [dialogId, qnaFiles]);

  useEffect(() => {
    if (groups) {
      const newGroup = [...groups];
      const toExpandGroup = groups.find((g) => g.key === creatQnAPairSettings.groupKey);
      if (toExpandGroup) {
        toExpandGroup.isCollapsed = false;
        setGroups(newGroup);
      }
    }
  }, [creatQnAPairSettings]);

  const onRenderDetailsHeader = useCallback(
    (props, defaultRender) => {
      return (
        <div css={detailsHeaderStyle} data-testid="tableHeader">
          <Sticky isScrollSynced stickyPosition={StickyPositionType.Header}>
            {defaultRender({
              ...props,
              isCollapsable: false,
              onRenderColumnHeaderTooltip: (tooltipHostProps) => <TooltipHost {...tooltipHostProps} />,
            })}
          </Sticky>
        </div>
      );
    },
    [dialogId]
  );

  const onRenderRow = useCallback(
    (props) => {
      if (props) {
        return (
          <DetailsRow
            {...props}
            className={expandedIndex === props.itemIndex ? 'expanded' : ''}
            styles={rowDetails}
            tabIndex={props.itemIndex}
          />
        );
      }
      return null;
    },
    [dialogId, expandedIndex]
  );

  if (qnaFile?.empty) {
    return (
      <div className={classNames.emptyTableList} data-testid={'table-view-empty'}>
        <div className={classNames.emptyTableListCenter}>
          <img
            alt={formatMessage('Empty QnA Icon')}
            aria-label={formatMessage('Empty QnA Icon')}
            src={emptyQnAIcon}
            style={{ marginLeft: '9px' }}
          />
          <p>{formatMessage('Create a knowledge base from scratch or import knowledge from a URL or PDF files')}</p>
          <PrimaryButton
            data-testid={'createKnowledgeBase'}
            text={formatMessage('Create new KB')}
            onClick={() => {
              actions.createQnAFromUrlDialogBegin({ projectId: actualProjectId, dialogId });
              TelemetryClient.track('AddNewKnowledgeBaseStarted');
            }}
          />
        </div>
      </div>
    );
  }
  return (
    <div data-testid={'table-view'}>
      <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
        <DetailsList
          checkboxVisibility={CheckboxVisibility.hidden}
          columns={getTableColums()}
          componentRef={detailListRef}
          groupProps={{
            onRenderHeader: onRenderGroupHeader,
            collapseAllVisibility: CollapseAllVisibility.hidden,
            showEmptyGroups: true,
          }}
          groups={groups}
          items={qnaSections}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.single}
          onRenderDetailsHeader={onRenderDetailsHeader}
          onRenderRow={onRenderRow}
        />
      </ScrollablePane>
      {editQnAFile && (
        <EditQnAModal
          qnaFile={editQnAFile}
          qnaFiles={qnaFiles}
          onDismiss={() => {
            setEditQnAFile(undefined);
          }}
          onSubmit={onSubmitEditKB}
        ></EditQnAModal>
      )}
    </div>
  );
};

export default TableView;
