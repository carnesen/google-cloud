import { Asset } from './asset';

describe(__filename, () => {
  it('gcloud runs the gcloud cli', async () => {
    class Foo extends Asset {
      constructor() {
        super({ projectId: 'foo', description: 'bar', name: 'baz' });
      }
      public async testGcloud() {
        const result = await this.gcloud({
          cwd: '.',
          args: ['version'],
        });
        expect(result['Google Cloud SDK']).toMatch(/.*\..*\..*/);
      }
    }
    const foo = new Foo();
    await foo.testGcloud();
  });
});
