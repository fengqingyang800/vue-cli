module.exports = class PromptModuleAPI {
  constructor (creator) {
    this.creator = creator
  }
  // 注入特性
  injectFeature (feature) {
    this.creator.featurePrompt.choices.push(feature)
  }
  // 注入提示
  injectPrompt (prompt) {
    this.creator.injectedPrompts.push(prompt)
  }
  // 为提示注入选项
  injectOptionForPrompt (name, option) {
    this.creator.injectedPrompts.find(f => {
      return f.name === name
    }).choices.push(option)
  }
  // 提示完成时才做
  onPromptComplete (cb) {
    this.creator.promptCompleteCbs.push(cb)
  }
}
