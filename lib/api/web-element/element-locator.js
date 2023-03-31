const {By, RelativeBy} = require('selenium-webdriver');

const Utils = require('../../utils');
const Element = require('../../element/index.js');
const Locator = require('../../element/locator.js');

class ElementLocator {
  constructor(selector, options = {}) {
    this.index = ElementLocator.getOrDefault(selector, 'index', 0);
    this.timeout = ElementLocator.getOrDefault(selector, 'timeout', options.waitForConditionTimeout);
    this.retryInterval = ElementLocator.getOrDefault(selector, 'retryInterval', options.waitForConditionPollInterval);
    this.locateStrategy = ElementLocator.getLocateStrategy(selector, options.locateStrategy);
    this.abortOnFailure = ElementLocator.getOrDefault(selector, 'abortOnFailure', true);
    this.suppressNotFoundErrors = ElementLocator.getOrDefault(selector, 'suppressNotFoundErrors', false);
    this.condition = ElementLocator.getCondition(selector, this.locateStrategy);
  }

  static create(selector, nightwatchInstance = {}) {
    return new ElementLocator(selector, {
      waitForConditionTimeout: nightwatchInstance.settings.globals.waitForConditionTimeout,
      waitForConditionPollInterval: nightwatchInstance.settings.globals.waitForConditionPollInterval,
      locateStrategy: nightwatchInstance.locateStrategy
    });
  }

  static getOrDefault(obj, prop, defaultValue) {
    // eslint-disable-next-line no-prototype-builtins
    return Utils.isObject(obj) && obj.hasOwnProperty(prop) ? obj[prop] : defaultValue;
  }

  static getLocateStrategy(element, strategy) {
    if (element instanceof By) {
      return element.using;
    }

    if (Utils.isString(element)) {
      return strategy;
    }

    return ElementLocator.getOrDefault(element, 'locateStrategy', strategy);
  }

  static isElementDescriptor(selector) {
    if (!Utils.isObject(selector)) {
      return false;
    }

    if (selector.__nightwatchScopedWebElement__) {
      return true;
    }

    // eslint-disable-next-line no-prototype-builtins
    return ['selector', 'xpath', 'css'].some(prop => selector.hasOwnProperty(prop));
  }

  static getSelectorValue(descriptor) {
    if (descriptor.selector instanceof By || descriptor.selector instanceof RelativeBy) {
      return descriptor.selector;
    }

    if (descriptor.xpath) {
      return By.xpath(descriptor.xpath);
    }

    if (descriptor.css) {
      return By.css(descriptor.css);
    }

    return null;
  }

  static getCondition(element, strategy) {
    const locateStrategy = ElementLocator.getLocateStrategy(element, strategy);

    if (element instanceof By || element instanceof RelativeBy || element instanceof Element) {
      return element;
    }

    if (!ElementLocator.isElementDescriptor(element)) {
      return By[Locator.AVAILABLE_LOCATORS[locateStrategy]](element);
    }

    const selector = ElementLocator.getSelectorValue(element);
    if (selector) {
      return selector;
    }

    return By[Locator.AVAILABLE_LOCATORS[locateStrategy]](element.selector);
  }
}

module.exports.ScopedElementLocator = ElementLocator;