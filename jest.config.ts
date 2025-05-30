import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  // 排除 vocabulary 目录不计入测试覆盖率统计
  coveragePathIgnorePatterns: ['/node_modules/', '/src/vocabulary/'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  verbose: true,
};

export default config;
