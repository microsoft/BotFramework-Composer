/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo } from 'react';
import { PropTypes } from 'prop-types';
import lodash from 'lodash';
import { LuEditor } from 'code-editor';

import TableView from './table-view';
import { contentEditor } from './styles';

Content.propTypes = {
  file: PropTypes.object,
  onChange: PropTypes.func,
  textMode: PropTypes.bool,
  activeDialog: PropTypes.object,
  onEdit: PropTypes.func,
};

export default function Content(props) {
  const luFile = props.file;
  const onChange = props.onChange;
  const textMode = props.textMode;
  const activeDialog = props.activeDialog;
  const onEdit = props.onEdit;

  // performance optimization, component update should only trigger by luFile change.
  const memoizedEditor = useMemo(() => {
    const textContent = lodash.isEmpty(luFile) === false ? luFile.content : '';
    return (
      <LuEditor
        options={{
          lineNumbers: 'on',
        }}
        value={textContent}
        onChange={onChange}
      />
    );
  }, [luFile]);

  return (
    <div css={contentEditor}>
      {textMode ? memoizedEditor : <TableView activeDialog={activeDialog} onEdit={onEdit} onChange={onChange} />}
    </div>
  );
}
