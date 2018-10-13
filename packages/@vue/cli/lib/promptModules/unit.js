module.exports = cli => {
  cli.injectFeature({
    name: 'Unit Testing',
    value: 'unit',
    short: 'Unit',
    description: '添加一个单元测试解决方案，例如Jest或者Mocha',
    link: 'https://cli.vuejs.org/config/#unit-testing',
    plugins: ['unit-jest', 'unit-mocha']
  })

  cli.injectPrompt({
    name: 'unit',
    when: answers => answers.features.includes('unit'),
    type: 'list',
    message: 'Pick a unit testing solution:',
    choices: [
      {
        name: 'Mocha + Chai',
        value: 'mocha',
        short: 'Mocha'
      },
      {
        name: 'Jest',
        value: 'jest',
        short: 'Jest'
      }
    ]
  })

  cli.onPromptComplete((answers, options) => {
    if (answers.unit === 'mocha') {
      options.plugins['@vue/cli-plugin-unit-mocha'] = {}
    } else if (answers.unit === 'jest') {
      options.plugins['@vue/cli-plugin-unit-jest'] = {}
    }
  })
}
