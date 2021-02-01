// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { atom } from 'recoil';

export const storagesState = atom<any>({
  key: 'testHistory',
  default: {
    location: null,
    action: null,
  },
});

const useRecoilHistory = (source) => {
  let listeners = [];
  let location = getLocation(source);
  let transitioning = false;
  let resolveTransition = () => {};

  return {
    get location() {
      return location;
    },

    get transitioning() {
      return transitioning;
    },

    _onTransitionComplete() {
      transitioning = false;
      resolveTransition();
    },

    listen(listener) {
      listeners.push(listener);

      const popstateListener = () => {
        location = getLocation(source);
        listener({ location, action: 'POP' });
      };

      source.addEventListener('popstate', popstateListener);

      return () => {
        source.removeEventListener('popstate', popstateListener);
        listeners = listeners.filter((fn) => fn !== listener);
      };
    },

    navigate(to, { state, replace = false } = {}) {
      if (typeof to === 'number') {
        source.history.go(to);
      } else {
        state = { ...state, key: Date.now() + '' };
        // try...catch iOS Safari limits to 100 pushState calls
        try {
          if (transitioning || replace) {
            source.history.replaceState(state, null, to);
          } else {
            source.history.pushState(state, null, to);
          }
        } catch (e) {
          source.location[replace ? 'replace' : 'assign'](to);
        }
      }

      location = getLocation(source);
      transitioning = true;
      const transition = new Promise((res) => (resolveTransition = res));
      listeners.forEach((listener) => listener({ location, action: 'PUSH' }));
      return transition;
    },
  };
};
