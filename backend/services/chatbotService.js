exports.processMessage = (text) => {
  if (text.includes("price")) return "PRICE";
  if (text.includes("order")) return "ORDER";
  return "UNKNOWN";
};
