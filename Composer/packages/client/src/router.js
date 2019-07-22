/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Router, Match } from '@reach/router';

import DesignPage from './pages/design';
import { SettingPage } from './pages/setting';
import { LUPage } from './pages/language-understanding';
import { LGPage } from './pages/language-generation';
import { Home } from './pages/home';
import { About } from './pages/about';
import { showDesign, data } from './styles';
import { NotFound } from './components/NotFound';

const Routes = props => {
  const Content = props.component;
  const parentProps = props;
  return (
    <Match path="/dialogs/:dialogId/*" {...props}>
      {({ match, navigate, location }) => (
        <div css={data}>
          <Content css={showDesign(match)}>
            <DesignPage match={match} navigate={navigate} location={location} />
          </Content>
          {!match && (
            <Router {...parentProps}>
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
