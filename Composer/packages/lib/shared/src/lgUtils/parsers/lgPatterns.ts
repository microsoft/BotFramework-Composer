// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

export const LgNamePattern = `([A-Z]\\w+)_(\\w{6})`;

/**
 * should matches
 * ${help()} ${help(name)} ${help(name, location)}
 * ${help-me()}
 * ${formatDateTime(utcNow(), 'yyyy-MM-ddTHH:mm')}
 */
export const LgTemplateRefPattern = `\\$\\{([A-Za-z_][\\w]+)(\\([^\\)]*\\))?\\}`;
