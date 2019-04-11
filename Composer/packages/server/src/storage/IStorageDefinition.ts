// define common type in storage.json linkedStorages
// ts use interface to define a type
export interface IStorageDefinition {
  type: string;
  id: string;
  path: string;
  [key: string]: any;
}
