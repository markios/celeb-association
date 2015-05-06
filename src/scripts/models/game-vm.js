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

var Timer = function(time){
    this.isActive = m.prop(false);
    this.time = m.prop(time * 1000);
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
    this.timer = m.prop(null);
    this.questions = m.prop(questions);
    this.totalQuestions = m.prop(questions.length);
    this.gameOver = m.prop(false);
    this.question = m.prop(new Question({ question : "", answers : [] }));
    
    // View Queues 
    this.questionShown = m.prop(false);
    this.endQuestion = m.prop(false);
};

GameVM.prototype.startGame = function(){
    setTimeout(_setCurrentQuestion.bind(this), 2000);
};

GameVM.prototype.endQuestion = function(){
    this.endQuestion = m.prop(true);
};

GameVM.prototype.startQuestion = function(){
    this.timer(new Timer(GameModel.timer()));
    m.redraw();
};

module.exports = GameVM;