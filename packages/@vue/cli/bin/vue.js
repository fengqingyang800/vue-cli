#!/usr/bin/env node

// Check node version before requiring/doing anything else
// The user may be on a very old node version

const chalk = require('chalk')
// 语义化版本控制 https://semver.org/lang/zh-CN/
const semver = require('semver')
// 需要兼容的node最低版本
const requiredVersion = require('../package.json').engines.node

// 检测node的版本，如果node版本不符合给出提示，直接退出，satisfies - 满足
function checkNodeVersion (wanted, id) {
  // 如果本地安装的版本不满足要求，则给出警告退出
  if (!semver.satisfies(process.version, wanted)) {
    console.log(chalk.red(
      'You are using Node ' + process.version + ', but this version of ' + id +
      ' requires Node ' + wanted + '.\nPlease upgrade your Node version.'
    ))
    process.exit(1)
  }
}

checkNodeVersion(requiredVersion, 'vue-cli')

// 满足了继续向下走
const fs = require('fs')
const path = require('path')
// slash 将Windows的反斜线转化为Unix类型的斜线
// 转化前 Unix => foo/bar  Window => foo\\bar
// 转化后 Unix => foo/bar  Windiw => foo/bar
const slash = require('slash')
// 命令行参数解析工具，optimist的简化版 https://github.com/substack/minimist
const minimist = require('minimist')

// enter debug mode when creating test repo
if (
  slash(process.cwd()).indexOf('/packages/test') > 0 && (
    fs.existsSync(path.resolve(process.cwd(), '../@vue')) ||
    fs.existsSync(path.resolve(process.cwd(), '../../@vue'))
  )
) {
  process.env.VUE_CLI_DEBUG = true
}

// 命令行工具 https://github.com/tj/commander.js#readme TJ大神
const program = require('commander')
const loadCommand = require('../lib/util/loadCommand')

program
  // 声明下版本 -V --version
  .version(require('../package').version)
  // 设置使用方法，输出内容
  .usage('<command> [options]')

// 创建工程命令
program
  .command('create <app-name>')
  .description('通过 vue-cli-service 创建一个新的工程')
  .option('-p, --preset <presetName>', '忽略提示符并使用已保存的或远程的预设选项')
  .option('-d, --default', '忽略提示符并使用默认预设选项')
  .option('-i, --inlinePreset <json>', '忽略提示符并使用内联的 JSON 字符串预设选项')
  .option('-m, --packageManager <command>', '在安装依赖时使用指定的 npm 客户端')
  .option('-r, --registry <url>', '在安装依赖时使用指定的 npm registry (仅用于 npm 客户端)')
  .option('-g, --git [message]', '强制 / 跳过 git 初始化，并可选的指定初始化提交信息')
  .option('-n, --no-git', '跳过git初始化')
  .option('-f, --force', '覆写目标目录可能存在的配置')
  .option('-c, --clone', '使用 git clone 获取远程预设选项')
  .option('-x, --proxy', '使用指定的代理创建项目')
  .option('-b, --bare', '创建项目时省略默认组件中的新手指导信息')
  // 为命令注册回调函数
  .action((name, cmd) => {
    const options = cleanArgs(cmd)
    // --no-git makes commander to default git to true
    if (process.argv.includes('-g') || process.argv.includes('--git')) {
      options.forceGit = true
    }
    require('../lib/create')(name, options)
  })

program
  .command('add <plugin> [pluginOptions]')
  .description('在一个已经创建的项目中添加一个插件并且调用该插件的生成器')
  .allowUnknownOption()
  .action((plugin) => {
    require('../lib/add')(plugin, minimist(process.argv.slice(3)))
  })

program
  .command('invoke <plugin> [pluginOptions]')
  .description('在已经创建的项目中调用已经存在的插件的生成器')
  .allowUnknownOption()
  .action((plugin) => {
    require('../lib/invoke')(plugin, minimist(process.argv.slice(3)))
  })

program
  .command('inspect [paths...]')
  .description('inspect the webpack config in a project with vue-cli-service')
  .option('--mode <mode>')
  .option('--rule <ruleName>', 'inspect a specific module rule')
  .option('--plugin <pluginName>', 'inspect a specific plugin')
  .option('--rules', 'list all module rule names')
  .option('--plugins', 'list all plugin names')
  .option('-v --verbose', 'Show full function definitions in output')
  .action((paths, cmd) => {
    require('../lib/inspect')(paths, cleanArgs(cmd))
  })

program
  .command('serve [entry]')
  .description('serve a .js or .vue file in development mode with zero config')
  .option('-o, --open', 'Open browser')
  .option('-c, --copy', 'Copy local url to clipboard')
  .action((entry, cmd) => {
    loadCommand('serve', '@vue/cli-service-global').serve(entry, cleanArgs(cmd))
  })

program
  .command('build [entry]')
  .description('build a .js or .vue file in production mode with zero config')
  .option('-t, --target <target>', 'Build target (app | lib | wc | wc-async, default: app)')
  .option('-n, --name <name>', 'name for lib or web-component mode (default: entry filename)')
  .option('-d, --dest <dir>', 'output directory (default: dist)')
  .action((entry, cmd) => {
    loadCommand('build', '@vue/cli-service-global').build(entry, cleanArgs(cmd))
  })

program
  .command('ui')
  .description('start and open the vue-cli ui')
  .option('-p, --port <port>', 'Port used for the UI server (by default search for available port)')
  .option('-D, --dev', 'Run in dev mode')
  .option('--quiet', `Don't output starting messages`)
  .option('--headless', `Don't open browser on start and output port`)
  .action((cmd) => {
    checkNodeVersion('>=8.6', 'vue ui')
    require('../lib/ui')(cleanArgs(cmd))
  })

program
  .command('init <template> <app-name>')
  .description('generate a project from a remote template (legacy API, requires @vue/cli-init)')
  .option('-c, --clone', 'Use git clone when fetching remote template')
  .option('--offline', 'Use cached template')
  .action(() => {
    loadCommand('init', '@vue/cli-init')
  })

program
  .command('config [value]')
  .description('inspect and modify the config')
  .option('-g, --get <path>', 'get value from option')
  .option('-s, --set <path> <value>', 'set option value')
  .option('-d, --delete <path>', 'delete option from config')
  .option('-e, --edit', 'open config with default editor')
  .option('--json', 'outputs JSON result only')
  .action((value, cmd) => {
    require('../lib/config')(value, cleanArgs(cmd))
  })

// 对不认识的命令输出帮助文件
program
  .arguments('<command>')
  .action((cmd) => {
    program.outputHelp()
    console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`))
    console.log()
  })

// add some useful info on help
program.on('--help', () => {
  console.log()
  console.log(`  Run ${chalk.cyan(`vue <command> --help`)} for detailed usage of given command.`)
  console.log()
})

program.commands.forEach(c => c.on('--help', () => console.log()))

// enhance common error messages
const enhanceErrorMessages = require('../lib/util/enhanceErrorMessages')

enhanceErrorMessages('missingArgument', argName => {
  return `Missing required argument ${chalk.yellow(`<${argName}>`)}.`
})

enhanceErrorMessages('unknownOption', optionName => {
  return `Unknown option ${chalk.yellow(optionName)}.`
})

enhanceErrorMessages('optionMissingArgument', (option, flag) => {
  return `Missing required argument for option ${chalk.yellow(option.flags)}` + (
    flag ? `, got ${chalk.yellow(flag)}` : ``
  )
})

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}

/**
 * cmd对象中的一个命令和自定义的命令冲突，则保存这个命令
 * */
function cleanArgs (cmd) {
  const args = {}
  cmd.options.forEach(o => {
    const key = o.long.replace(/^--/, '')
    // if an option is not present and Command has a method with the same name
    // it should not be copied
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key]
    }
  })
  return args
}
