const key = import.meta.env.VITE_KEY;

export function encrypt(text) {
  const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
  const byteHex = (n) => ("0" + Number(n).toString(16)).substr(-2);
  const keyChars = textToChars(key);
  return text
    .split("")
    .map((c, i) => c.charCodeAt(0) ^ keyChars[i % keyChars.length])
    .map(byteHex)
    .join("");
}

export function decrypt(encoded) {
  const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
  const keyChars = textToChars(key);
  return encoded
    .match(/.{1,2}/g)
    .map((hex, i) =>
      String.fromCharCode(parseInt(hex, 16) ^ keyChars[i % keyChars.length])
    )
    .join("");
}
