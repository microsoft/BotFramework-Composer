import React, { useRef } from 'react';
import PropType from 'prop-types';
import { isEqual } from 'lodash';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import formatMessage from 'format-message';

import { ObiEditor } from './editors/ObiEditor';
import { isLayoutEqual } from './shared/isLayoutEqual';
import { JSON_PATH_PREFIX } from './shared/jsonTracker';

initializeIcons(/* optional base url */);
formatMessage.setup({
  missingTranslation: 'ignore',
});

const VisualDesigner = ({ navPath, focusPath, data: inputData, onChange, shellApi }) => {
  const dataCache = useRef();
  const layoutVersion = useRef(0);

  /**
   * VisualDesigner is coupled with ShellApi where input json always mutates.
   * Deep checking input data here to make React change detection works.
   * Deep checking layout to trigger a redraw.
   */
  const dataChanged = !isEqual(dataCache.current, inputData);
  const layoutChanged = dataChanged && !isLayoutEqual(dataCache.current, inputData);
  if (dataChanged) {
    dataCache.current = inputData;
  }
  if (layoutChanged) {
    layoutVersion.current += 1;
  }

  /**
   * This function is used to normalized the path string:
   *  - input:  '$.steps[0]'
   *  - output: '.steps[0]'
   */
  const normalizeDataPath = jsonPathString => {
    if (jsonPathString && jsonPathString.indexOf(JSON_PATH_PREFIX) === 0) {
      return jsonPathString.substr(JSON_PATH_PREFIX.length);
    }
    return jsonPathString;
  };

  /**
   * Calculate focused node id from focusPath and navPath.
   *  - input:  focusPath='AddToDo#', navPath='AddToDo#steps[0]'
   *  - output: '$.steps[0]'
   *
   *  - input:  focusPath = 'AddToDo#, navPath='AddToDo#'
   *  - output: ''
   */
  const normalizeFocusedId = (focusPath, navPath) => {
    let id = focusPath;
    if (id.indexOf(navPath) === 0) {
      id = id.replace(navPath, '');
    }

    if (id) {
      return JSON_PATH_PREFIX + id;
    }
    return '';
  };

  const data = dataCache.current;
  const { navDown, focusTo, navTo } = shellApi;
  return (
    <div data-testid="visualdesigner-container" style={{ width: '100%', height: '100%' }}>
      <ObiEditor
        key={navPath + '?version=' + layoutVersion.current}
        path={navPath}
        focusedId={normalizeFocusedId(focusPath, navPath)}
        data={data}
        onSelect={x => focusTo(normalizeDataPath(x))}
        onExpand={x => navDown(normalizeDataPath(x))}
        onOpen={x => navTo(normalizeDataPath(x) + '#')}
        onChange={x => onChange(x)}
      />
    </div>
  );
};

VisualDesigner.propTypes = {
  navPath: PropType.string.isRequired,
  focusPath: PropType.string.isRequired,
  data: PropType.object.isRequired,
  onChange: PropType.func.isRequired,
  shellApi: PropType.object.isRequired,
};

VisualDesigner.defaultProps = {
  navPath: '.',
  focusPath: '',
  data: {},
  onChange: () => {},
  shellApi: {
    navDown: () => {},
    focusTo: () => {},
    navTo: () => {},
  },
};

export default VisualDesigner;
