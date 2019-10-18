export const isAbsHosted = () => process.env.COMPOSER_AUTH_PROVIDER === 'abs-h' || process.env.MOCKHOSTED;
export type BotEnvironments = 'production' | 'integration';
