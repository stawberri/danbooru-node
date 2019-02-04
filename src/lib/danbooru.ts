interface PostsParameters {
  limit?: number;
  page?: number;
  tags?: string;
  md5?: string;
  random?: boolean;
  raw?: boolean;
}

type PromisedResponse = Promise<any>;

export interface Danbooru {
  new (server?: string): Danbooru;
  new (login: string, apiKey: string, server?: string): Danbooru;

  (tags?: string, parameters?: PostsParameters): PromisedResponse;

  get: (path: string, parameters?: object) => PromisedResponse;
  post: (path: string, parameters?: object) => PromisedResponse;
  put: (path: string, parameters?: object) => PromisedResponse;
  delete: (path: string, parameters?: object) => PromisedResponse;
}
