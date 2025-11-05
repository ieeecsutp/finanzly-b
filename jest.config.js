module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>'],
    testMatch: ['**/tests/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/index.ts',
    ],
    testTimeout: 15000,
    // Global setup/teardown para migraciones
    globalSetup: '<rootDir>/tests/globalSetup.ts',
    globalTeardown: '<rootDir>/tests/globalTeardown.ts',
    // Solo ejecutar setup/teardown para pruebas de integración
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
