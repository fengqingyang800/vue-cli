module.exports = cli => {
  // 注入Babel特性
  cli.injectFeature({
    name: 'Babel',
    value: 'babel',
    short: 'Babel',
    description: '将modern版本的js转化程=成老版本的js(兼容性)',
    link: 'https://babeljs.io/',
    checked: true
  })

  cli.onPromptComplete((answers, options) => {
    if (answers.features.includes('ts')) {
      if (!answers.useTsWithBabel) {
        return
      }
    } else {
      if (!answers.features.includes('babel')) {
        return
      }
    }
    options.plugins['@vue/cli-plugin-babel'] = {}
  })
}
