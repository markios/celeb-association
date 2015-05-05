'use strict';
/* Global module */

var m = require('mithril'),
    _ = require('lodash'),
    GameModel = require('./../models/game-model');

var Answer = function(d){
    this.image = m.prop(d.image);
    this.name = m.prop(d.name);
    this.selected = m.prop(false);
    this.correct = m.prop(d.correct);
    this.toggled = m.prop(false);
};

var Question = function(d){
    this.text = m.prop(d.question);
    this.answers = m.prop(_.map(d.answers, function(a){
        return new Answer(a);
    }));
};

/*
    Constructor
*/

var GameVM = function(){};


/*
    Private Members
*/

var _setCurrentQuestion = function(){
    var q = new Question(this.questions()[this.currentQuestion()]);
    this.question(q);
    m.redraw();
};

var _nextQuestion = function(){
    var current = this.currentQuestion() + 1,
        isEnd = current === this.totalQuestions();

    this.gameOver(isEnd);
    if(! isEnd) {
        this.currentQuestion(current);
        _setCurrentQuestion.call();
    }
};

/*
    Public Members
*/
GameVM.prototype.init = function(){
    var questions = GameModel.questions();
    this.currentQuestion = m.prop(0);
    this.currentScore = m.prop(0);
    this.timer = m.prop(GameModel.timer());
    this.questions = m.prop(questions);
    this.totalQuestions = m.prop(questions.length);
    this.gameOver = m.prop(false);
    this.question = m.prop(new Question({ question : "Get Ready", answers : [] }));
};

GameVM.prototype.startGame = function(){
    setTimeout(_setCurrentQuestion.bind(this), 2000);
};

module.exports = GameVM;