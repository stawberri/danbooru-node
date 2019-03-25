import { Environment } from "./Environment";
import { Danbooru } from "./Danbooru";

interface Options {
  server?: string;
  login?: string;
  api_key?: string;
}

export const createConstructor = ({
  URL
}: Environment): ((options?: Options) => Danbooru) => {
  return ({
    server = "https://danbooru.donmai.us",
    login,
    api_key
  }: Options = {}): Danbooru => {
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
