const sidebar = require('./sidebar');

module.exports = {
	title: 'React with RxJS',
	base: '/react-with-rxjs-docs/',
	themeConfig: {
		repo: 'samuel-carnell/react-with-rxjs',
		editLinks: false,
		nav: [
			{ text: 'Guide', link: '/guide/core-concepts' },
			{ text: 'API', link: '/api/hooks/use-observable' },
			{ text: 'Changelog', link: '/changelog' },
		],
		sidebar: sidebar,
		sidebarDepth: 0,
	},
};
