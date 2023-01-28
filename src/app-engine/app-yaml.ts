import { promisify } from 'util';
import { writeFile } from 'fs';
import { dump } from 'js-yaml';
import { join, basename } from 'path';
import { Asset } from '../asset';

type Props = {
	packageDir: string;
	config: any;
};

export class AppEngineAppYaml extends Asset<Props> {
	public get name(): string {
		return basename(this.props.packageDir);
	}

	public async create(): Promise<void> {
		const { packageDir, config } = this.props;
		this.logger.creating();
		await promisify(writeFile)(join(packageDir, 'app.yaml'), dump(config));
		this.logger.created();
	}

	public async deploy(): Promise<void> {
		this.logger.deploying();
		await this.gcloud({
			args: ['app', 'deploy'],
			cwd: this.props.packageDir,
		});
		this.logger.deployed();
	}

	public async destroy(): Promise<void> {
		this.logger.destroying();
		// TODO
		this.logger.destroyed();
	}
}
