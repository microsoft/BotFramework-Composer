/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment } from 'react';
import formatMessage from 'format-message';

import { LanguageGenerationSettings } from './lg-settings';
import { Tree } from './../../components/Tree/index';
import { Conversation } from './../../components/Conversation/index';
import { NavLink } from './../../components/NavLink/index';
import { title, label, navLinkClass, fileList } from './styles';
import { contentEditor } from './styles';
import { MainContent } from './../../components/MainContent/index';

// todo: should wrap the NavLink to another component.
export const ContentPage = () => {
  return (
    <Fragment>
      <MainContent>
        <Fragment>
          <div css={fileList}>
            <Tree variant="fill">
              <div>
                <div css={title}>{formatMessage('Content')}</div>
                <NavLink to={'lu'} style={navLinkClass.default} activestyle={navLinkClass.activestyle}>
                  <div css={label}>{formatMessage('Language Understanding')}</div>
                </NavLink>
                <NavLink to={'lg'} style={navLinkClass.default} activestyle={navLinkClass.activestyle}>
                  <div css={label}>{formatMessage('Language Generation')}</div>
                </NavLink>
              </div>
            </Tree>
          </div>
          <Conversation extraCss={contentEditor}>
            <LanguageGenerationSettings />
          </Conversation>
        </Fragment>
      </MainContent>
    </Fragment>
  );
};
