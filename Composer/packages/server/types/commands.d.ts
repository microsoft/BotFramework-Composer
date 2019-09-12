declare module 'commands/build' {
  export interface ARGV {
    user: string;
    userEmail?: string;
    env: 'production' | 'integration';
    dest: string;
  }
  export function handlerAsync(argv: ARGV): Promise<string>;
}
