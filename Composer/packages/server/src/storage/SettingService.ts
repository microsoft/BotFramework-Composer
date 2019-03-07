import path from 'path';
import { FileStorage } from './../storage/FileStorage';

const setting: FileStorage = new FileStorage(path.resolve('settings.json'), (error) => {console.log(error)});

export default setting