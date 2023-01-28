import { consoleLog } from './util';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function loggerFactory(instance: {
	name: string;
	constructor: { name: string };
}) {
	function echoFactory(message: string) {
		return function echoWithClassAndInstanceName() {
			consoleLog(
				`${new Date().toISOString()} ${instance.constructor.name} : ${
					instance.name
				} : ${message}`,
			);
		};
	}
	return {
		info: (message: string) => echoFactory(message)(),
		creating: echoFactory('Creating...'),
		created: echoFactory('Created'),
		alreadyCreated: echoFactory('Already exists'),
		maybeCreated: echoFactory('Maybe created'),
		deploying: echoFactory('Deploying...'),
		deployed: echoFactory('Deployed'),
		destroying: echoFactory('Destroying...'),
		destroyed: echoFactory('Destroyed'),
		alreadyDestroyed: echoFactory('Does not exist'),
		maybeDestroyed: echoFactory('Maybe destroyed'),
	};
}
