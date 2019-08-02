// https://eslint.org/docs/user-guide/configuring

module.exports = {
    root: true,
    parserOptions: {
        parser: 'babel-eslint'
    },
    env: {
        browser: true
    },
    extends: [
        // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
        // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
        'plugin:vue/essential',
        // https://github.com/standard/standard/blob/master/docs/RULES-en.md
        'standard'
    ],
    // required to lint *.vue files
    plugins: ['vue'],
    // add your custom rules here
    rules: {
        // 标签形式缩进
        // SwitchCase:1 时 自定义设置 
        // 2：2个缩进空间
        // 4：缩进的空格数
        // 缩进
        // 'indent': [2, 4, { SwitchCase: 1 }],
        // 文件末尾强制换行
        'eol-last': 0,
        // 设置function小括号前边没有空格，也不要报错
        'space-before-function-paren': ['error', 'never'],
        // allow async-await
        'generator-star-spacing': 'off',
        // allow debugger during development
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
    }
}
