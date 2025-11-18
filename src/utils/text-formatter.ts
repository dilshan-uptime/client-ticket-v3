export const textShortener = (text: string, length = 25) => {
  if (text != null && text.length >= length) {
    return `${text.slice(0, length)}...`;
  }

  return text;
};
