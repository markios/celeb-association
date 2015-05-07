'use strict';
/* Global module */

var m = require('mithril'),
	_ = require('lodash'),
    GameModel = require('./../models/game-model');

var ResultVM = function(){};

/*
	Private Memebers
*/

var _calcMessage = function(){
	var messages = this.resultMessages(),
		percentage = Math.round((this.score() / this.highScore()) * 100),
		result = messages[20];

	for(var res in messages) {
		if(percentage >= res) result = messages[res];
		else break;
	}

	return result;
};

var _calcScoreBoard = function(){

};

var _getResultImage = function(){
	return _.findWhere(this.assets(), { name : 'trophy' }).image;
};

/*
    Public Members
*/
ResultVM.prototype.init = function(){
    this.score = m.prop(GameModel.score());
    this.highScore = m.prop(GameModel.highScore());
    this.resultMessages = m.prop(GameModel.resultMessages());
    this.message = m.prop(_calcMessage.call(this));
    this.assets = m.prop(GameModel.assets());
    this.previousScores = m.prop(GameModel.previousScores());
    this.scoreBoard = m.prop(_calcScoreBoard.call(this));
    this.resultImage = m.prop(_getResultImage.call(this));
};

module.exports = ResultVM;