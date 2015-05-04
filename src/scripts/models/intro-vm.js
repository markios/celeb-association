'use strict';
/* Global module */

var m = require('mithril'),
    GameModel = require('./../models/game-model');

var IntroVM = function(){};

/*
    Public Members
*/
IntroVM.prototype.init = function(){
    this.title = m.prop(GameModel.title());
    this.description = m.prop(GameModel.description());
    this.begin = m.prop(false);
    this.brand = m.prop(GameModel.brands()[0]);
    this.begin = m.prop(false);
};

module.exports = IntroVM;