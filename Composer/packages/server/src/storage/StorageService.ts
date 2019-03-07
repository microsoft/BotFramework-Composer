import path from 'path';
import { FileStorage } from './../storage/FileStorage';

const storage: FileStorage = new FileStorage(path.resolve('storage.json'), (error) => {console.log(error)});

export default storage