# SPA Tools

SPA Tools is a set of tools and modules to help building Single Page Applications and other modern web applications.

## Base Library

The base library must be included in your document. It extends some usefull framework and make them work together. It includes extensions for :

* KnockoutJS
    * Many usefull binding handlers
    * Many extenders
	* Some other extensions
* UnderscoreJS
	* Add some methods to underscoreJS
	* Integrate with knockout's observableArray and can be integrated to any observable / computed observable.
* MomentJS
	* Integrate with Knockout JS
		* Binding Handler
		* Extender

## Modules

SPA Tools provides a lot of additionnal modules to add functionnalities to your applications.

* **Commanding** MVVM concept of command and async command to help building better View Models.
* **Change Tracker** Configurable object change tracker.
* **Messenger** Messaging mechanism for inter View Model communication
* **Timers** Timers to help creating recurring tasks. Timer and AsyncTimer is provided.
* **Events** Utility to manage HTML events.
* **Stores** Provide mechanisms to store data for your application.
* **Utilities** Many other utility functions.

## Data

Javascript ORM to connect to REST / OData Web Service.

## Release History
* 0.1.0 Initial Release
* 0.2.0 
	* Append UI framework
* 0.2.1
    * Fix issues in Tree widget
* 0.2.2
    * Fix issues in data/adapters
    * Fix issues in data/stores
* 0.2.3
	* Fix issues in Command binding handlers
* 0.2.4
	* Fix issues in Ribbon widget
* 0.2.5
	* Fix issues in base64 module
* 0.3.0
	* Append $expand and $select options in data framework
	* Add ODataQuery options in load operations in data framework
* 0.3.1
    * Fix missing return value in utils.unsafe
    * Fix issues in templateEngine for Windows 8
	* Fix issue in Tree binding handler
	* Fix issue in DataSet.saveChanges and DataView.saveChanges
	* Fix issue in DataSet.remove
	* Fix RibbonForm.inline not working and Add class to RibbonInput

