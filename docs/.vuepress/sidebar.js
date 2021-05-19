module.exports = {
	'/api/': [
		{
			title: 'Hooks',
			sidebarDepth: 0,
			children: [
				'/api/hooks/use-event-observable',
				'/api/hooks/use-observable-state',
				'/api/hooks/use-state-observable',
				'/api/hooks/use-subject',
				'/api/hooks/use-value-observable',
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
};
