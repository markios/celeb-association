'use strict';
/* Global module */

var m = require('mithril'),
    GameModel = require('./../models/game-model');

var GameVM = function(){};

/*
    Public Members
*/
GameVM.prototype.init = function(){
    var questions = GameModel.questions();
    this.currentQuestion = m.prop(0);
    this.question = m.prop("Get Ready");
    this.currentScore = m.prop(0);
    this.timer = m.prop(GameModel.timer());
    this.questions = m.prop(questions);
    this.totalQuestions = m.prop(questions.length);
    this.entities = m.prop(GameModel.entities());
};

module.exports = GameVM;