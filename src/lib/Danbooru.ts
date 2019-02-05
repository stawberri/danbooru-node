interface PostsParameters {
  limit?: number;
  page?: number;
  md5?: string;
  random?: boolean;
  raw?: boolean;
  [parameter: string]: any;
}

export interface Danbooru {
  new (server?: string): Danbooru;
  new (login: string, apiKey: string, server?: string): Danbooru;

  (tags?: string, parameters?: PostsParameters): Promise<any>;
  get: (path: string, parameters?: object) => Promise<any>;
  post: (path: string, parameters?: object) => Promise<any>;
  put: (path: string, parameters?: object) => Promise<any>;
  delete: (path: string, parameters?: object) => Promise<any>;
}
