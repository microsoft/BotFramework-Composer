/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useState, useEffect } from 'react';
import { PropTypes } from 'prop-types';
import { LuEditor } from 'code-editor';
import formatMessage from 'format-message';
import { SharedColors } from '@uifabric/fluent-theme';
import { get, debounce, isEmpty } from 'lodash';

import * as luUtil from '../../utils/luUtil';

export default function CodeEditor(props) {
  const { file, errorMsg: updateErrorMsg } = props;
  const onChange = debounce(props.onChange, 500);
  const diagnostics = get(file, 'diagnostics', []);
  const [content, setContent] = useState(get(file, 'content', ''));

  const fileId = file && file.id;
  useEffect(() => {
    // reset content with file.content's initial state
    if (isEmpty(file)) return;
    setContent(file.content);
  }, [fileId]);

  // local content maybe invalid and should always sync real-time
  // file.content assume to be load from server
  const _onChange = value => {
    setContent(value);
    // TODO: validate before request update server like lg, when luParser is ready
    onChange(value);
  };

  // diagnostics is load file error,
  // updateErrorMsg is save file return error.
  const isInvalid = !luUtil.isValid(diagnostics) || updateErrorMsg !== '';
  const errorMsg = `${luUtil.combineMessage(diagnostics)}\n ${updateErrorMsg}`;

  return (
    <Fragment>
      <div
        style={{
          height: 'calc(100% - 40px)',
          border: '1px solid transparent',
          borderColor: isInvalid ? SharedColors.red20 : 'transparent',
          transition: `border-color 0.1s ${isInvalid ? 'ease-out' : 'ease-in'}`,
        }}
      >
        <LuEditor
          options={{
            lineNumbers: 'on',
            minimap: 'on',
          }}
          value={content}
          onChange={_onChange}
        />
      </div>
      {isInvalid ? (
        <div style={{ fontSize: '14px', color: SharedColors.red20 }}>
          <span>{errorMsg}</span>
          <br />
          <span>
            {formatMessage.rich(
              'This text cannot be saved because there are errors in the LU syntax. Refer to the syntax documentation <a>here</a>.',
              {
                // eslint-disable-next-line react/display-name
                a: ({ children }) => (
                  <a
                    key="a"
                    href="https://github.com/Microsoft/botbuilder-tools/blob/master/packages/Ludown/docs/lu-file-format.md#lu-file-format"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
              }
            )}
          </span>
        </div>
      ) : (
        <Fragment />
      )}
    </Fragment>
  );
}

CodeEditor.propTypes = {
  file: PropTypes.object,
  onChange: PropTypes.func,
  errorMsg: PropTypes.string,
};
