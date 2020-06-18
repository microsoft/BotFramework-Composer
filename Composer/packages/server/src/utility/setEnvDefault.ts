export function setEnvDefault(varName: string, value: string) {
  if (process.env[varName] === undefined) {
    process.env[varName] = value;
  }
}
