import { errorLikeFactory } from '@carnesen/error-like';
import { Asset } from '../asset';

type Props = null;

export class AppEngine extends Asset<Props> {
	public get name(): string {
		return this.context.projectId;
	}

	public async create(): Promise<void> {
		this.logger.creating();
		try {
			// TODO: Parameterize "region"
			await this.gcloud({
				args: ['app', 'create', `--region=us-central`],
			});
			this.logger.created();
		} catch (exception) {
			const errorLike = errorLikeFactory(exception);
			if (!errorLike.message.includes('already contains')) {
				throw exception;
			}
			this.logger.alreadyCreated();
		}
	}
}
