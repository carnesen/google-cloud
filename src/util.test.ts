import { getGitHash } from './util';

describe(__filename, () => {
  it('getGitHash returns a ten-character hash', () => {
    const gitHash = getGitHash();
    const hexCharsRegex = /[a-f0-9][10]/;
    expect(gitHash).toMatch(hexCharsRegex);
    console.log(gitHash);
  });
});
