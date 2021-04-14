// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useState, useEffect, useRef, useMemo, MutableRefObject } from 'react';
import { globalHistory } from '@reach/router';
import replace from 'lodash/replace';
import find from 'lodash/find';
import { useRecoilValue } from 'recoil';
import { FeatureFlagKey } from '@bfc/shared';
import isFunction from 'lodash/isFunction';

import {
  designPageLocationState,
  currentProjectIdState,
  pluginPagesSelector,
  featureFlagsState,
  rootBotProjectIdSelector,
  schemasState,
} from '../recoilModel';

import { bottomLinks, topLinks } from './pageLinks';
import routerCache from './routerCache';
import { projectIdCache } from './projectCache';

export const useLocation = () => {
  const { location, navigate } = globalHistory;
  const [state, setState] = useState({ location, navigate });

  useEffect(() => globalHistory.listen(({ location }) => setState((state) => ({ ...state, location }))), []);

  return state;
};

export const useFeatureFlag = (featureFlagKey: FeatureFlagKey): boolean => {
  const featureFlags = useRecoilValue(featureFlagsState);
  const enabled = useMemo(() => {
    if (featureFlags[featureFlagKey]) {
      return featureFlags[featureFlagKey].enabled;
    }
    return false;
  }, [featureFlags[featureFlagKey]]);

  return enabled;
};

export const useLinks = () => {
  const projectId = useRecoilValue(currentProjectIdState);
  const rootProjectId = useRecoilValue(rootBotProjectIdSelector);
  const designPageLocation = useRecoilValue(designPageLocationState(projectId));
  const pluginPages = useRecoilValue(pluginPagesSelector);
  const schemas = useRecoilValue(schemasState(projectId));
  const openedDialogId = designPageLocation.dialogId;
  const showFormDialog = useFeatureFlag('FORM_DIALOG');

  const pageLinks = useMemo(() => {
    return topLinks(projectId, openedDialogId, pluginPages, showFormDialog, schemas.sdk, rootProjectId);
  }, [projectId, openedDialogId, pluginPages, showFormDialog]);

  return { topLinks: pageLinks, bottomLinks };
};

export const useRouterCache = (to: string) => {
  const rootProjectId = useRecoilValue(rootBotProjectIdSelector);
  const [state, setState] = useState(routerCache.getAll());
  const { topLinks, bottomLinks } = useLinks();
  const linksRef = useRef(topLinks.concat(bottomLinks));
  linksRef.current = topLinks.concat(bottomLinks);

  // Tracks if the component is mounted.
  const mountedRef = useRef(false);

  useEffect(() => {
    routerCache.cleanAll();
    setState({});
  }, [rootProjectId]);

  useEffect(() => {
    mountedRef.current = true;
    globalHistory.listen(({ location }) => {
      const links = linksRef.current;
      const { href, origin } = location;
      const uri = replace(href, origin, '');
      const target = find(links, (link) => uri.startsWith(link.to));
      if (target) {
        routerCache.set(target.to, uri);
        // Only update local state if the component is still mounted.
        if (mountedRef.current) {
          setState(routerCache.getAll());
        }
      }
    });

    return () => {
      mountedRef.current = false;
    };
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

export function useInterval(callback: Function, delay: number | null) {
  const savedCallback: MutableRefObject<Function | undefined> = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      if (isFunction(savedCallback.current)) {
        savedCallback.current();
      }
    }
    if (delay != null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export function useClickOutsideOutsideTarget(
  targetRefs: MutableRefObject<HTMLElement | null>[] | null,
  callback: Function
) {
  const savedCallback: MutableRefObject<Function | undefined> = useRef();

  const isClickInsideTargets = (currentClickTarget: Node) => {
    const isClickedInside = targetRefs?.find((ref) => {
      const result = currentClickTarget && ref?.current?.contains(currentClickTarget);
      return !!result;
    });
    return isClickedInside;
  };

  const handleEvent = (e: MouseEvent) => {
    if (targetRefs && e.target !== null && isFunction(callback) && !isClickInsideTargets(e.target as Node)) {
      callback(e);
    }
  };

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    document.addEventListener('click', handleEvent);
    document.addEventListener('mousedown', handleEvent);

    return () => {
      document.removeEventListener('click', handleEvent);
      document.removeEventListener('mousedown', handleEvent);
    };
  }, [targetRefs, callback]);
}
