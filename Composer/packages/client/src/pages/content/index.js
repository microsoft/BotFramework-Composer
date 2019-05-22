/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext, useMemo } from 'react';
import formatMessage from 'format-message';
import { Nav } from 'office-ui-fabric-react/lib/Nav';
import { navigate } from '@reach/router';

import { Store } from '../../store/index';

import Routes from './router';
import { Conversation } from './../../components/Conversation/index';
import { contentContainer } from './styles';
import { contentEditor } from './styles';
import { MainContent } from './../../components/MainContent/index';

export const ContentPage = () => {
  const { state } = useContext(Store);
  const { luFiles, lgFiles } = state;
  const currentPathname = window.location.pathname;

  const currentFileId = useMemo(() => {
    // currentPathname should be '/content/*/fileId'
    return currentPathname.split('/')[3];
  }, [currentPathname]);
  const groups = useMemo(() => {
    const lgLinks = lgFiles.map(file => {
      return {
        key: file.id,
        name: `${file.id}.lg`,
        url: `/content/lg/${file.id}`,
        forceAnchor: true,
        onClick: event => {
          event.preventDefault();
          navigate(`/content/lg/${file.id}`);
        },
      };
    });
    const luLinks = luFiles.map(file => {
      return {
        key: file.id,
        name: `${file.id}.lu`,
        url: `/content/lu/${file.id}`,
        forceAnchor: true,
        onClick: event => {
          event.preventDefault();
          navigate(`/content/lu/${file.id}`);
        },
      };
    });

    return [
      {
        name: formatMessage('Language Understanding'),
        links: luLinks,
      },
      {
        name: formatMessage('Language Generation'),
        links: lgLinks,
      },
    ];
  }, [lgFiles, luFiles]);

  return (
    <MainContent>
      <div css={contentContainer}>
        <Nav
          styles={{ root: { width: 250 } }}
          selectedKey={currentFileId}
          expandButtonAriaLabel="Expand or collapse"
          groups={groups}
        />
        <Conversation extraCss={contentEditor}>
          <Routes />
        </Conversation>
      </div>
    </MainContent>
  );
};
