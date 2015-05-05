/* global m */
'use strict';

var m = require('mithril'),
	gameViewModel = require('./../models/game-vm');

var GameController = function(){
	this.VM = new gameViewModel();
	this.VM.init();
};

/*
	Public Members
*/

GameController.prototype.ready = function(){
	this.VM.startGame();
};

GameController.prototype.toggle = function(ans){
	ans.selected(!ans.selected());
	ans.toggled(true);
};


module.exports = GameController;