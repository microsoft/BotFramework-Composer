/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useMemo } from 'react';
import { PropTypes } from 'prop-types';
import lodash from 'lodash';
import { LgEditor } from 'code-editor';

import { contentEditor } from '../language-understanding/styles';

import TableView from './table-view';

Content.propTypes = {
  file: PropTypes.object,
  onChange: PropTypes.func,
  textMode: PropTypes.bool,
  activeDialog: PropTypes.object,
  onEdit: PropTypes.func,
};

// TODO: validate here,
// both form editor and code editor
export default function Content(props) {
  const lgFile = props.file;
  const onChange = props.onChange;
  const textMode = props.textMode;
  const activeDialog = props.activeDialog;
  const onEdit = props.onEdit;

  // performance optimization, component update should only trigger by lgFile change.
  const memoizedEditor = useMemo(() => {
    return lodash.isEmpty(lgFile) === false ? (
      <LgEditor
        options={{
          lineNumbers: 'on',
        }}
        value={lgFile.content}
        onChange={onChange}
      />
    ) : (
      <div />
    );
  }, [lgFile]);

  return (
    <div css={contentEditor}>
      {lodash.isEmpty(lgFile) === false ? (
        textMode ? (
          memoizedEditor
        ) : (
          <TableView file={lgFile} activeDialog={activeDialog} onEdit={onEdit} onChange={onChange} />
        )
      ) : (
        <Fragment />
      )}
    </div>
  );
}
