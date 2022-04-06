const sidebar = require('./sidebar');

module.exports = {
	title: 'React with RxJS',
	base: '/react-with-rxjs-docs/',
	themeConfig: {
		repo: 'samuel-carnell/react-with-rxjs',
		editLinks: false,
		nav: [
			{ text: 'Guide', link: '/guide/motivation' },
			{ text: 'API', link: '/api/bind-hook' },
			{ text: 'Examples', link: '/examples/users-table' },
			{ text: 'Upgrading from v1', link: '/upgrading-from-v1' },
			{ text: 'Changelog', link: '/changelog' },
		],
		sidebar: sidebar,
		sidebarDepth: 0,
	},
};
