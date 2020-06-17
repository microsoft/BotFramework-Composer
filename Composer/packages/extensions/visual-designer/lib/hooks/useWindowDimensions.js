// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { useState, useEffect, useRef } from 'react';
import debounce from 'lodash/debounce';
var getWindowDimensions = function () {
  var width = window.innerWidth,
    height = window.innerHeight;
  return {
    width: width,
    height: height,
  };
};
export var useWindowDimensions = function () {
  var _a = useState(getWindowDimensions()),
    windowDimensions = _a[0],
    setWindowDimensions = _a[1];
  var handleResize = useRef(
    debounce(function () {
      return setWindowDimensions(getWindowDimensions());
    }, 200)
  ).current;
  useEffect(function () {
    window.addEventListener('resize', handleResize);
    return function () {
      return window.removeEventListener('resize', handleResize);
    };
  }, []);
  return windowDimensions;
};
//# sourceMappingURL=useWindowDimensions.js.map
