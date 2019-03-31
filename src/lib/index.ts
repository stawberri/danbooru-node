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

  /**
   * Default request parameters.
   *
   * These parameters will be included with all requests.
   */
  parameters?: object;
}

export interface Constructor {
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
  return function Danbooru(options: Options = {}): Danbooru {
    const [server, parameters]: [string, object] = handleOptions(options);

    const danbooru = () => {};

    danbooru.toString = () => server;

    return danbooru;
  };

  function handleOptions({
    server = "https://danbooru.donmai.us",
    login,
    api_key,
    parameters = {}
  }: Options): [string, object] {
    const baseURL = new URL(server);
    baseURL.hash = "";
    baseURL.search = "";
    baseURL.pathname = baseURL.pathname.replace(/\/+$/, "");

    const cleanURL = new URL(`${baseURL}`);
    cleanURL.username = "";
    cleanURL.password = "";

    const loginParameters = {
      login: baseURL.username || login,
      api_key: baseURL.password || api_key
    };

    const defaultParameters = {
      ...loginParameters,
      ...parameters
    };

    return [`${cleanURL}`, defaultParameters];
  }
};
