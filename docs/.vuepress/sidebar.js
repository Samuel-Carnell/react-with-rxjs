module.exports = {
	'/api/': [
		{
			title: 'API',
			sidebarDepth: 0,
			children: ['/api/bind-hook'],
		},
	],
	'/guide/': [
		{
			title: 'Guide',
			sidebarDepth: 1,
			children: [
				'/guide/installation',
				'/guide/motivation',
				'/guide/optimized-renders',
			],
		},
	],
	'/examples/': [
		{
			title: 'Examples',
			sidebarDepth: 1,
			children: ['/examples/users-table', '/examples/product-navigation'],
		},
	],
	'/': 'auto',
};
