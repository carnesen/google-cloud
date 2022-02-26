import { promisify } from 'util';
import { execFile } from 'child_process';
import { echo } from './util';

export type Context = {
	projectId: string;
	requireResolve: typeof require.resolve;
};

export interface AssetOptions<P> {
	context: Context;
	props: P;
}

const logFactory = (instance: {
	name: string;
	constructor: { name: string };
}) => {
	const e = (message: string) => () =>
		echo(`${instance.constructor.name} : ${instance.name} : ${message}`);

	return {
		info: (message: string) => e(message)(),
		creating: e('Creating...'),
		created: e('Created'),
		alreadyCreated: e('Already exists'),
		maybeCreated: e('Maybe created'),
		deploying: e('Deploying...'),
		deployed: e('Deployed'),
		destroying: e('Destroying...'),
		destroyed: e('Destroyed'),
		alreadyDestroyed: e('Does not exist'),
		maybeDestroyed: e('Maybe destroyed'),
	};
};

export class Asset<Props> implements AssetOptions<Props> {
	public readonly context: Context;

	public readonly props: Props;

	public readonly log: ReturnType<typeof logFactory>;

	public constructor(options: AssetOptions<Props>) {
		this.context = options.context;
		this.props = options.props;
		this.log = logFactory(this);
	}

	/* eslint-disable class-methods-use-this */
	public get name(): string {
		return '"name" getter should be overridden by subclass';
	}
	/* eslint-enable class-methods-use-this */

	public factory<P, A>(
		Ctor: {
			new (options: AssetOptions<P>): A;
		},
		props: P,
	): A {
		return new Ctor({ context: this.context, props });
	}

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
