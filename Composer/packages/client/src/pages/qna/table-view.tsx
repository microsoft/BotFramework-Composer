// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
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
  addSection,
} from '../../utils/qnaUtil';
import { dialogsState, qnaFilesState, projectIdState, localeState } from '../../recoilModel/atoms/botState';
import { dispatcherState } from '../../recoilModel';

import { formCell, content, textField, bold, link, actionButton } from './styles';

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
  const locale = useRecoilValue(localeState);
  const { dialogId } = props;
  const file = qnaFiles.find(({ id }) => id === `${dialogId}.${locale}`);
  const limitedNumber = useRef(5).current;
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

  const singleFileQnASections = generateQnASections(file);
  const qnaSections = useMemo(() => {
    if (dialogId === 'all') {
      return allQnASections;
    } else {
      return singleFileQnASections;
    }
  }, [dialogId, qnaFiles]);
  const [showAllAlternatives, setShowAllAlternatives] = useState(Array(qnaSections.length).fill(false));
  const [qnaSectionIndex, setQnASectionIndex] = useState(-1);
  const [questionIndex, setQuestionIndex] = useState(-1); //used in QnASection.Questions array
  const [question, setQuestion] = useState('');
  const [editMode, setEditMode] = useState(EditMode.None);
  const [answerIndex, setAnswerIndex] = useState(-1);
  const [answer, setAnswer] = useState('');

  const createOrUpdateQuestion = () => {
    if (question && editMode === EditMode.Creating) {
      const updatedQnAFileContent = addQuestion(question, qnaSections, qnaSectionIndex);
      actions.updateQnAFile({ id: `${dialogId}.${locale}`, content: updatedQnAFileContent });
    }
    if (editMode === EditMode.Updating && qnaSections[qnaSectionIndex].Questions[questionIndex].content !== question) {
      const updatedQnAFileContent = updateQuestion(question, questionIndex, qnaSections, qnaSectionIndex);
      actions.updateQnAFile({ id: `${dialogId}.${locale}`, content: updatedQnAFileContent });
    }
    cancelQuestionEditOperation();
  };

  const updateAnswer = () => {
    if (editMode === EditMode.Updating && qnaSections[qnaSectionIndex].Answer !== answer) {
      const updatedQnAFileContent = updateAnswerUtil(answer, qnaSections, qnaSectionIndex);
      actions.updateQnAFile({ id: `${dialogId}.${locale}`, content: updatedQnAFileContent });
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
    setShowAllAlternatives(Array(qnaSections.length).fill(false));
  }, [dialogId, projectId]);

  const toggleShowAllAlternatives = (index) => {
    const newArray = showAllAlternatives.map((element, i) => {
      if (i === index) {
        return !element;
      } else {
        return element;
      }
    });
    setShowAllAlternatives(newArray);
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

  const handleAddingAlternatives = (index) => {
    setEditMode(EditMode.Creating);
    setQnASectionIndex(index);
    setQuestionIndex(-1);
  };

  const handleUpdateingAlternatives = (qnaSectionIndex, questionIndex, question) => {
    setEditMode(EditMode.Updating);
    setQuestion(question);
    setQnASectionIndex(qnaSectionIndex);
    setQuestionIndex(questionIndex);
  };

  const handleQuestionOnChange = (newValue, index) => {
    if (index !== qnaSectionIndex) return;
    setQuestion(newValue);
  };

  const handleAnswerKeydown = (e) => {
    if (e.key === 'Enter') {
      updateAnswer();
      setEditMode(EditMode.None);
      setQnASectionIndex(-1);
      setAnswerIndex(-1);
      e.preventDefault();
    }
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

  const handleUpdateingAnswer = (qnaSectionIndex, answer) => {
    setEditMode(EditMode.Updating);
    setAnswer(answer);
    setQnASectionIndex(qnaSectionIndex);
    setAnswerIndex(0);
  };

  const handleAnswerOnChange = (answer, index) => {
    if (index !== qnaSectionIndex) return;
    setAnswer(answer);
  };

  const getTableColums = () => {
    const tableColums = [
      {
        key: 'Question',
        name: formatMessage('Question'),
        fieldName: 'question',
        minWidth: 150,
        maxWidth: 250,
        isResizable: true,
        data: 'string',
        onRender: (item, qnaIndex) => {
          const questions = get(item, 'Questions', []);
          const showingQuestions = showAllAlternatives[qnaIndex] ? questions : questions.slice(0, limitedNumber);
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
                        dialogId !== 'all' ? handleUpdateingAlternatives(qnaIndex, qIndex, q.content) : () => {}
                      }
                      onKeyDown={(e) => {
                        e.preventDefault();
                        if (e.key === 'Enter') {
                          handleUpdateingAlternatives(qnaIndex, qIndex, q.content);
                        }
                      }}
                    >
                      <div css={qIndex === 0 ? bold : {}}>{q.content}</div>
                    </div>
                  );
                  //It is updating this qnaSection's qIndex-th Question
                } else if (qnaIndex === qnaSectionIndex && questionIndex === qIndex && editMode === EditMode.Updating) {
                  return (
                    <TextField
                      autoFocus
                      styles={textField}
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
                <Link onClick={() => handleAddingAlternatives(qnaIndex)}>
                  {formatMessage('add alternative phrasing')}
                </Link>
              )}
            </div>
          );
        },
      },
      {
        key: 'Alternatives',
        name: formatMessage('alternatives'),
        fieldName: 'alternatives',
        minWidth: 150,
        maxWidth: 250,
        isResizable: true,
        data: 'string',
        isPadded: true,
        onRender: (item, qnaIndex) => {
          const alternatives = get(item, 'Questions', []);
          const showingAlternatives = showAllAlternatives[qnaIndex]
            ? alternatives
            : alternatives.slice(0, limitedNumber);
          return (
            <Link styles={link} onClick={() => toggleShowAllAlternatives(qnaIndex)}>
              {formatMessage('showing {current} of {all}', {
                current: showingAlternatives.length,
                all: alternatives.length,
              })}
            </Link>
          );
        },
      },
      {
        key: 'Answer',
        name: formatMessage('answer'),
        fieldName: 'answer',
        minWidth: 150,
        maxWidth: 350,
        isResizable: true,
        data: 'string',
        isPadded: true,
        onRender: (item, qnaIndex) => {
          return (
            <div data-is-focusable css={formCell}>
              {(qnaIndex !== qnaSectionIndex || answerIndex === -1 || editMode !== EditMode.Updating) && (
                <div
                  aria-label={formatMessage(`Answer is {answer}`, { answer: item.Answer })}
                  css={content}
                  role={'textbox'}
                  tabIndex={0}
                  onClick={(e) => (dialogId !== 'all' ? handleUpdateingAnswer(qnaIndex, item.Answer) : () => {})}
                  onKeyDown={(e) => {
                    e.preventDefault();
                    if (e.key === 'Enter') {
                      handleUpdateingAnswer(qnaIndex, item.Answer);
                    }
                  }}
                >
                  {item.Answer}
                </div>
              )}
              {qnaIndex === qnaSectionIndex && answerIndex === 0 && editMode === EditMode.Updating && (
                <TextField
                  autoFocus
                  styles={textField}
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

    // all view, show used in column
    if (dialogId === 'all') {
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

  const onRenderDetailsHeader = useCallback((props, defaultRender) => {
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
  }, []);

  const onCreateNewTemplate = () => {
    const newQnAPair = generateQnAPair();
    const content = get(file, 'content', '');
    const newContent = addSection(content, newQnAPair);
    actions.updateQnAFile({ id: `${dialogId}.${locale}`, content: newContent });
  };

  const onRenderDetailsFooter = () => {
    if (dialogId === 'all') return null;
    return (
      <div data-testid="tableFooter">
        <ActionButton
          css={actionButton}
          iconProps={{ iconName: 'CirclePlus' }}
          onClick={() => {
            onCreateNewTemplate();
            actions.setMessage('item added');
          }}
        >
          {formatMessage('New QnA Section')}
        </ActionButton>
      </div>
    );
  };

  const getKeyCallback = useCallback((item) => item.uuid, []);
  return (
    <div className={'table-view'} data-testid={'table-view'}>
      <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
        <DetailsList
          className="table-view-list"
          columns={getTableColums()}
          getKey={getKeyCallback}
          //initialFocusedIndex={0}
          items={qnaSections}
          //getKey={item => item.Body}
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
          onRenderDetailsFooter={onRenderDetailsFooter}
          onRenderDetailsHeader={onRenderDetailsHeader}
        />
      </ScrollablePane>
    </div>
  );
};

export default TableView;
