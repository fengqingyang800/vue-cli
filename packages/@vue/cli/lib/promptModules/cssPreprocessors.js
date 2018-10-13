module.exports = cli => {
  cli.injectFeature({
    name: 'CSS Pre-processors',
    value: 'css-preprocessor',
    description: '添加对CSS预处理器（Sass、Less 和 Stylus的支持）',
    link: 'https://cli.vuejs.org/guide/css.html'
  })

  const notice = 'PostCSS, Autoprefixer and CSS Modules are supported by default'

  cli.injectPrompt({
    name: 'cssPreprocessor',
    when: answers => answers.features.includes('css-preprocessor'),
    type: 'list',
    message: `Pick a CSS pre-processor${process.env.VUE_CLI_API_MODE ? '' : ` (${notice})`}:`,
    description: `${notice}.`,
    choices: [
      {
        name: 'Sass/SCSS',
        value: 'sass'
      },
      {
        name: 'Less',
        value: 'less'
      },
      {
        name: 'Stylus',
        value: 'stylus'
      }
    ]
  })

  cli.onPromptComplete((answers, options) => {
    if (answers.cssPreprocessor) {
      options.cssPreprocessor = answers.cssPreprocessor
    }
  })
}
