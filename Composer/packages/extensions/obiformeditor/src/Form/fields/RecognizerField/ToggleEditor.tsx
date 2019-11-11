// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, ReactNode } from 'react';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { FontSizes } from 'office-ui-fabric-react/lib/Styling';
import formatMessage from 'format-message';

interface ToggleEditorProps {
  loaded: boolean;
  title: string;
  children: () => ReactNode;
}

export default function ToggleEditor(props: ToggleEditorProps) {
  const [showEditor, setShowEditor] = useState(true);

  if (!props.loaded) {
    return null;
  }

  return (
    <div className="ToggleEditor">
      <Link
        onClick={() => setShowEditor(!showEditor)}
        styles={{ root: { fontSize: FontSizes.smallPlus, marginBottom: '10px' } }}
      >
        {showEditor
          ? formatMessage('Hide {title}', { title: props.title })
          : formatMessage('View {title}', { title: props.title })}
      </Link>
      <div className="ToggleEditorContent">{showEditor && props.children()}</div>
    </div>
  );
}
