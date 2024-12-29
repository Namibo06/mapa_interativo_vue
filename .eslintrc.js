module.exports = {
    globals: {
      process: 'readonly',
      google: 'readonly',
    },
  
    extends: [
      'plugin:vue/vue3-essential',
      'eslint:recommended', 
    ],
  
    parser: 'vue-eslint-parser', 
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: false,
      },
    },
  
    plugins: ['vue'],
  
    overrides: [
      {
        files: ['**/*.vue'],
        parserOptions: {
          parser: 'babel-eslint', 
        },
      },
    ],
  };
  