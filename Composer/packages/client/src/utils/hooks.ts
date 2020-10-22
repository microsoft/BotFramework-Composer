// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useState, useEffect, useRef, useMemo } from 'react';
import { globalHistory } from '@reach/router';
import replace from 'lodash/replace';
import find from 'lodash/find';
import { useRecoilValue } from 'recoil';

import { designPageLocationState, currentProjectIdState, pluginPagesSelector } from '../recoilModel';

import { bottomLinks, topLinks } from './pageLinks';
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
  const pluginPages = useRecoilValue(pluginPagesSelector);
  const openedDialogId = designPageLocation.dialogId || 'Main';

  const pageLinks = useMemo(() => {
    return topLinks(projectId, openedDialogId, pluginPages);
  }, [projectId, openedDialogId, pluginPages]);

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

export const useInterval = (callback, delay) => {
  const savedCallback = useRef<() => void>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      const interval = setInterval(() => {
        if (typeof savedCallback.current === 'function') {
          savedCallback.current();
        }
      }, delay);
      return () => clearInterval(interval);
    }
  }, [delay]);
};
