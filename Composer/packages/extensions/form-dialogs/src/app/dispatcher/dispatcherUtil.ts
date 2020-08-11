// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Lifetime } from 'src/app/utils/base';

export type Handler = (params: any) => void;

export type HandlerCreator<TD = any> = (dependencies: TD) => Record<string, Handler>;

export const getDispatcher = <TD, TA extends Record<string, Handler>>(dependencies: (lifetime: Lifetime) => TD) => {
  const handlerMap = new Map<string, Handler>();
  const handlerLifetimeMap = new WeakMap<HandlerCreator, Lifetime>();

  // ------------ handler ------------

  const installHandler = (handlerCreator: HandlerCreator<TD & { lifetime: Lifetime }>) => {
    const lifetime = new Lifetime();

    if (handlerLifetimeMap.get(handlerCreator)) {
      handlerLifetimeMap.get(handlerCreator).dispose();
    }

    handlerLifetimeMap.set(handlerCreator, lifetime);

    const handler = handlerCreator({ ...dependencies(lifetime), lifetime });

    Object.keys(handler).forEach((name) => {
      if (!module.hot && handlerMap.get(name)) {
        throw new Error(`Action: '${name}' is already installed.`);
      }
      handlerMap.set(name, handler[name]);
    });

    return () => {
      if (!module.hot) {
        Object.keys(handler).forEach((name) => {
          handlerMap.delete(name);
        });
      }

      lifetime.dispose();
    };
  };

  // ------------ dispatch -----------

  type Params<T> = T extends (...params: infer U) => void ? U : never;

  const dispatch = <TN extends keyof TA>(name: TN, ...params: Params<TA[TN]>) => {
    const handler = handlerMap.get(<string>name);

    if (!handler) {
      throw new Error(`Action: '${name}' is not found. Please install it first`);
    }

    // eslint-disable-next-line prefer-spread
    handler.apply(null, params);
  };

  const dispatchAction = <T extends { name: string; params: {} }>(
    name: T['name'],
    ...params: T['params'] extends undefined ? [never?] : [T['params']]
  ) => {
    dispatch(<any>name, ...(<any>params));
  };

  return {
    installHandler,
    dispatch,
    dispatchAction,
  };
};
