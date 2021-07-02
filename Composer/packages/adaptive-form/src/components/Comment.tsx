// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import formatMessage from 'format-message';
import { IconMenu } from '@bfc/ui-shared';
import { TextField, ITextField } from 'office-ui-fabric-react/lib/TextField';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';

import { ExpandableText } from './ExpandableText';

export const MAX_CHARS_FOR_SINGLE_LINE = 65;

const styles = {
  note: css`
    background-color: #fff4ce;
    padding: 14px 10px 10px 10px;
    position: relative;
    border-radius: 3px;
  `,
  menu: css`
    position: absolute;
    right: 4px;
    top: 8px;
  `,
  noteBody: css`
    font-size: 12px;
    margin: 0;
    padding-right: 18px;
    white-space: pre-line;
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
  const textfieldRef = useRef<ITextField>(null);
  const editingStateRef = useRef<boolean>(isEditing);

  useEffect(() => {
    // send focus to the text field if toggling from view mode to edit mode
    if (!editingStateRef.current && isEditing) {
      textfieldRef.current?.focus();
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
      {!isEditing && (
        <div css={styles.note} data-testid="CommentCard">
          <div css={styles.menu}>
            <IconMenu
              iconName="MoreVertical"
              iconSize={12}
              label={formatMessage('Comment menu')}
              menuItems={menuItems}
              menuWidth={120}
            />
          </div>
          <ExpandableText css={styles.noteBody}>{comment}</ExpandableText>
        </div>
      )}
    </React.Fragment>
  );
};

export { Comment };
