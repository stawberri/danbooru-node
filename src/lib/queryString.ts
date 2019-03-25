export const queryString = (data: any) => {
  if (!Array.isArray(data) && Object(data) !== data) return "";

  const output: string[] = [];

  unwrap("", data);
  return "?" + output.join("&");

  function unwrap(key: string, value: any): void {
    let before = "",
      after = "";
    if (key) {
      before = key + "[";
      after = "]";
    }

    if (Array.isArray(value))
      for (let i = 0; i < value.length; i++) loop(`${i}`, value[i]);
    else if (Object(value) === value)
      for (const objectKey in value) loop(objectKey, value[objectKey]);
    else output.push(key + "=" + encodeURIComponent(value));

    function loop(loopKey: string, loopValue: string): void {
      unwrap(before + encodeURIComponent(loopKey) + after, loopValue);
    }
  }
};
