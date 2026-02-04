module.exports = {
  root: true,
  extends: ['universe/native', 'universe/shared/typescript', 'prettier'],
  parserOptions: {
    ecmaVersion: 2021,
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
  },
};
