export const isAbsHosted = () => process.env.COMPOSER_AUTH_PROVIDER === 'abs-h';
export type BotEnvironments = 'production' | 'integration';
