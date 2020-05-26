import { Asset } from './asset';

const TEN_SECONDS = 10000;

describe(__filename, () => {
  it(
    'gcloud runs the gcloud cli',
    async () => {
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
        context: { projectId: 'foo', requireResolve: require.resolve },
        props: null,
      });
      await foo.testGcloud();
    },
    TEN_SECONDS,
  );
});
