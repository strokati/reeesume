import type { UserConfig } from '@commitlint/types';

const config: UserConfig = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		// Enforce these types only
		'type-enum': [2, 'always', ['feat', 'fix', 'chore', 'refactor', 'style', 'docs', 'test', 'ci', 'revert']],
		// Subject line max length
		'header-max-length': [2, 'always', 100],
		// No full stop at end of subject
		'subject-full-stop': [2, 'never', '.'],
		// Lower-case subject
		'subject-case': [2, 'always', 'lower-case'],
	},
};

export default config;
