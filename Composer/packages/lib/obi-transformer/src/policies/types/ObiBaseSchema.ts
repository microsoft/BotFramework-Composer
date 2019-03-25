import { DialogTypes } from './obi-enums/ObiDialogTypes';

export class ObiBaseSchema {
  $schema: string;
  $type: DialogTypes;
  $id: string;
}
