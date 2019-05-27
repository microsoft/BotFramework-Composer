import React from 'react';
import PropType from 'prop-types';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';

import { ObiEditor } from './editors/ObiEditor';

initializeIcons(/* optional base url */);

const JSON_PATH_PREFIX = '$.';

const VisualDesigner = ({ navPath, focusPath, data, shellApi }) => {
  /**
   * This function is used to normalized the path string:
   *  - input:  '$.steps[0]'
   *  - output: 'steps[0]'
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

  const { navDown, focusTo, navTo } = shellApi;
  return (
    <div data-testid="visualdesigner-container">
      <ObiEditor
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
  shellApi: PropType.object.isRequired,
};

VisualDesigner.defaultProps = {
  navPath: '.',
  focusPath: '',
  data: {},
  shellApi: {},
};

export default VisualDesigner;
