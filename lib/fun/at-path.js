function atPath(path) {
  return path
    .split(/[.[]/)
    .filter(Boolean)
    .map((token) => (token.endsWith(']') ? `[${token}` : token));
}

module.exports = { atPath };
