import { Diagnostic } from '../validator';

// The basic interface for declartive resource
// we need to model things as resource so that we can have a unified interface
// for loading\validating\refering those declative assets, we will have a good
// alignment between runtime and composer

// maybe call this DeclativeResource ?
export interface Resource {
  // id + type can indentify one resource
  // the reason why not just id is
  //  1. that's the previous design that works well with res api
  //  2. in declartive SDK, we really don't have a uniformed id for dialog, lg, lu
  //     like if you want to refer a dialog, you can inline put "dialogB" without ".dialog",
  //     but when you want to refer a lg file, you must specifiy "a.lg", with ".lg".
  //  So for now, id is only unique each type
  id: string;

  type: ResourceType;

  // the reason the type is "any" is because today dialog's content is json
  // while lg, lu file is raw content
  // TODO: unify this to content + parsedContent later because it's a big change
  content: any;

  // put here for coveninence sometime, we also aggregate all diagnostics into one place
  // perhaps we can put this down instead of this generic interface
  diagnostics?: Diagnostic[];

  // index is the process of extracting userful information from raw content or an initlization process.
  // there are many alternative ways to model this than creating add such a method in here,
  // like delegating to a ResourceFactory to do the create + index\init
  // which is probably better, I just keep it here for the inteheriance of previous setup.
  // but we do note that this don't feels too right here
  index(botName?: string): Promise<void>;
}

export enum ResourceType {
  DIALOG = 'dialog',
  LG = 'lg',
  LU = 'lu',
}
