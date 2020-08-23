import { promisify } from 'util';
import { writeFile } from 'fs';
import { basename, join } from 'path';
import { Asset } from '../asset';

type Props = {
	packageDir: string;
};

const fileName = '.gcloudignore';
const fileContents = `
node_modules/
`;

export class AppEngineIgnoreFile extends Asset<Props> {
	public get name(): string {
		return basename(this.props.packageDir);
	}

	public async create(): Promise<void> {
		this.log.creating();
		await promisify(writeFile)(
			join(this.props.packageDir, fileName),
			fileContents,
		);
		this.log.created();
	}

	public async destroy(): Promise<void> {
		this.log.destroying();
		// TODO
		this.log.destroyed();
	}
}
