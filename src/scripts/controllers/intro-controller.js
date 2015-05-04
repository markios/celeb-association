/* global m */
'use strict';

var m = require('mithril'),
	introViewModel = require('./../models/intro-vm');

var IntroController = function(){
	this.VM = new introViewModel();
	this.VM.init();
};

/*
	Public Members
*/
IntroController.prototype.onBegin = function(){
	// this.VM.begin(true);
};

IntroController.prototype.startGame = function(){
	m.route("/game");
};

module.exports = IntroController;