// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useState, useEffect } from 'react';
import { globalHistory } from '@reach/router';

export const useLocation = () => {
  const { location, navigate } = globalHistory;
  const [state, setState] = useState({ location, navigate });

  useEffect(() => globalHistory.listen(({ location }) => setState(state => ({ ...state, location }))), []);

  return state;
};
