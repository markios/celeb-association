'use strict';

var m = require('mithril'),
	loadingViewModel = require('./../views/loading-vm'),
	loadingView = require('../views/loading-view');

var application = function(){
	var controller = function(){
		this.VM = new loadingViewModel();
		this.VM.init();
	};

	//initialize the application
	m.module(document.body, { controller: controller, view: loadingView });
};

module.exports = application;

