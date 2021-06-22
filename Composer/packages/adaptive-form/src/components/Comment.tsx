// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import formatMessage from 'format-message';
import { IconMenu } from '@bfc/ui-shared';
import { TextField, ITextField } from 'office-ui-fabric-react/lib/TextField';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';

import { Link } from './Link';

export const MAX_CHARS_FOR_SINGLE_LINE = 65;

const styles = {
  note: (isEditing = false) => css`
    background-color: #fff4ce;
    padding: 14px 10px 10px 10px;
    position: relative;

    display: ${isEditing ? 'none' : 'block'};
  `,
  menu: css`
    position: absolute;
    right: 2px;
    top: 4px;
  `,
  noteBody: (truncate = true) => css`
    font-size: 12px;
    margin: 0;
    padding-right: 18px;
    // https://css-tricks.com/line-clampin/#weird-webkit-flexbox-way
    ${truncate
      ? `
      overflow: hidden;
      max-height: 80px;
      display: -webkit-box;
      -webkit-line-clamp: 5;
      -webkit-box-orient: vertical;
      `
      : undefined}
  `,
  showMore: css`
    display: flex;
    justify-content: flex-end;
    margin-top: 5px;
  `,
};

type CommentProps = {
  comment?: string;
  onChange: (newComment?: string) => void;
};

const Comment: React.FC<CommentProps> = ({ comment, onChange }) => {
  const [isEditing, setIsEditing] = useState(!comment);
  const [isMultiline, setIsMultiline] = useState((comment ?? '').length >= MAX_CHARS_FOR_SINGLE_LINE);
  const [showMore, setShowMore] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const noteRef = useRef<HTMLParagraphElement | null>(null);
  const textfieldRef = useRef<ITextField>(null);
  const editingStateRef = useRef<boolean>(isEditing);

  useEffect(() => {
    const el = noteRef.current;
    setNeedsTruncation(Boolean(el && el.scrollHeight > el.clientHeight));
  }, []);

  useEffect(() => {
    // send focus to the text field if toggling from view mode to edit mode
    if (!editingStateRef.current && isEditing) {
      textfieldRef.current?.focus();
    } else if (!isEditing) {
      const el = noteRef.current;
      setNeedsTruncation(Boolean(el && el.scrollHeight > el.clientHeight));
    }
    editingStateRef.current = isEditing;
  }, [isEditing]);

  const handleChange = useCallback(
    (_e, val?: string) => {
      onChange(val);
      setIsMultiline(Boolean(val && val.length >= MAX_CHARS_FOR_SINGLE_LINE));
    },
    [onChange]
  );

  const handleBlur = useCallback(() => {
    if (comment && comment.length > 0) {
      setIsEditing(false);
    }
  }, [comment]);

  const menuItems: IContextualMenuItem[] = [
    {
      key: 'edit',
      name: formatMessage('Edit'),
      iconProps: {
        iconName: 'Edit',
      },
      onClick: () => {
        setIsEditing(true);
      },
    },
    {
      key: 'delete',
      name: formatMessage('Delete'),
      iconProps: {
        iconName: 'Delete',
      },
      onClick: () => {
        handleChange({}, '');
        setIsEditing(true);
      },
    },
  ];

  return (
    <React.Fragment>
      <TextField
        componentRef={textfieldRef}
        multiline={isMultiline}
        placeholder={formatMessage('Add a note')}
        resizable={false}
        rows={5}
        styles={{
          root: {
            display: isEditing ? undefined : 'none',
          },
          field: {
            paddingRight: isMultiline ? '28px' : undefined,
            paddingBottom: isMultiline ? '30px' : undefined,
          },
        }}
        value={comment}
        onBlur={handleBlur}
        onChange={handleChange}
      />
      <div css={styles.note(isEditing)} data-testid="CommentCard">
        <div css={styles.menu}>
          <IconMenu
            iconName="MoreVertical"
            iconSize={12}
            label={formatMessage('Comment menu')}
            menuItems={menuItems}
            menuWidth={120}
          />
        </div>
        <p ref={noteRef} css={styles.noteBody(!showMore)}>
          {comment}
        </p>
        {needsTruncation && (
          <div css={styles.showMore}>
            <Link styles={{ root: { fontSize: '12px' } }} onClick={() => setShowMore((current) => !current)}>
              {showMore ? formatMessage('Show Less') : formatMessage('Show More')}
            </Link>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export { Comment };
