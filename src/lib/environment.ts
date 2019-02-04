export interface Environment {}

export let environment: object = {};

export const setEnvironment = (env: Environment) => {
  environment = env;
};
