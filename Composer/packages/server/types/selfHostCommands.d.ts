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
}
