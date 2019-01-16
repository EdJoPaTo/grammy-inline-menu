# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="3.2.2"></a>
## [3.2.2](https://github.com/EdJoPaTo/telegraf-inline-menu/compare/v3.2.1...v3.2.2) (2019-01-16)


### Bug Fixes

* use answerCallbackQuery on menu update and question button ([c030c62](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/c030c62))



<a name="3.2.1"></a>
## [3.2.1](https://github.com/EdJoPaTo/telegraf-inline-menu/compare/v3.2.0...v3.2.1) (2018-09-24)


### Bug Fixes

* **submenu:** hidden submenus dont prevent other menus from opening ([9c155d9](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/9c155d9))



<a name="3.2.0"></a>
# [3.2.0](https://github.com/EdJoPaTo/telegraf-inline-menu/compare/v3.1.0...v3.2.0) (2018-09-24)


### Features

* **replyMenuMiddleware:** add method to create a menu from outside ([bee5694](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/bee5694))
* **submenu:** update the menu when hidden submenu button is hit ([ad7c18c](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/ad7c18c))



<a name="3.1.0"></a>
# [3.1.0](https://github.com/EdJoPaTo/telegraf-inline-menu/compare/v3.0.0...v3.1.0) (2018-09-21)


### Bug Fixes

* **select:** throw Error that hide && submenu can not work ([0c4ae33](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/0c4ae33))
* throw Error that dynamic menus only can handle buttons ([39b335b](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/39b335b))


### Features

* setParentMenuAfter allows to set the parent menu after doFunc ([f2874ba](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/f2874ba))



<a name="3.0.0"></a>
# [3.0.0](https://github.com/EdJoPaTo/telegraf-inline-menu/compare/v2.0.2...v3.0.0) (2018-09-20)


### Bug Fixes

* **action-code:** fix splitting of action with regex that have : ([58eafa1](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/58eafa1))
* **action-code:** get parent of regex ([dbb123c](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/dbb123c))
* **question:** question works again with unexpected deleteMessage errors ([233ed92](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/233ed92))
* **select:** setFunc and hide key argument are now the last match group ([9d1d736](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/9d1d736))
* **select:** stop using multiple layers of an ActionCode ([c1dd5b4](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/c1dd5b4))
* **toggle:** stop using multiple layers of an ActionCode ([48765eb](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/48765eb))


### Features

* **action-code:** implement concat of two regex ([19cb546](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/19cb546))
* generate the menu for the actual ActionCode when possible ([b0d82e2](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/b0d82e2))
* update menu when user presses a hidden button ([5ba3471](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/5ba3471))
* **command:** throw Error when setCommand was used on a dynamic menu ([bc6874e](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/bc6874e))
* **select:** add support for submenu on selection ([2e8f7bb](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/2e8f7bb))


### BREAKING CHANGES

* **select:** Select Buttons only in an old, still existing menu
created before the update will not work. Using another Button or create
a new menu will fix this.
* **toggle:** Toggle Buttons only in an old, still existing menu 
created before the update will not work. Using another Button or create 
a new menu will fix this.
* **action-code:** action as RegExp can not have any flag anymore.



<a name="2.0.2"></a>
## [2.0.2](https://github.com/EdJoPaTo/telegraf-inline-menu/compare/v2.0.1...v2.0.2) (2018-09-17)


### Bug Fixes

* **action-code:** dont throw on deprication hint ([5b86a5c](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/5b86a5c))



<a name="2.0.1"></a>
## [2.0.1](https://github.com/EdJoPaTo/telegraf-inline-menu/compare/v2.0.0...v2.0.1) (2018-09-16)


### Bug Fixes

* only run action handler.hide when its an action ([a2c0ea5](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/a2c0ea5))
* **select:** dont call hide without key ([c440a97](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/c440a97))



<a name="2.0.0"></a>
# [2.0.0](https://github.com/EdJoPaTo/telegraf-inline-menu/compare/v1.7.0...v2.0.0) (2018-09-16)


### Features

* **select:** limit maximal rows of buttons ([4089727](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/4089727))
* rework the logic to be loaded not until .init() is used ([a3dd6b2](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/a3dd6b2))


### BREAKING CHANGES

* multiple method arguments are swapped, changed and 
improved. Check README



<a name="1.7.0"></a>
# [1.7.0](https://github.com/EdJoPaTo/telegraf-inline-menu/compare/v1.6.0...v1.7.0) (2018-09-13)


### Features

* add support for switchToChat and switchToCurrentChat ([32a242d](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/32a242d))
* **action-code:** concat ActionCodes together ([5b0b4a7](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/5b0b4a7))



<a name="1.6.0"></a>
# [1.6.0](https://github.com/EdJoPaTo/telegraf-inline-menu/compare/v1.5.0...v1.6.0) (2018-09-10)


### Bug Fixes

* catch 'message is not modified' on menu update ([425d153](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/425d153))


### Features

* **question:** allow question to be answered by all kinds of messages ([f811904](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/f811904))



<a name="1.5.0"></a>
# [1.5.0](https://github.com/EdJoPaTo/telegraf-inline-menu/compare/v1.4.0...v1.5.0) (2018-09-10)


### Features

* **manual:** add root option ([7d05cc4](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/7d05cc4))



<a name="1.4.0"></a>
# [1.4.0](https://github.com/EdJoPaTo/telegraf-inline-menu/compare/v1.3.1...v1.4.0) (2018-09-09)


### Bug Fixes

* use middleware() instead of bot.middleware() ([0f9db30](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/0f9db30))


### Features

* **urlButton:** add urlButton support ([4a8c442](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/4a8c442))



<a name="1.3.1"></a>
## [1.3.1](https://github.com/EdJoPaTo/telegraf-inline-menu/compare/v1.3.0...v1.3.1) (2018-09-09)


### Bug Fixes

* **select:** hide has the key now always set ([8f048fd](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/8f048fd))



<a name="1.3.0"></a>
# [1.3.0](https://github.com/EdJoPaTo/telegraf-inline-menu/compare/v1.2.0...v1.3.0) (2018-09-09)


### Features

* **toggle:** include state to be set into actionCode ([79c2c47](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/79c2c47))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/EdJoPaTo/telegraf-inline-menu/compare/v1.1.0...v1.2.0) (2018-09-09)


### Features

* add 'joinLastRow' option ([3494e5c](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/3494e5c))
* **button:** add simple button ([af7509b](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/af7509b))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/EdJoPaTo/telegraf-inline-menu/compare/v1.0.0...v1.1.0) (2018-09-09)


### Features

* **manual:** add manual action ([ad04310](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/ad04310))
* **question:** add question ([47a4232](https://github.com/EdJoPaTo/telegraf-inline-menu/commit/47a4232))



<a name="1.0.0"></a>
# 1.0.0 (2018-09-09)
