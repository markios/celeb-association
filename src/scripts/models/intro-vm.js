'use strict';
/* Global module */

var m = require('mithril'),
	_ = require('lodash'),
    GameModel = require('./../models/game-model');

var IntroVM = function(){};

/*
    Public Members
*/
IntroVM.prototype.init = function(){
    this.title = m.prop(GameModel.title());
    this.description = m.prop(GameModel.description());
    this.begin = m.prop(false);
    this.brand = m.prop(_.findWhere(GameModel.assets(), { name : 'brand' }).image);
    this.begin = m.prop(false);
};

module.exports = IntroVM;