import { Environment } from "./Environment";
import { Danbooru } from "./Danbooru";

interface Options {
  /**
   * Root URL of Danbooru server.
   *
   * Defaults to `https://danbooru.donmai.us`
   */
  server?: string;

  /**
   * Danbooru account login name.
   */
  login?: string;

  /**
   * Danbooru account api_key.
   */
  api_key?: string;
}

interface Constructor {
  /**
   * danbooru — Search Danbooru easily.
   *
   * Create a new danbooru api wrapper instance.
   *
   * Defaults to unauthenticated requests to `https://danbooru.donmai.us`
   *
   * @param options Authentication options object.
   */
  (options?: Options): Danbooru;
}

export const createConstructor = ({ URL }: Environment): Constructor => {
  return function Danbooru({
    server = "https://danbooru.donmai.us",
    login,
    api_key
  }: Options = {}): Danbooru {
    const [cleanServer, authServer] = serverURLs(server, login, api_key);

    const danbooru = () => {};

    danbooru.toString = () => cleanServer;

    return danbooru;
  };

  function serverURLs(
    server: string,
    username?: string,
    password?: string
  ): [string, string] {
    const base = new URL(server);
    base.hash = "";
    base.search = "";
    base.pathname = base.pathname.replace(/\/+$/, "");

    const clean = new URL(`${base}`);
    clean.username = "";
    clean.password = "";

    const auth = new URL(`${base}`);
    if (username) auth.username = username;
    if (password) auth.password = password;

    return [`${clean}`, `${password}`];
  }
};
