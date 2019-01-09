import { getGitHash, removeTrailingDot, addTrailingDot } from './util';

describe(__filename, () => {
  it('getGitHash returns a ten-character hash', async () => {
    const gitHash = await getGitHash();
    const hexCharsRegex = /[a-f0-9][10]/;
    expect(gitHash).toMatch(hexCharsRegex);
  });

  it('removeTrailingDot removes a trailing dot', async () => {
    expect(removeTrailingDot('.foo.')).toEqual('.foo');
    expect(removeTrailingDot('.foo')).toEqual('.foo');
  });

  it('addTrailingDot removes a trailing dot', async () => {
    expect(addTrailingDot('.foo')).toEqual('.foo.');
    expect(addTrailingDot('.foo.')).toEqual('.foo.');
  });
});
