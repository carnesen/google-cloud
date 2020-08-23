import { promisify } from 'util';
import { writeFile } from 'fs';
import { dump } from 'js-yaml';
import { Asset } from '../asset';

type Props = {
	config: any;
};

const fileName = 'dispatch.yaml';

export class AppEngineDispatchYaml extends Asset<Props> {
	public get name(): string {
		return this.context.projectId;
	}

	public async create(): Promise<void> {
		this.log.creating();
		await promisify(writeFile)(fileName, dump({ dispatch: this.props.config }));
		this.log.created();
	}

	public async deploy(): Promise<void> {
		this.log.deploying();
		await this.gcloud({ args: ['app', 'deploy', fileName] });
		this.log.deployed();
	}

	public async destroy(): Promise<void> {
		this.log.destroying();
		// TODO
		this.log.destroyed();
	}
}
