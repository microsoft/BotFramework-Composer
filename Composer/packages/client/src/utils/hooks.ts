// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useState, useEffect, useRef, useMemo } from 'react';
import { globalHistory } from '@reach/router';
import replace from 'lodash/replace';
import find from 'lodash/find';
import { useRecoilValue } from 'recoil';

import { designPageLocationState, enabledExtensionsSelector, currentProjectIdState } from '../recoilModel';

import { bottomLinks, topLinks, ExtensionPageConfig } from './pageLinks';
import routerCache from './routerCache';
import { projectIdCache } from './projectCache';

export const useLocation = () => {
  const { location, navigate } = globalHistory;
  const [state, setState] = useState({ location, navigate });

  useEffect(() => globalHistory.listen(({ location }) => setState((state) => ({ ...state, location }))), []);

  return state;
};

export const useLinks = () => {
  const projectId = useRecoilValue(currentProjectIdState);
  const designPageLocation = useRecoilValue(designPageLocationState(projectId));
  const extensions = useRecoilValue(enabledExtensionsSelector);
  const openedDialogId = designPageLocation.dialogId || 'Main';

  const pageLinks = useMemo(() => {
    // add page-contributing extensions
    const pluginPages = extensions.reduce((pages, p) => {
      const pagesConfig = p.contributes?.views?.pages;
      if (Array.isArray(pagesConfig) && pagesConfig.length > 0) {
        pages.push(...pagesConfig.map((page) => ({ ...page, id: p.id })));
      }
      return pages;
    }, [] as ExtensionPageConfig[]);

    return topLinks(projectId, openedDialogId, pluginPages);
  }, [projectId, openedDialogId, extensions]);

  return { topLinks: pageLinks, bottomLinks };
};

export const useRouterCache = (to: string) => {
  const [state, setState] = useState(routerCache.getAll());
  const { topLinks, bottomLinks } = useLinks();
  const linksRef = useRef(topLinks.concat(bottomLinks));
  linksRef.current = topLinks.concat(bottomLinks);
  useEffect(() => {
    globalHistory.listen(({ location }) => {
      const links = linksRef.current;
      const { href, origin } = location;
      const uri = replace(href, origin, '');
      const target = find(links, (link) => uri.startsWith(link.to));
      if (target) {
        routerCache.set(target.to, uri);
        setState(routerCache.getAll());
      }
    });
  }, []);

  return state[to] || to;
};

export const useProjectIdCache = () => {
  const [projectId, setProjectId] = useState(projectIdCache.get());
  useEffect(() => {
    setProjectId(projectIdCache.get());
  }, []);

  return projectId;
};
