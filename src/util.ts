import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export function consoleLog(...args: Parameters<typeof console.log>): void {
	if (process.env.NODE_ENV !== 'test') {
		console.log(...args); // eslint-disable-line no-console
	}
}

export async function getGitHash(cwd?: string): Promise<string> {
	const { stdout } = await execFileAsync(
		'git',
		['rev-parse', '--short=10', 'HEAD'],
		{
			encoding: 'utf8',
			cwd,
		},
	);
	return stdout.replace(/\n/g, '');
}

export function removeTrailingDot(str: string): string {
	return str.replace(/\.$/, '');
}

export function addTrailingDot(s: string): string {
	return s.slice(-1) === '.' ? s : `${s}.`;
}
