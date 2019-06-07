import React, { useState } from 'react';
import { Link, FontSizes } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

export default function ToggleEditor(props) {
  const [showEditor, setShowEditor] = useState(false);

  if (!props.formData) {
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
