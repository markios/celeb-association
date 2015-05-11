'use strict';
/* Global module */

var m = require('mithril'),
	_ = require('lodash'),
	utils = require('./../libs/utils'),
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

var _calcTopFive = function(previousScores, currentScore){

	// get friendly Time
	_.each(previousScores, function(score){
		score.friendlyTime = utils.relativeTime(score.date);
		score.isCurrent = +score.score === +currentScore;
	});

	if(previousScores.length <= 1) return previousScores;

    previousScores = _.sortBy(previousScores, function(s){
        return -s.score;
    });
    
    return previousScores.slice(0,5);
};

var _getPerformanceAdj = function(){
	var target = '',
		index = _.findIndex(this.scoreBoard(), function(score){
		return score.isCurrent;
	});

	switch(index){
		case 0:
			target = 'trophy';
			break;
		case 1:
		case 2:
			target = 'positive';
			break;
		case 3:
		case 4:
			target = 'moderate';
			break;
		default:
			target = 'negative';
	}

	return target;
};

var _getResultImage = function(){
	return _.findWhere(this.assets(), { name : this.performanceAdj() }).image;
};

/*
    Public Members
*/
ResultVM.prototype.init = function(){
    this.score = m.prop(GameModel.score());
    this.highScore = m.prop(GameModel.highScore());
    this.resultMessages = m.prop(GameModel.resultMessages());
    this.assets = m.prop(GameModel.assets());
    
    // Derivative Data
	this.scoreBoard = m.prop(_calcTopFive(GameModel.previousScores(), this.score()));
    this.message = m.prop(_calcMessage.call(this));
    this.performanceAdj = m.prop(_getPerformanceAdj.call(this));
    this.resultImage = m.prop(_getResultImage.call(this));
};

module.exports = ResultVM;