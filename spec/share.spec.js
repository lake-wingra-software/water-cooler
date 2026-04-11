const fs = require("fs");
const os = require("os");
const path = require("path");

const { expandShares } = require("../src/share");

describe("expandShares", () => {
  let workspace;

  beforeEach(() => {
    workspace = fs.mkdtempSync(path.join(os.tmpdir(), "share-spec-"));
  });

  afterEach(() => {
    fs.rmSync(workspace, { recursive: true, force: true });
  });

  it("returns message unchanged when there are no share tags", () => {
    expect(expandShares("hello there", workspace)).toEqual("hello there");
  });

  it("inlines file contents for a share tag", () => {
    fs.writeFileSync(path.join(workspace, "foo.md"), "bar baz");
    const out = expandShares("check <share>foo.md</share>", workspace);
    expect(out).toContain("bar baz");
    expect(out).toContain('file="foo.md"');
    expect(out).not.toMatch(/<share>foo\.md<\/share>/);
  });

  it("leaves tag literal when file is missing", () => {
    const out = expandShares("<share>nope.md</share>", workspace);
    expect(out).toContain("<share>nope.md</share>");
  });

  it("expands multiple share tags", () => {
    fs.writeFileSync(path.join(workspace, "a.md"), "alpha");
    fs.writeFileSync(path.join(workspace, "b.md"), "beta");
    const out = expandShares(
      "first <share>a.md</share> then <share>b.md</share>",
      workspace,
    );
    expect(out).toContain("alpha");
    expect(out).toContain("beta");
  });

  it("leaves tag literal when filename escapes workspace", () => {
    const out = expandShares("<share>../outside.md</share>", workspace);
    expect(out).toContain("<share>../outside.md</share>");
  });
});
