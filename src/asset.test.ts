import { Asset } from './asset';

describe(__filename, () => {
  it('gcloud runs the gcloud cli', async () => {
    class Foo extends Asset<null> {
      public async testGcloud() {
        const result = await this.gcloud({
          cwd: '.',
          args: ['version'],
        });
        expect(result['Google Cloud SDK']).toMatch(/.*\..*\..*/);
      }
    }
    const foo = new Foo({
      context: { projectId: 'foo' },
      props: null,
    });
    await foo.testGcloud();
  });
});
