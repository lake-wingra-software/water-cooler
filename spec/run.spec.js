const { execFileSync } = require('child_process');
const path = require('path');

describe('run.js', () => {
  it('completes without errors', () => {
    const result = execFileSync('node', [path.join(__dirname, '..', 'run.js')], {
      encoding: 'utf8'
    });
    expect(result).toContain('workday ended');
  });
});
