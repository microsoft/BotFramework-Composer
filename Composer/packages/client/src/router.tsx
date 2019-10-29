/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import React, { useContext, useEffect } from 'react';
import { Router, Match, Redirect } from '@reach/router';

import DesignPage from './pages/design';
import { SettingPage } from './pages/setting';
import { LUPage } from './pages/language-understanding';
import { LGPage } from './pages/language-generation';
import { Home } from './pages/home';
import { About } from './pages/about';
import { showDesign, data } from './styles';
import { NotFound } from './components/NotFound';
import { BASEPATH } from './constants';
import { StoreContext } from './store';
import { resolveToBasePath } from './utils/fileUtil';

const Routes = props => {
  const { actions } = useContext(StoreContext);
  const Content = props.component;
  const parentProps = props;

  useEffect(() => {
    actions.fetchProject();
  }, []);

  return (
    <Match path={resolveToBasePath(BASEPATH, '/dialogs/:dialogId/*')} {...props}>
      {({ match, navigate, location }) => (
        <div css={data}>
          <Content css={showDesign(match)}>
            <DesignPage match={match} navigate={navigate} location={location} />
          </Content>
          {!match && (
            <Router basepath={BASEPATH} {...parentProps}>
              <Redirect from="/" to={resolveToBasePath(BASEPATH, 'dialogs/Main')} noThrow />
              <SettingPage path="setting/*" />
              <LUPage path="language-understanding/*" />
              <LGPage path="language-generation/*" />
              <Home path="home" />
              <About path="about" />
              <NotFound default />
            </Router>
          )}
        </div>
      )}
    </Match>
  );
};

export default Routes;
