export function createStateHasher() {
  let hash = 0x811c9dc5;
  return {
    add(value) {
      const rounded = Math.round(value * 1000);
      hash ^= rounded & 0xff;
      hash = Math.imul(hash, 0x01000193);
      hash ^= (rounded >>> 8) & 0xff;
      hash = Math.imul(hash, 0x01000193);
      hash ^= (rounded >>> 16) & 0xff;
      hash = Math.imul(hash, 0x01000193);
    },
    digest() {
      return (hash >>> 0).toString(16).padStart(8, "0");
    }
  };
}
