import { promisify } from 'util';
import { execFile } from 'child_process';
import { loggerFactory } from './logger-factory';

export type Context = {
	projectId: string;
	requireResolve: typeof require.resolve;
};

/** Options for instantiating an {@link Asset} */
export interface AssetOptions<Props> {
	context: Context;
	props: Props;
}

/** A Google Cloud asset such as an App Engine App or a Cloud DNS Zone */
export abstract class Asset<Props> implements AssetOptions<Props> {
	public readonly context: Context;

	public readonly props: Props;

	public readonly logger = loggerFactory(this);

	public constructor(options: AssetOptions<Props>) {
		this.context = options.context;
		this.props = options.props;
	}

	public abstract get name(): string;

	/** Factory method for creating a new {@link Asset} with the same
	 * {@link Context} as this one */
	public assetFactory<NewProps, NewAsset>(
		Cls: {
			new (options: AssetOptions<NewProps>): NewAsset;
		},
		props: NewProps,
	): NewAsset {
		return new Cls({ context: this.context, props });
	}

	/** Run the `gcloud` CLI as a child process */
	public async gcloud(options: { cwd?: string; args: string[] }): Promise<any> {
		const defaultArgs = [
			`--project=${this.context.projectId}`,
			'--quiet',
			'--format=json',
		];
		const allArgs = [...defaultArgs, ...options.args];
		const { stdout } = await promisify(execFile)('gcloud', allArgs, {
			cwd: options.cwd,
		});
		if (!stdout) {
			return {};
		}
		return JSON.parse(stdout);
	}
}
