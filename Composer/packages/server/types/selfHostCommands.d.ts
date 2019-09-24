declare namespace SelfHostCommands {
  export interface ARGV {
    user: string;
    userEmail?: string;
    env: 'production' | 'integration';
    dest: string;
  }
  export interface Build {
    (argv: ARGV): Promise<string>;
  }
  export interface PublishVersionARGV {
    dest: string;
  }
  export interface IPublishVersion {
    buildTimestamp: Date;
    publishTimestamp: Date;
    user: string;
    userEmail: string;
    label: string;
    isInProduction: boolean;
    wasInProduction: boolean;
  }
  export interface GetPublishVersions {
    (argv: PublishVersionARGV): Promise<IPublishVersion[]>;
  }
  export interface EditingStatusARGV {
    dest: string;
  }
  export interface IEditingStatus {
    hasChanges: boolean;
  }
  export interface GetEditingStatus {
    (argv: EditingStatusARGV): Promise<IEditingStatus>;
  }
  export interface PublishARGV {
    user: string;
    dest: string;
    tag: string;
  }
  export interface Publish {
    (argv: PublishARGV): Promise<string>;
  }
}
