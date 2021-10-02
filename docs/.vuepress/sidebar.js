module.exports = {
	'/api/': [
		{
			title: 'Hooks',
			sidebarDepth: 0,
			children: [
				'/api/hooks/use-observable',
				'/api/hooks/use-is-complete',
				'/api/hooks/use-latest-value',
				'/api/hooks/use-subscription',
				'/api/hooks/use-state-observable',
				'/api/hooks/use-event-observable',
				'/api/hooks/use-observable-of',
			],
		},
	],
	'/guide/': [
		{
			title: 'Guide',
			sidebarDepth: 1,
			children: ['/guide/installation', '/guide/core-concepts'],
		},
	],
	'/': 'auto',
};
