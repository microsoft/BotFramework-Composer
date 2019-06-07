import React, { useState } from 'react';
import { Link, FontSizes } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

export default function LuEditor(props) {
  const [showEditor, setShowEditor] = useState(false);

  if (!props.formData) {
    return null;
  }

  return (
    <div className="LuEditor">
      <Link
        onClick={() => setShowEditor(!showEditor)}
        styles={{ root: { fontSize: FontSizes.smallPlus, marginBottom: '10px' } }}
      >
        {showEditor
          ? formatMessage('Hide {title}', { title: props.title })
          : formatMessage('View {title}', { title: props.title })}
      </Link>
      <div className="LuEditorContent">{showEditor && props.children()}</div>
    </div>
  );
}
