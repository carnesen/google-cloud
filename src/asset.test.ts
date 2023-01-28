import { Asset } from './asset';

const TEN_SECONDS = 10000;

describe(__filename, () => {
	it(
		'gcloud runs the gcloud cli',
		async () => {
			class Foo extends Asset<{ name: string }> {
				public get name(): string {
					return this.props.name;
				}

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
				props: { name: 'carnesen' },
			});
			await foo.testGcloud();
		},
		TEN_SECONDS,
	);
});
