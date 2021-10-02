const commitReleaseRules = require('./commit-release-rules');
const path = require('path');
const fs = require('fs');

const commitParserOptions = {
	headerPattern: /^(\w*)(?:\(([\w\$\.\-\* ]*)\))?(\!)?\: (.*)$/,
	headerCorrespondence: ['type', 'scope', 'exclamation', 'subject'],
	noteKeywords: ['BREAKING CHANGE'],
	revertPattern: /^(?:Revert|revert:)\s"?([\s\S]+?)"?\s*This reverts commit (\w*)\./i,
	revertCorrespondence: ['header', 'hash'],
};

module.exports = {
	branches: ['main'],
	plugins: [
		[
			'@semantic-release/commit-analyzer',
			{
				releaseRules: commitReleaseRules,
				parserOpts: commitParserOptions,
			},
		],
		[
			'@semantic-release/release-notes-generator',
			{
				preset: 'conventionalcommits',
				parserOpts: commitParserOptions,
				writerOpts: {
					headerPartial: fs.readFileSync(
						path.resolve(__dirname, './changelog/templates/header.hbs'),
						'utf-8'
					),
				},
			},
		],
		[
			'@semantic-release/changelog',
			{
				changelogTitle: '# Changelog',
				changelogFile: 'docs/CHANGELOG.md',
			},
		],
		[
			'@semantic-release/exec',
			{
				prepareCmd: 'yarn build',
			},
		],
		[
			'@semantic-release/npm',
			{
				pkgRoot: 'dist',
			},
		],
		[
			'@semantic-release/git',
			{
				assets: ['dist/**', 'docs/CHANGELOG.md', 'package.json'],
				message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
			},
		],
	],
};
