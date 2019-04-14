import { BotProjectRef } from './interface';
import path from 'path';

export class BotProject {
  public ref: BotProjectRef;

  public name: string;
  public absolutePath: string;
  public dir: string;
  constructor(ref: BotProjectRef) {
    this.ref = ref;

    this.absolutePath = path.resolve(this.ref.path);
    this.dir = path.dirname(this.absolutePath);
    this.name = path.basename(this.absolutePath);
  }

  public getFiles = () => {
    return [];
  };
}
