/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useState, useMemo } from 'react';
import { PropTypes } from 'prop-types';
import { LgEditor } from 'code-editor';
import formatMessage from 'format-message';
import { SharedColors } from '@uifabric/fluent-theme';
import lodash from 'lodash';

import * as lgUtil from '../../utils/lgUtil';

export default function CodeEditor(props) {
  const lgFile = props.file;
  const onChange = props.onChange;
  const [diagnostics, setDiagnostics] = useState([]);

  const _onChange = value => {
    const diagnostics = lgUtil.check(value);
    setDiagnostics(diagnostics);
    if (lgUtil.isValid(diagnostics) === true) {
      onChange(value);
    }
  };

  const isInvalid = !lgUtil.isValid(diagnostics);
  const errorMsg = lgUtil.combineMessage(diagnostics);

  const fileId = lgFile && lgFile.id;
  const memoizedEditor = useMemo(() => {
    return lodash.isEmpty(lgFile) === false ? (
      <LgEditor
        options={{
          lineNumbers: 'on',
          minimap: 'on',
        }}
        value={lgFile.content}
        onChange={_onChange}
      />
    ) : (
      <div />
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
        <div style={{ height: '19px' }} />
      )}
    </Fragment>
  );
}

CodeEditor.propTypes = {
  file: PropTypes.object,
  isInvalid: PropTypes.bool,
  onChange: PropTypes.func,
  diagnostics: PropTypes.array,
};
