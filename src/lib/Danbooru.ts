interface Parameters {
  /**
   * Number of posts to retrieve.
   */
  limit?: number;

  /**
   * Page number to retrieve.
   */
  page?: number;

  /**
   * An image md5 to search for.
   */
  md5?: string;

  /**
   * Randomize post order.
   */
  random?: boolean;

  /**
   * Treat tags argument as a single, unparsed tag.
   */
  raw?: boolean;

  [parameter: string]: any;
}

export interface Danbooru {
  /**
   * Create a new `danbooru` instance that makes requests to the Danbooru server
   * of your choice.
   *
   * Omit server to connect to `https://danbooru.donmai.us`.
   *
   * Provide more arguments to authenticate.
   *
   * Call this function without `new` to search Danbooru.
   *
   * @param server Root URL of Danbooru server.
   */
  new (server?: string): Danbooru;

  /**
   * Create a new `danbooru` instance that makes authenticated requests to the
   * Danbooru server of your choice.
   *
   * Omit server to connect to `https://danbooru.donmai.us`.
   *
   * Provide fewer arguments if you do not want to authenticate.
   *
   * Call this function without `new` to search Danbooru.
   *
   * @param login Danbooru account login name.
   * @param apiKey Danbooru account api_key.
   * @param server Root URL of Danbooru server.
   */
  new (login: string, apiKey: string, server?: string): Danbooru;

  /**
   * Provide your search query and parameters to search Danbooru.
   *
   * Please refer to the Danbooru API Reference for more details.
   *
   * Use the `.get()`, `.post()`, `.put()`, and `.delete()` methods to access
   * other API resources.
   *
   * Call this function with `new` to authenticate or switch servers.
   *
   * @param tags Tags to search for.
   * @param parameters Request parameters.
   */
  (tags?: string, parameters?: Parameters): Promise<any>;
  get: (path: string, parameters?: object) => Promise<any>;
  post: (path: string, parameters?: object) => Promise<any>;
  put: (path: string, parameters?: object) => Promise<any>;
  delete: (path: string, parameters?: object) => Promise<any>;
}
