import { Environment, URL } from "./Environment";
import { Danbooru } from "./Danbooru";

export const danbooruFactory = (
  env: Environment,
  server: string = "https://danbooru.donmai.us",
  login?: [string, string]
): Danbooru => {
  const { URL } = env;

  const base: URL = new URL(server);
  base.hash = "";
  base.search = "";
  base.pathname = base.pathname.replace(/\/+$/, "");
  if (login) {
    const [username, password] = login;
    base.username = username;
    base.password = password;
  }

  const danbooru: Danbooru = function(...args) {
    if (new.target) return userCreateDanbooru(env, args);
  };

  return danbooru;
};

function userCreateDanbooru(env: Environment, args: any[]): Danbooru {
  const [loginOrServer, apiKey, server] = args;

  switch (args.length) {
    case 0:
      return danbooruFactory(env);

    case 1:
      return danbooruFactory(env, maybeString("server", loginOrServer));

    default:
      return danbooruFactory(env, maybeString("server", server), [
        ensureString("login", loginOrServer),
        ensureString("apiKey", apiKey)
      ]);
  }
}

function ensureString(name: string, value: any, optional?: boolean): string {
  if (typeof value === "string") return value;

  let optionalMessage = "";
  if (optional) optionalMessage = " or undefined";

  throw new TypeError(
    `Expected ${name} to be a string${optionalMessage} but a ${typeof value} was provided.`
  );
}

function maybeString(name: string, value: any): string | undefined {
  if (value === undefined) return value;
  return ensureString(name, value, true);
}
