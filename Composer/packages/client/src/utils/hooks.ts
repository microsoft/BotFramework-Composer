// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useState, useEffect, useContext, useRef } from 'react';
import { globalHistory } from '@reach/router';
import replace from 'lodash/replace';
import find from 'lodash/find';

import { bottomLinks, topLinks } from './pageLinks';
import { StoreContext } from './../store';
import routerCache from './routerCache';

export const useLocation = () => {
  const { location, navigate } = globalHistory;
  const [state, setState] = useState({ location, navigate });

  useEffect(() => globalHistory.listen(({ location }) => setState((state) => ({ ...state, location }))), []);

  return state;
};

export const useLinks = () => {
  const { state } = useContext(StoreContext);
  const { projectId, dialogs, designPageLocation } = state;
  const openedDialogId = designPageLocation.dialogId || dialogs.find(({ isRoot }) => isRoot === true)?.id || 'Main';

  return { topLinks: topLinks(projectId, openedDialogId), bottomLinks };
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
