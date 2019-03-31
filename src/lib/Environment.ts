export interface URL {
  hash: string;
  search: string;
  pathname: string;
  username: string;
  password: string;
  href: string;
}

export interface Environment {
  URL: new (url: string, base?: string) => URL;
}
