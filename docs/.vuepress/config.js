const sidebar = require('./sidebar');

module.exports = {
	title: 'ReactXJS',
	base: '/reactxjs-docs/',
	themeConfig: {
		repo: 'samuel-carnell/reactxjs',
		editLinks: false,
		nav: [
			{ text: 'Guide', link: '/guide/core-concepts' },
			{ text: 'API', link: '/api/hooks/use-state-observable' },
		],
		sidebar: sidebar,
	},
};
