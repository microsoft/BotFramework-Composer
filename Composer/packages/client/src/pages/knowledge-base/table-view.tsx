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
import { Link } from 'office-ui-fabric-react/lib/Link';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { IconButton, ActionButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import formatMessage from 'format-message';
import { RouteComponentProps } from '@reach/router';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import { QnASection, QnAFile } from '@bfc/shared';
import { qnaUtil } from '@bfc/indexers';
import { NeutralColors } from '@uifabric/fluent-theme';

import emptyQnAIcon from '../../images/emptyQnAIcon.svg';
import { navigateTo } from '../../utils/navigation';
import { dialogsState, qnaFilesState, localeState } from '../../recoilModel/atoms/botState';
import { dispatcherState } from '../../recoilModel';
import { getBaseName } from '../../utils/fileUtil';
import { EditableField } from '../../components/EditableField';
import { EditQnAModal } from '../../components/QnA/EditQnAFrom';
import { getQnAFileUrlOption } from '../../utils/qnaUtil';

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
}

interface TableViewProps extends RouteComponentProps<{}> {
  dialogId: string;
  projectId: string;
}

const TableView: React.FC<TableViewProps> = (props) => {
  const { dialogId = '', projectId = '' } = props;
  const actions = useRecoilValue(dispatcherState);
  const dialogs = useRecoilValue(dialogsState(projectId));
  const qnaFiles = useRecoilValue(qnaFilesState(projectId));
  const locale = useRecoilValue(localeState(projectId));
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
  const qnaFile = qnaFiles.find(({ id }) => id === targetFileId);
  const limitedNumber = 1;
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
  const [kthSectionIsCreatingQuestion, setCreatingQuestionInKthSection] = useState<number>(-1);
  const currentDialogImportedFileIds = qnaFile?.imports.map(({ id }) => getBaseName(id)) || [];
  const currentDialogImportedFiles = qnaFiles.filter(({ id }) => currentDialogImportedFileIds.includes(id));
  const currentDialogImportedSourceFiles = currentDialogImportedFiles.filter(({ id }) => id.endsWith('.source'));
  const allSourceFiles = qnaFiles.filter(({ id }) => id.endsWith('.source'));
  const [isQnASectionsExpanded, setIsQnASectionsExpanded] = useState<boolean[]>([]);
  const [creatQnAPairSettings, setCreatQnAPairSettings] = useState<{
    groupKey: string;
    sectionIndex: number;
  }>({
    groupKey: '',
    sectionIndex: -1,
  });
  const initializeQnASections = (qnaFiles, dialogId) => {
    if (isEmpty(qnaFiles)) return;

    const allSections = qnaFiles
      .filter(({ id }) => id.endsWith('.source'))
      .reduce((result: any[], qnaFile) => {
        const res = generateQnASections(qnaFile);
        return result.concat(res);
      }, []);
    if (dialogId === 'all') {
      return allSections;
    } else {
      const dialogSections = allSections.filter((t) => currentDialogImportedFileIds.includes(t.fileId));
      return dialogSections;
    }
  };

  const [qnaSections, setQnASections] = useState<QnASectionItem[]>(initializeQnASections(qnaFiles, dialogId));

  useEffect(() => {
    if (isEmpty(qnaFiles)) return;
    const allSections = qnaFiles.reduce((result: any[], qnaFile) => {
      const res = generateQnASections(qnaFile);
      return result.concat(res);
    }, []);
    if (dialogId === 'all') {
      setIsQnASectionsExpanded(Array(allSections.length).fill(false));
    } else {
      const dialogSections = allSections.filter(
        (t) => t.dialogId === dialogId || currentDialogImportedFileIds.includes(t.fileId)
      );
      setIsQnASectionsExpanded(Array(dialogSections.length).fill(false));
    }
  }, [dialogId, projectId]);

  useEffect(() => {
    if (isEmpty(qnaFiles)) return;

    const allSections = qnaFiles
      .filter(({ id }) => id.endsWith('.source'))
      .reduce((result: any[], qnaFile) => {
        const res = generateQnASections(qnaFile);
        return result.concat(res);
      }, []);
    if (dialogId === 'all') {
      setQnASections(allSections);
    } else {
      const dialogSections = allSections.filter((t) => currentDialogImportedFileIds.includes(t.fileId));

      setQnASections(dialogSections);
    }
  }, [qnaFiles, dialogId, projectId]);

  const toggleExpandRow = (index) => {
    const newArray = [...isQnASectionsExpanded];
    newArray[index] = !newArray[index];
    setIsQnASectionsExpanded(newArray);
  };

  const expandRow = (index) => {
    const expandedRow = new Array(isQnASectionsExpanded.length).fill(false);
    expandedRow[index] = true;
    setIsQnASectionsExpanded(expandedRow);
  };

  const onUpdateQnAQuestion = (fileId: string, sectionId: string, questionId: string, content: string) => {
    if (!fileId) return;
    actions.setMessage('item deleted');
    updateQnAQuestion({
      id: fileId,
      sectionId,
      questionId,
      content,
      projectId,
    });
  };

  const onUpdateQnAAnswer = (fileId: string, sectionId: string, content: string) => {
    if (!fileId) return;
    actions.setMessage('item deleted');
    updateQnAAnswer({
      id: fileId,
      sectionId,
      content,
      projectId,
    });
  };

  const onRemoveQnAPairs = (fileId: string, sectionId: string) => {
    if (!fileId) return;
    actions.setMessage('item deleted');
    const sectionIndex = qnaSections.findIndex((item) => item.fileId === fileId);
    removeQnAPairs({
      id: fileId,
      sectionId,
      projectId,
    });
    const newArray = [...isQnASectionsExpanded];
    newArray.splice(sectionIndex, 1);
    setIsQnASectionsExpanded(newArray);
  };

  const onCreateNewQnAPairs = (fileId: string | undefined) => {
    if (!fileId) return;
    const newQnAPair = qnaUtil.generateQnAPair();
    const sectionIndex = qnaSections.findIndex((item) => item.fileId === fileId);
    createQnAPairs({ id: fileId, content: newQnAPair, projectId });
    setCreatQnAPairSettings({ groupKey: fileId, sectionIndex });
    const newArray = [...isQnASectionsExpanded];
    newArray.splice(sectionIndex, 0, false);
    setIsQnASectionsExpanded(newArray);
  };

  const onCreateNewQuestion = (fileId, sectionId, content?: string) => {
    if (!fileId || !sectionId) return;
    const payload = {
      id: fileId,
      sectionId,
      content: content || 'Add new question',
      projectId,
    };
    createQnAQuestion(payload);
  };

  const onSubmitEditKB = async ({ name }: { name: string }) => {
    if (!editQnAFile) return;
    const newId = `${name}.source`;
    await actions.renameQnAKB({ id: editQnAFile.id, name: newId, projectId });
    if (!qnaFile) return;
    await actions.removeQnAImport({ id: qnaFile.id, sourceId: editQnAFile.id, projectId });
    await actions.createQnAImport({ id: qnaFile.id, sourceId: newId, projectId });
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

      const onRenderOverflowButton = (overflowItems: any[] | undefined): JSX.Element => {
        return (
          <IconButton
            hidden
            menuIconProps={{ iconName: 'More' }}
            menuProps={{ items: overflowItems || [] }}
            role="menuitem"
            styles={{
              root: {
                //marginTop: 3,
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
                          navigateTo(`/bot/${projectId}/knowledge-base/${dialogId}/edit?C=${containerId}`);
                        },
                      },
                      {
                        key: 'delete',
                        iconProps: { iconName: 'Delete' },
                        name: formatMessage('Delete knowledge base'),
                        disabled: dialogId === 'all',
                        onClick: async () => {
                          if (!qnaFile) return;
                          await removeQnAImport({ id: qnaFile.id, sourceId: containerId, projectId });
                          await removeQnAFile({ id: containerId, projectId });
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
            <ActionButton
              data-testid={'addQnAPairButton'}
              //iconProps={{ iconName: 'Add', styles: addIcon }}
              styles={addQnAPair}
              onClick={() => {
                onCreateNewQnAPairs(props.group?.key);
                actions.setMessage('item added');
              }}
            >
              {formatMessage('+ Add QnA Pair')}
            </ActionButton>

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
        fieldName: 'Chevron',
        minWidth: 30,
        maxWidth: 30,
        isResizable: true,
        onRender: (item, index) => {
          return (
            <IconButton
              ariaLabel="ChevronDown"
              iconProps={{ iconName: isQnASectionsExpanded[index] ? 'ChevronDown' : 'ChevronRight' }}
              styles={{
                root: { ...icon.root, marginTop: 2, marginLeft: 7, fontSize: 12 },
                icon: { fontSize: 13, color: NeutralColors.black },
              }}
              title="ChevronDown"
              onClick={() => toggleExpandRow(index)}
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
          const questions = item.Questions;
          const showingQuestions = isQnASectionsExpanded[index] ? questions : questions.slice(0, limitedNumber);
          //This question content of this qna Section is '#?'
          const isQuestionEmpty = showingQuestions.length === 1 && showingQuestions[0].content === '';
          const isSourceSectionInDialog = item.fileId.endsWith('.source') && !dialogId.endsWith('.source');
          const isAllowEdit = dialogId !== 'all' && !isSourceSectionInDialog;

          const addQuestionButton = (
            <ActionButton
              //iconProps={{ iconName: 'Add', styles: addIcon }}
              styles={addAlternative}
              onClick={(e) => setCreatingQuestionInKthSection(index)}
            >
              {formatMessage('+ Add alternative phrasing')}
            </ActionButton>
          );

          return (
            <div data-is-focusable css={formCell}>
              {showingQuestions.map((question, qIndex: number) => {
                const shouldFocusOnMount =
                  item.fileId === creatQnAPairSettings.groupKey &&
                  index === creatQnAPairSettings.sectionIndex &&
                  qIndex === 0;
                const isExpanded = isQnASectionsExpanded[index];
                return (
                  <EditableField
                    key={question.id}
                    enableIcon
                    required
                    ariaLabel={formatMessage(`Question is {content}`, { content: question.content })}
                    componentFocusOnmount={shouldFocusOnMount}
                    depth={0}
                    disabled={isAllowEdit}
                    extraContent={qIndex === 0 && !isExpanded && !isQuestionEmpty ? ` (${questions.length})` : ''}
                    iconProps={{
                      iconName: 'Cancel',
                    }}
                    id={question.id}
                    name={question.content}
                    placeholder={'Add new question'}
                    resizable={false}
                    styles={editableField}
                    value={question.content}
                    onBlur={(_id, value) => {
                      const newValue = value?.trim();
                      const isChanged = question.content !== newValue;
                      if (newValue && isChanged) {
                        onUpdateQnAQuestion(item.fileId, item.sectionId, question.id, newValue);
                      }
                      if (shouldFocusOnMount) {
                        setCreatQnAPairSettings({ groupKey: '', sectionIndex: -1 });
                      }
                    }}
                    onChange={() => {}}
                    onFocus={() => expandRow(index)}
                  />
                );
              })}

              {kthSectionIsCreatingQuestion === index ? (
                <EditableField
                  key={''}
                  required
                  ariaLabel={formatMessage('Question is empty now')}
                  depth={0}
                  disabled={isAllowEdit}
                  id={'New Question'}
                  name={'New Question'}
                  placeholder={'add new question'}
                  styles={editableFieldQuestion}
                  value={''}
                  onBlur={(_id, value) => {
                    const newValue = value?.trim();
                    if (newValue) {
                      onCreateNewQuestion(item.fileId, item.sectionId, newValue);
                    }
                    setCreatingQuestionInKthSection(-1);
                  }}
                  onChange={() => {}}
                  onFocus={() => expandRow(index)}
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
          const isExpanded = isQnASectionsExpanded[index];
          return (
            <div data-is-focusable css={formCell}>
              <EditableField
                enableIcon
                required
                ariaLabel={formatMessage(`Answer is {content}`, { content: item.Answer })}
                depth={0}
                disabled={isAllowEdit}
                expanded={isExpanded}
                iconProps={{
                  iconName: 'Cancel',
                }}
                id={item.sectionId}
                name={item.Answer}
                placeholder={'Add new answer'}
                resizable={false}
                styles={editableField}
                value={item.Answer}
                onBlur={(_id, value) => {
                  const newValue = value?.trim();
                  const isChanged = item.Answer !== newValue;
                  if (newValue && isChanged) {
                    onUpdateQnAAnswer(item.fileId, item.sectionId, newValue);
                  }
                }}
                onChange={() => {}}
                onFocus={() => expandRow(index)}
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
                      navigateTo(`/bot/${projectId}/knowledge-base/${id}`);
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
  const getGroups = (): IGroup[] | undefined => {
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
      const { id, qnaSections } = currentFile;
      const count = qnaSections.length;
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
        // isCollapsed: prevGroup.isCollapsed !== undefined ? prevGroup.isCollapsed : true,
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
        return <DetailsRow {...props} styles={rowDetails} tabIndex={props.itemIndex} />;
      }
      return null;
    },
    [dialogId]
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
              actions.createQnAFromUrlDialogBegin({ projectId, showFromScratch: true });
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
