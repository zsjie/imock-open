// @ts-check

import eslint from '@eslint/js'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
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
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    'args': 'all',
                    'argsIgnorePattern': '^_',
                    'caughtErrors': 'all',
                    'caughtErrorsIgnorePattern': '^_',
                    'destructuredArrayIgnorePattern': '^_',
                    'varsIgnorePattern': '^_',
                    'ignoreRestSiblings': true
                }
            ]
        },
    }
)
