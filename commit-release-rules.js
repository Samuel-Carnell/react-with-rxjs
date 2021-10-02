module.exports = [
	{ type: 'chore', release: false },
	{ type: 'ci', release: false },
	{ type: 'style', release: false },
	{ type: 'docs', release: false },
	{ type: 'test', release: false },
	{ type: 'deps', release: false },
	{ type: 'fix', release: 'patch' },
	{ type: 'refactor', release: 'patch' },
	{ type: 'perf', release: 'patch' },
	{ type: 'revert', release: 'patch' },
	{ type: 'feat', release: 'minor' },
	{ exclamation: '!', release: 'major' },
];
