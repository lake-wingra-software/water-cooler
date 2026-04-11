const fs = require("fs");
const path = require("path");

const SHARE_TAG = /<share>([^<]+)<\/share>/g;

function expandShares(message, workspacePath) {
  const resolvedWorkspace = path.resolve(workspacePath);
  return message.replace(SHARE_TAG, (match, raw) => {
    const filename = raw.trim();
    const fullPath = path.resolve(resolvedWorkspace, filename);
    if (!fullPath.startsWith(resolvedWorkspace + path.sep)) return match;
    try {
      const content = fs.readFileSync(fullPath, "utf8");
      return `<share file="${filename}">\n${content.trim()}\n</share>`;
    } catch {
      return match;
    }
  });
}

module.exports = { expandShares };
