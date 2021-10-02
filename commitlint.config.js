const commitReleaseRules = require('./commit-release-rules');

const commitTypes = commitReleaseRules
	.filter((commitRule) => commitRule.type)
	.map((commitRule) => commitRule.type);

module.exports = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'type-enum': [2, 'always', commitTypes],
		'body-max-line-length': [1, 'always', 100],
		'header-max-length': [1, 'always', 100],
		'body-empty': [2, 'never'],
	},
};
