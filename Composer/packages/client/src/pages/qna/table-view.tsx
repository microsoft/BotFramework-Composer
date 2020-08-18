// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  DetailsList,
  DetailsRow,
  DetailsListLayoutMode,
  SelectionMode,
  CheckboxVisibility,
} from 'office-ui-fabric-react/lib/DetailsList';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import formatMessage from 'format-message';
import { RouteComponentProps } from '@reach/router';
import get from 'lodash/get';

import {
  addQuestion,
  updateQuestion,
  updateAnswer as updateAnswerUtil,
  generateQnAPair,
  insertSection,
  removeSection,
} from '../../utils/qnaUtil';
import { dialogsState, qnaFilesState, projectIdState } from '../../recoilModel/atoms/botState';
import { dispatcherState } from '../../recoilModel';

import {
  formCell,
  content,
  textFieldQuestion,
  textFieldAnswer,
  bold,
  contentAnswer,
  addQnAPairLink,
  divider,
  rowDetails,
  icon,
  addButtonContainer,
  addAlternativeLink,
} from './styles';

interface TableViewProps extends RouteComponentProps<{}> {
  dialogId: string;
}

enum EditMode {
  None,
  Creating,
  Updating,
}

const TableView: React.FC<TableViewProps> = (props) => {
  const actions = useRecoilValue(dispatcherState);
  const dialogs = useRecoilValue(dialogsState);
  const qnaFiles = useRecoilValue(qnaFilesState);
  const projectId = useRecoilValue(projectIdState);
  //To do: support other languages
  const locale = 'en-us';
  //const locale = useRecoilValue(localeState);
  const { dialogId } = props;
  const file = qnaFiles.find(({ id }) => id === `${dialogId}.${locale}`);
  const fileRef = useRef(file);
  fileRef.current = file;
  const dialogIdRef = useRef(dialogId);
  dialogIdRef.current = dialogId;
  const localeRef = useRef(locale);
  localeRef.current = locale;
  const limitedNumber = useRef(1).current;
  const generateQnASections = (file) => {
    return get(file, 'qnaSections', []).map((qnaSection, index) => {
      const qnaDialog = dialogs.find((dialog) => file.id === `${dialog.id}.${locale}`);
      return {
        fileId: file.fileId,
        dialogId: qnaDialog?.id || '',
        used: !!qnaDialog && qnaDialog,
        indexId: index,
        key: qnaSection.Body,
        ...qnaSection,
      };
    });
  };
  const allQnASections = qnaFiles.reduce((result: any[], qnaFile) => {
    const res = generateQnASections(qnaFile);
    return result.concat(res);
  }, []);

  const singleFileQnASections = generateQnASections(fileRef.current);
  const qnaSections = useMemo(() => {
    if (dialogId === 'all') {
      return allQnASections;
    } else {
      return singleFileQnASections;
    }
  }, [dialogIdRef.current, qnaFiles]);
  const [showQnAPairDetails, setShowQnAPairDetails] = useState(Array(qnaSections.length).fill(false));
  const [qnaSectionIndex, setQnASectionIndex] = useState(-1);
  const [questionIndex, setQuestionIndex] = useState(-1); //used in QnASection.Questions array
  const [question, setQuestion] = useState('');
  const [editMode, setEditMode] = useState(EditMode.None);
  const [answerIndex, setAnswerIndex] = useState(-1);
  const [answer, setAnswer] = useState('');
  const createOrUpdateQuestion = () => {
    if (question && editMode === EditMode.Creating) {
      const updatedQnAFileContent = addQuestion(question, qnaSections, qnaSectionIndex);
      actions.updateQnAFile({ id: `${dialogIdRef.current}.${localeRef.current}`, content: updatedQnAFileContent });
    }
    if (editMode === EditMode.Updating && qnaSections[qnaSectionIndex].Questions[questionIndex].content !== question) {
      const updatedQnAFileContent = updateQuestion(question, questionIndex, qnaSections, qnaSectionIndex);
      actions.updateQnAFile({ id: `${dialogIdRef.current}.${localeRef.current}`, content: updatedQnAFileContent });
    }
    cancelQuestionEditOperation();
  };

  const updateAnswer = () => {
    if (editMode === EditMode.Updating && qnaSections[qnaSectionIndex].Answer !== answer) {
      const updatedQnAFileContent = updateAnswerUtil(answer, qnaSections, qnaSectionIndex);
      actions.updateQnAFile({ id: `${dialogIdRef.current}.${localeRef.current}`, content: updatedQnAFileContent });
    }
    cancelAnswerEditOperation();
  };

  const cancelQuestionEditOperation = () => {
    setEditMode(EditMode.None);
    setQuestion('');
    setQuestionIndex(-1);
    setQnASectionIndex(-1);
  };

  const cancelAnswerEditOperation = () => {
    setEditMode(EditMode.None);
    setAnswer('');
    setAnswerIndex(-1);
    setQnASectionIndex(-1);
  };

  useEffect(() => {
    setShowQnAPairDetails(Array(qnaSections.length).fill(false));
  }, [dialogId, projectId]);

  const toggleShowAll = (index: number) => {
    const newArray = showQnAPairDetails.map((element, i) => {
      if (i === index) {
        return !element;
      } else {
        return element;
      }
    });
    setShowQnAPairDetails(newArray);
  };

  const handleQuestionKeydown = (e) => {
    if (e.key === 'Enter') {
      createOrUpdateQuestion();
      setEditMode(EditMode.None);
      e.preventDefault();
    }
    if (e.key === 'Escape') {
      cancelQuestionEditOperation();
      e.preventDefault();
    }
  };

  const handleQuestionOnBlur = (e) => {
    createOrUpdateQuestion();
    e.preventDefault();
  };

  const handleAddingAlternatives = (e, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setEditMode(EditMode.Creating);
    setQnASectionIndex(index);
    setQuestionIndex(-1);
  };

  const handleUpdateingAlternatives = (e, qnaSectionIndex: number, questionIndex: number, question: string) => {
    e.preventDefault();
    e.stopPropagation();
    setEditMode(EditMode.Updating);
    setQuestion(question);
    setQnASectionIndex(qnaSectionIndex);
    setQuestionIndex(questionIndex);
  };

  const handleQuestionOnChange = (newValue, index: number) => {
    if (index !== qnaSectionIndex) return;
    setQuestion(newValue);
  };

  const handleAnswerKeydown = (e) => {
    if (e.key === 'Escape') {
      setEditMode(EditMode.None);
      setQnASectionIndex(-1);
      setAnswerIndex(-1);
      e.preventDefault();
    }
  };

  const handleAnswerOnBlur = (e) => {
    updateAnswer();
    setEditMode(EditMode.None);
    setQnASectionIndex(-1);
    setQuestionIndex(-1);
    e.preventDefault();
  };

  const handleUpdateingAnswer = (e, qnaSectionIndex: number, answer: string) => {
    e.preventDefault();
    e.stopPropagation();
    setEditMode(EditMode.Updating);
    setAnswer(answer);
    setQnASectionIndex(qnaSectionIndex);
    setAnswerIndex(0);
  };

  const handleAnswerOnChange = (answer, index: number) => {
    if (index !== qnaSectionIndex) return;
    setAnswer(answer);
  };

  const getTableColums = () => {
    const tableColums = [
      {
        key: 'ToggleShowAll',
        name: '',
        fieldName: 'CollapseIcon',
        minWidth: 50,
        maxWidth: 50,
        isResizable: false,
        isPadded: true,
        onRender: (item, qnaIndex) => {
          return (
            <IconButton
              ariaLabel="ChevronDown"
              iconProps={{ iconName: showQnAPairDetails[qnaIndex] ? 'ChevronDown' : 'ChevronRight' }}
              styles={icon}
              title="ChevronDown"
              onClick={() => toggleShowAll(qnaIndex)}
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
        onRender: (item, qnaIndex) => {
          const questions = get(item, 'Questions', []);
          const showingQuestions = showQnAPairDetails[qnaIndex] ? questions : questions.slice(0, limitedNumber);
          //This question of this qna Section is '#?'
          const isQuestionEmpty = showingQuestions.length === 1 && showingQuestions[0].content === '';
          return (
            <div data-is-focusable css={formCell}>
              {showingQuestions.map((q, qIndex) => {
                if (qnaIndex !== qnaSectionIndex || questionIndex !== qIndex || editMode !== EditMode.Updating) {
                  return (
                    <div
                      key={q.id}
                      css={content}
                      role={'textbox'}
                      tabIndex={0}
                      onClick={(e) =>
                        dialogId !== 'all' ? handleUpdateingAlternatives(e, qnaIndex, qIndex, q.content) : () => {}
                      }
                      onKeyDown={(e) => {
                        e.preventDefault();
                        if (e.key === 'Enter') {
                          handleUpdateingAlternatives(e, qnaIndex, qIndex, q.content);
                        }
                      }}
                    >
                      {isQuestionEmpty && <div css={bold}>{formatMessage('Enter a question') + ' (0)'}</div>}
                      {!isQuestionEmpty && (
                        <div css={qIndex === 0 ? bold : {}}>
                          {`${q.content} ${qIndex === 0 ? `(${questions.length})` : ''}`}
                        </div>
                      )}
                    </div>
                  );
                  //It is updating this qnaSection's qIndex-th Question
                } else if (qnaIndex === qnaSectionIndex && questionIndex === qIndex && editMode === EditMode.Updating) {
                  return (
                    <TextField
                      autoFocus
                      styles={textFieldQuestion}
                      value={question}
                      onBlur={(e) => {
                        handleQuestionOnBlur(e);
                      }}
                      onChange={(e, newValue) => {
                        handleQuestionOnChange(newValue, qnaIndex);
                      }}
                      onKeyDown={(e) => handleQuestionKeydown(e)}
                    />
                  );
                }
              })}

              {editMode === EditMode.Creating && qnaSectionIndex === qnaIndex && dialogId !== 'all' && (
                <TextField
                  autoFocus
                  onBlur={(e) => {
                    handleQuestionOnBlur(e);
                  }}
                  onChange={(e, newValue) => {
                    e.preventDefault();
                    handleQuestionOnChange(newValue, qnaIndex);
                  }}
                  onKeyDown={(e) => handleQuestionKeydown(e)}
                />
              )}
              {!(editMode === EditMode.Creating && qnaSectionIndex === qnaIndex) && dialogId !== 'all' && (
                <Link styles={addAlternativeLink} onClick={(e) => handleAddingAlternatives(e, qnaIndex)}>
                  {formatMessage('add alternative phrasing')}
                </Link>
              )}
            </div>
          );
        },
      },
      {
        key: 'Answer',
        name: formatMessage('Answer'),
        fieldName: 'answer',
        minWidth: 150,
        maxWidth: 400,
        isResizable: true,
        data: 'string',
        isPadded: true,
        onRender: (item, qnaIndex) => {
          return (
            <div data-is-focusable css={formCell}>
              {(qnaIndex !== qnaSectionIndex || answerIndex === -1 || editMode !== EditMode.Updating) && (
                <div
                  aria-label={formatMessage(`Answer is {answer}`, { answer: item.Answer })}
                  css={contentAnswer(showQnAPairDetails[qnaIndex])}
                  role={'textbox'}
                  tabIndex={0}
                  onClick={(e) => (dialogId !== 'all' ? handleUpdateingAnswer(e, qnaIndex, item.Answer) : () => {})}
                  onKeyDown={(e) => {
                    e.preventDefault();
                    if (e.key === 'Enter') {
                      handleUpdateingAnswer(e, qnaIndex, item.Answer);
                    }
                  }}
                >
                  {item.Answer || formatMessage('Enter an answer')}
                </div>
              )}
              {qnaIndex === qnaSectionIndex && answerIndex === 0 && editMode === EditMode.Updating && (
                <TextField
                  autoFocus
                  multiline
                  autoAdjustHeight={showQnAPairDetails[qnaIndex]}
                  styles={textFieldAnswer}
                  value={answer}
                  onBlur={(e) => {
                    handleAnswerOnBlur(e);
                  }}
                  onChange={(e, newValue) => {
                    handleAnswerOnChange(newValue, qnaIndex);
                  }}
                  onKeyDown={(e) => handleAnswerKeydown(e)}
                />
              )}
            </div>
          );
        },
      },
    ];
    if (dialogId !== 'all') {
      const extraOperations = {
        key: 'buttons',
        name: '',
        minWidth: 50,
        maxWidth: 50,
        isResizable: true,
        isPadded: true,
        fieldName: 'buttons',
        data: 'string',
        onRender: (item, qnaIndex) => {
          return (
            <IconButton
              ariaLabel="Delete"
              iconProps={{ iconName: 'Delete' }}
              styles={icon}
              title="Delete"
              onClick={() => {
                actions.setMessage('item deleted');
                if (fileRef && fileRef.current) {
                  const updatedQnAFileContent = removeSection(qnaIndex, fileRef.current.content);
                  actions.updateQnAFile({
                    id: `${dialogIdRef.current}.${localeRef.current}`,
                    content: updatedQnAFileContent,
                  });
                }
              }}
            />
          );
        },
      };
      tableColums.splice(3, 0, extraOperations);
    }

    // all view, show used in column
    if (dialogIdRef.current === 'all') {
      const beenUsedColumn = {
        key: 'usedIn',
        name: formatMessage('Used In'),
        fieldName: 'usedIn',
        minWidth: 100,
        maxWidth: 100,
        isResizable: true,
        isCollapsable: true,
        data: 'string',
        onRender: (item) => {
          return (
            <div data-is-focusable css={formCell}>
              <div aria-label={formatMessage(`id is {id}`, { id: item.dialogId })} css={content} tabIndex={-1}>
                {item.dialogId}
              </div>
            </div>
          );
        },
      };
      tableColums.splice(3, 0, beenUsedColumn);
    }
    return tableColums;
  };

  const onRenderDetailsHeader = useCallback(
    (props, defaultRender) => {
      return (
        <div data-testid="tableHeader">
          <Sticky isScrollSynced stickyPosition={StickyPositionType.Header}>
            {defaultRender({
              ...props,
              onRenderColumnHeaderTooltip: (tooltipHostProps) => <TooltipHost {...tooltipHostProps} />,
            })}

            {dialogIdRef.current !== 'all' && (
              <div css={addButtonContainer}>
                <Link
                  styles={addQnAPairLink}
                  onClick={() => {
                    onCreateNewTemplate();
                    actions.setMessage('item added');
                  }}
                >
                  {formatMessage('+ Add QnA Pair')}
                </Link>
              </div>
            )}
            <div css={divider}> </div>
          </Sticky>
        </div>
      );
    },
    [dialogIdRef]
  );

  const onRenderRow = (props) => {
    if (props) {
      return <DetailsRow {...props} styles={rowDetails} tabIndex={props.itemIndex} />;
    }
    return null;
  };

  const onCreateNewTemplate = () => {
    const newQnAPair = generateQnAPair();
    const content = get(fileRef.current, 'content', '');
    const newContent = insertSection(0, content, newQnAPair);
    actions.updateQnAFile({ id: `${dialogIdRef.current}.${localeRef.current}`, content: newContent });
    const newArray = [false, ...showQnAPairDetails];
    setShowQnAPairDetails(newArray);
  };

  const getKeyCallback = useCallback((item) => item.uuid, []);
  return (
    <div className={'table-view'} data-testid={'table-view'}>
      <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
        <DetailsList
          checkboxVisibility={CheckboxVisibility.hidden}
          className="table-view-list"
          columns={getTableColums()}
          getKey={getKeyCallback}
          items={qnaSections}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.single}
          onRenderDetailsHeader={onRenderDetailsHeader}
          onRenderRow={onRenderRow}
        />
      </ScrollablePane>
    </div>
  );
};

export default TableView;
