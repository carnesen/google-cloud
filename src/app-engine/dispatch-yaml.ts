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
		this.logger.creating();
		await promisify(writeFile)(fileName, dump({ dispatch: this.props.config }));
		this.logger.created();
	}

	public async deploy(): Promise<void> {
		this.logger.deploying();
		await this.gcloud({ args: ['app', 'deploy', fileName] });
		this.logger.deployed();
	}

	public async destroy(): Promise<void> {
		this.logger.destroying();
		// TODO
		this.logger.destroyed();
	}
}
