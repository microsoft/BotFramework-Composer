// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { renderHook, RenderHookResult } from '@bfc/test-utils/lib/hooks';
import React, { useEffect, useRef } from 'react';
import { RecoilRoot, RecoilState, useSetRecoilState } from 'recoil';
import reduce from 'lodash/reduce';

interface MockRecoilState {
  recoilState: RecoilState<any>;
  initialValue: any;
}

interface RenderHookOptions {
  states?: MockRecoilState[];
  wrapper?: React.ComponentType;
  dispatcher?: MockRecoilState;
}

function recoilStateWrapper(options?: RenderHookOptions) {
  const StateComponent: React.FC<MockRecoilState> = (props: MockRecoilState) => {
    const setState = useSetRecoilState(props.recoilState);
    useEffect(() => {
      setState(props.initialValue);
    }, []);

    return null;
  };

  const DispatcherComponent: React.FC<MockRecoilState> = (props: MockRecoilState) => {
    const setState = useSetRecoilState(props.recoilState);

    const reducedState = useRef(
      reduce(
        props.initialValue,
        (result, value) => {
          result = {
            ...result,
            ...value(),
          };
          return result;
        },
        {}
      )
    );

    useEffect(() => {
      setState({ ...reducedState.current });
    });

    return null;
  };

  const renderStateComponents = () => {
    return options?.states?.map((state) => <StateComponent key={state.recoilState.key} {...state} />);
  };

  const renderDispatcher = () => {
    if (options?.dispatcher) {
      return <DispatcherComponent {...options?.dispatcher} />;
    }
  };

  return ({ children }: { children?: React.ReactNode }) => {
    const renderChildren = options?.wrapper ? <options.wrapper>{children}</options.wrapper> : children;

    return (
      <RecoilRoot>
        {renderStateComponents()}
        {renderDispatcher()}
        {renderChildren}
      </RecoilRoot>
    );
  };
}

function renderRecoilHook<P, R>(
  callback: (props: P) => R,
  options?: RenderHookOptions & {
    initialProps?: P;
  }
): RenderHookResult<P, R> {
  return renderHook(callback, {
    ...options,
    wrapper: recoilStateWrapper({
      states: options?.states,
      wrapper: options?.wrapper,
      dispatcher: options?.dispatcher,
    }),
  });
}

export { renderRecoilHook };
