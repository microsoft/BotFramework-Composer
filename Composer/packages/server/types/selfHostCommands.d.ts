declare namespace SelfHostCommands {
  export interface ARGV {
    user: string;
    userEmail?: string;
    env: 'production' | 'integration';
    dest: string;
    accessToken: string | undefined;
    botId: string | undefined;
  }
  export interface Build {
    (argv: ARGV): Promise<string>;
  }
}
