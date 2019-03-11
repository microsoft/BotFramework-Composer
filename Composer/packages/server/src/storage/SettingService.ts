import path from 'path';
import { FileStorage } from './../storage/FileStorage';

const settings: FileStorage = new FileStorage(path.resolve('settings.json'), error => {
  console.log(error);
});

export default settings;
