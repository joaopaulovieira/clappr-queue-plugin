module.exports = {
  verbose: true,
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.html$': '<rootDir>/src/__mocks__/htmlMock.js',
  },
  moduleNameMapper: { '\\.(scss)$': '<rootDir>/src/__mocks__/styleMock.js' },
  collectCoverageFrom: ['src/*.js'],
}
