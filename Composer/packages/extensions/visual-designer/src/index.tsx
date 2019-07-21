import React, { useRef, useState } from 'react';
import { isEqual } from 'lodash';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import formatMessage from 'format-message';

import { ObiEditor } from './editors/ObiEditor';
import { isLayoutEqual } from './shared/isLayoutEqual';
import { LgAPIContext } from './store/LgAPIContext';

initializeIcons(/* optional base url */);
formatMessage.setup({
  missingTranslation: 'ignore',
});

const VisualDesigner: React.FC<VisualDesignerProps> = ({
  navPath,
  focusPath,
  data: inputData,
  currentDialog,
  onChange,
  shellApi,
}: {
  [key: string]: any;
}) => {
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
   * Calculate focused node id from focusPath and navPath.
   *  - input:  focusPath='AddToDo#', navPath='AddToDo#steps[0]'
   *  - output: 'steps[0]'
   *
   *  - input:  focusPath = 'AddToDo#, navPath='AddToDo#'
   *  - output: ''
   */
  const normalizeFocusedId = (focusPath, navPath): string => {
    let id = focusPath;
    if (id.indexOf(navPath) === 0) {
      id = id.replace(navPath + '.', '');
    }

    if (id) {
      return id;
    }
    return '';
  };

  const data = dataCache.current;
  const { navDown, focusTo, navTo, getLgTemplates, removeLgTemplate } = shellApi;

  // NOTE: avoid re-render. https://reactjs.org/docs/context.html#caveats
  const [lgAPIContext] = useState({
    getLgTemplates: getLgTemplates,
    removeLgTemplate: removeLgTemplate,
  });

  return (
    <LgAPIContext.Provider value={lgAPIContext}>
      <div data-testid="visualdesigner-container" style={{ width: '100%', height: '100%' }}>
        <ObiEditor
          key={navPath + '?version=' + layoutVersion.current}
          path={navPath}
          focusedId={normalizeFocusedId(focusPath, navPath)}
          data={data}
          isRoot={currentDialog && currentDialog.isRoot && navPath.endsWith('#')}
          onSelect={x => focusTo(x ? '.' + x : '')}
          onExpand={x => navDown('.' + x)}
          onOpen={x => navTo(x + '#')}
          onChange={x => onChange(x)}
        />
      </div>
    </LgAPIContext.Provider>
  );
};

interface VisualDesignerProps {
  data: object;
  focusPath: string;
  navPath: string;
  onChange: (x: any) => void;
  shellApi: object;
  currentDialog: { id: string; displayName: string; isRoot: boolean };
}

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
