// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { HandlerCreator } from 'src/app/dispatcher/dispatcherUtil';
import { Dispatcher } from 'src/app/dispatcher/dispatcher';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useHandlers = (dispatcher: Dispatcher, ...handlerCreators: readonly HandlerCreator[]) => {
  const disposerRefs = React.useRef<(() => void)[]>([]);

  if (!disposerRefs.current.length && dispatcher) {
    disposerRefs.current = handlerCreators.map(dispatcher.installHandler);
  }

  React.useEffect(() => {
    if (!disposerRefs.current.length && dispatcher) {
      disposerRefs.current = handlerCreators.map(dispatcher.installHandler);
    }

    return () => {
      disposerRefs.current.forEach((disposer) => disposer());
      disposerRefs.current = [];
    };
  }, [dispatcher, ...handlerCreators]);
};
