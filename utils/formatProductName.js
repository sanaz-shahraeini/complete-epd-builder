export function formatProductName(name) {
  if (!name) return "";
  let clean = name.replace(/^zehnder-/i, "");
  clean = clean.replace(/-/g, " ");
  return clean.replace(/\b\w/g, (c) => c.toUpperCase());
} 