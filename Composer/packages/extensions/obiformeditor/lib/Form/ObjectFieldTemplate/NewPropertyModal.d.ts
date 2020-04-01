import React from 'react';
import { JSONSchema6 } from 'json-schema';
interface NewPropertyModalProps {
  name: string;
  onDismiss: () => void;
  onSubmit: (name: string, value: string) => void;
  schema: JSONSchema6;
}
declare const NewPropertyModal: React.FunctionComponent<NewPropertyModalProps>;
export default NewPropertyModal;
//# sourceMappingURL=NewPropertyModal.d.ts.map
