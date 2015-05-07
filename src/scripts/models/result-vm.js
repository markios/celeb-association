'use strict';
/* Global module */

var m = require('mithril'),
    GameModel = require('./../models/game-model');

var ResultVM = function(){};

/*
    Public Members
*/
ResultVM.prototype.init = function(){
    this.score = m.prop(GameModel.score());
    // this.highScore = 
};

module.exports = ResultVM;