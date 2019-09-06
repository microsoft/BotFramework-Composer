import React, { useState } from 'react';

import { RichEditor } from '../../src';

const LU_HELP =
  'https://github.com/Microsoft/botbuilder-tools/blob/master/packages/Ludown/docs/lu-file-format.md#lu-file-format';

export default function App() {
  const [value, setValue] = useState<string>('');

  const placeholder = `> To learn more about the LU file format, read the documentation at
  > ${LU_HELP}`;

  return (
    <div style={{ height: 'calc(100vh - 20px)', width: '100%' }}>
      <RichEditor onChange={newVal => setValue(newVal)} value={value} placeholder={placeholder} />
    </div>
  );
}
