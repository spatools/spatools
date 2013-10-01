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
	* Fix missing empty guid
* 0.4.0
	* Remove base library (all is now require based)
	* Optimize bad string EOL on widget
	* Optimize data framework
	* TS Lint & JS Hint all modules
	* Upgrade NuGet packages
	* Append slider widget
* 0.4.1
	* Change project location in NuGet
* 0.4.2
	* Fix compatibility issue with new moment version
* 0.5.0
	* Make cache and loader Windows 8 Compliant
	* Append ISO 8601 moment duration parser
	* Improve startup modules
	* Append Math Framework
		* Separate package
		* Geometry Helpers
		* Vector2, Vector3, Matrix3, Matrix4 calculation
		* Very useful in 3d and canvas applications
* 0.5.1
	* Optimize Knockout handler by using ko.unwrap
	* Fix issue in pad binding handler
	* Fix issue in ODataQuery FunctionFilter
* 0.5.2
	* Fix issue in data store getStore method
	* Fix issues in localstorage data store
	* Fix issues in loader.loadStylesheet
	* Append some promise related methods into utils module
	* Make utils.unsafe method generic
* 0.5.3
	* Make MemoryStore and ODataAdapter respectively default data store and adapter
	* Optimize adapters size by factorizing ajax calls
	* Avoid circular dependency by creating alone prefilter module
	* Remove unused initDefault method from DataContext class
	* Optimize store and adapter change in DataSet class
	* Fix issue in utils.whenAll definition
