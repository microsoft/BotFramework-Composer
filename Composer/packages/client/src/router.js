/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Router, Match } from '@reach/router';

import DesignPage from './pages/design';
import { SettingPage } from './pages/setting';
import { LUPage } from './pages/language-understanding';
import { LGPage } from './pages/language-generation';
<<<<<<< HEAD
import { Home } from './pages/home';
=======
import { About } from './pages/about';
>>>>>>> about page design
import { showDesign, data } from './styles';
import { NotFound } from './components/NotFound';

const Routes = props => {
  const Content = props.component;
  const parentProps = props;
  return (
    <Match path="/" {...props}>
      {props => (
        <div css={data}>
          <Content css={showDesign(props.match)}>
            <DesignPage {...props} />
          </Content>
          {!props.match && (
            <Router {...parentProps}>
              <SettingPage path="setting/*" />
              <LUPage path="language-understanding/*" />
              <LGPage path="language-generation/*" />
<<<<<<< HEAD
              <Home path="home" />
=======
              <About path="about" />
>>>>>>> about page design
              <NotFound default />
            </Router>
          )}
        </div>
      )}
    </Match>
  );
};

export default Routes;
