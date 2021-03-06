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
		this.log.creating();
		await promisify(writeFile)(join(packageDir, 'app.yaml'), dump(config));
		this.log.created();
	}

	public async deploy(): Promise<void> {
		this.log.deploying();
		await this.gcloud({
			args: ['app', 'deploy'],
			cwd: this.props.packageDir,
		});
		this.log.deployed();
	}

	public async destroy(): Promise<void> {
		this.log.destroying();
		// TODO
		this.log.destroyed();
	}
}
