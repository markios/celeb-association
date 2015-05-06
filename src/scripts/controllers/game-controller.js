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
	m.redraw();
};

GameController.prototype.onTime = function(){
    this.VM.endQuestion();
    m.redraw();
};

GameController.prototype.startQuestion = function(){
    this.VM.startQuestion();
};

module.exports = GameController;