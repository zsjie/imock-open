import eslint from '@eslint/js'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tsEslint from 'typescript-eslint'

export default [
    eslint.configs.recommended,
    ...tsEslint.configs.recommended,

    {
        plugins: {
            // add plugins here
            'simple-import-sort': simpleImportSort,
        },
        rules: {
            // override/add rules settings here, such as:
            indent: ['error', 4],
            'simple-import-sort/imports': 2,
            'linebreak-style': ['error', 'unix'],
            quotes: ['error', 'single'],
            semi: ['error', 'never'],
            camelcase: 2,
        },
    },
]
