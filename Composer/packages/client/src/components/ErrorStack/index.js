/** @jsx jsx **/
import { jsx } from '@emotion/core';
import { useState, useContext, useEffect } from 'react';
import { Stack, StackItem } from 'office-ui-fabric-react';

import { Store } from '../../store/index';

import { container } from './styles';
import { SingleError } from './singleError';
export const ErrorStack = () => {
  const MaxinumErrorNum = 2;
  const { state } = useContext(Store);
  const { errorMessages } = state;
  const [errorShownNum, setShowState] = useState(0);
  useEffect(() => {
    if (errorShownNum < MaxinumErrorNum) {
      setShowState(errorShownNum + 1);
    }
  }, [errorMessages]);

  const onDismiss = () => {
    setShowState(errorShownNum - 1);
  };
  return errorShownNum > 0 ? (
    <Stack tokens={{ childrenGap: 20 }} style={container}>
      {errorMessages.map((item, index) => {
        if (index < errorShownNum) {
          return (
            <StackItem key={index}>
              <SingleError onDismiss={onDismiss} message={item} />
            </StackItem>
          );
        } else {
          return;
        }
      })}
    </Stack>
  ) : null;
};
