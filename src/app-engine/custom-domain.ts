import { errorLikeFactory } from '@carnesen/error-like';
import { removeTrailingDot, addTrailingDot } from '../util';
import { Asset } from '../asset';

type Props = {
	dnsName: string;
};

export class AppEngineCustomDomain extends Asset<Props> {
	public get name(): string {
		return this.props.dnsName;
	}

	public async create(): Promise<void> {
		this.logger.creating();
		try {
			await this.gcloud({
				args: [
					'app',
					'domain-mappings',
					'create',
					removeTrailingDot(this.props.dnsName),
				],
			});
			this.logger.created();
		} catch (exception) {
			const errorLike = errorLikeFactory(exception);
			if (!errorLike.message.includes('already exists')) {
				throw exception;
			} else {
				this.logger.alreadyCreated();
			}
		}
	}

	public async getResourceRecords(): Promise<
		{
			type: string;
			rrdata: string;
		}[]
	> {
		const description = await this.gcloud({
			args: [
				'app',
				'domain-mappings',
				'describe',
				removeTrailingDot(this.props.dnsName),
			],
		});

		const appResourceRecords: { rrdata: string; type: string }[] =
			description.resourceRecords;

		const resourceRecords = appResourceRecords.map(({ rrdata, type }) => ({
			type,
			rrdata: type === 'CNAME' ? addTrailingDot(rrdata) : rrdata,
		}));
		return resourceRecords;
	}
}
