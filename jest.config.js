module.exports = {
	globals: {
		'ts-jest': {
			tsconfig: './tsconfig.test.json',
		},
	},
	preset: 'ts-jest',
	moduleFileExtensions: ['ts', 'tsx', 'js'],
	moduleDirectories: ['<rootDir>/src', 'node_modules'],
	transformIgnorePatterns: ['/node_modules/'],
	moduleNameMapper: {
		'\\.(css|less|scss|sass)$': 'identity-obj-proxy',
	},
	setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
	collectCoverageFrom: ['src/**/!(index)*.{js,jsx,ts,tsx}', '!<rootDir>/node_modules/'],
	coverageThreshold: {
		global: {
			branches: 95,
			functions: 95,
			lines: 95,
			statements: 95,
		},
	},
	coverageReporters: ['text'],
};
