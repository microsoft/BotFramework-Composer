/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useState, useMemo } from 'react';
import { PropTypes } from 'prop-types';
import { LgEditor } from 'code-editor';
import formatMessage from 'format-message';
import { SharedColors } from '@uifabric/fluent-theme';
import { get, debounce, isEmpty } from 'lodash';

import * as lgUtil from '../../utils/lgUtil';

export default function CodeEditor(props) {
  const file = props.file;
  const onChange = debounce(props.onChange, 500);
  const [diagnostics, setDiagnostics] = useState(get(file, 'diagnostics', []));

  const _onChange = value => {
    const diagnostics = lgUtil.check(value);
    setDiagnostics(diagnostics);
    if (lgUtil.isValid(diagnostics) === true) {
      onChange(value);
    }
  };

  const isInvalid = !lgUtil.isValid(diagnostics);
  const errorMsg = lgUtil.combineMessage(diagnostics);

  const fileId = file && file.id;
  const memoizedEditor = useMemo(() => {
    return isEmpty(file) === false ? (
      <LgEditor
        options={{
          lineNumbers: 'on',
          minimap: 'on',
        }}
        value={file.content}
        onChange={_onChange}
      />
    ) : (
      <Fragment />
    );
  }, [fileId]);

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
        {memoizedEditor}
      </div>
      {isInvalid ? (
        <div style={{ fontSize: '14px', color: SharedColors.red20 }}>
          <span>{errorMsg}</span>
          <br />
          <span>
            {formatMessage.rich(
              'This text cannot be saved because there are errors in the LG syntax. Refer to the syntax documentation <a>here</a>.',
              {
                // eslint-disable-next-line react/display-name
                a: ({ children }) => (
                  <a
                    key="a"
                    href="https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md"
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
};
