// jest.config.js

export default {
    transform: {},
    // moduleNameMapper: {
    //     '^(\\.{1,2}/.*)\\.js$': '$1'
    // },
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.js'],
    verbose: true,
    testTimeout: 30000,
    setupFilesAfterEnv: ['./setup.js'],
};
