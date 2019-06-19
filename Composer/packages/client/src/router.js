/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment } from 'react';
import { Router, Match } from '@reach/router';

import DesignPage from './pages/design';
import { SettingPage } from './pages/setting';
import { LUPage } from './pages/language-understanding';
import { LGPage } from './pages/language-generation';
import { showDesign } from './styles';
import { NotFound } from './components/NotFound';

const Routes = props => {
  const Content = props.component;
  const parentProps = props;
  return (
    <Match path="/" {...props}>
      {props => (
        <Fragment>
          <Content css={showDesign(props.match)}>
            <DesignPage {...props} />
          </Content>
          {!props.match && (
            <Router {...parentProps}>
              <SettingPage path="setting/*" />
              <LUPage path="language-understanding/" />
              <LUPage path="language-understanding/:fileId" />
<<<<<<< HEAD
              <LGPage path="language-generation/*" />
=======
              <LGPage path="language-generation/" />
              <LGPage path="language-generation/:fileId" />
>>>>>>> fix the bug on the back button and two other bugs which causes the white page bugs
              <NotFound default />
            </Router>
          )}
        </Fragment>
      )}
    </Match>
  );
};

export default Routes;
