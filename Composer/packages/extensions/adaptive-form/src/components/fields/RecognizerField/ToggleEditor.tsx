// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { FontSizes } from 'office-ui-fabric-react/lib/Styling';
import formatMessage from 'format-message';

interface ToggleEditorProps {
  title: string;
}

const ToggleEditor: React.FC<ToggleEditorProps> = props => {
  const [showEditor, setShowEditor] = useState(true);

  return (
    <div className="ToggleEditor">
      <Link
        styles={{
          root: { fontSize: FontSizes.smallPlus, marginBottom: '10px' },
        }}
        onClick={() => setShowEditor(!showEditor)}
      >
        {showEditor
          ? formatMessage('Hide {title} editor', { title: props.title })
          : formatMessage('View {title} editor', { title: props.title })}
      </Link>
      <div>{showEditor && props.children}</div>
    </div>
  );
};

export default ToggleEditor;
