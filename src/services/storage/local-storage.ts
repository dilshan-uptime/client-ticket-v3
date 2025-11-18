const set = (key: string, value: unknown): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const get = (key: string): any => {
  const value = localStorage.getItem(key);

  if (!value) {
    return value;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return JSON.parse(value);
};

const remove = (key: string): void => {
  localStorage.removeItem(key);
};

const clear = (): void => {
  localStorage.clear();
};

const storageConst = {
  set,
  get,
  remove,
  clear,
};

export default storageConst;
