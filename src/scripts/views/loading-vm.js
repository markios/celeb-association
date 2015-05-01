'use strict';
/* Global module */

var m = require('mithril'),
    GameModel = require('./../models/game-model');

var LoadingVM = function(){};

/*
    Preload images
*/
var _preload = function(){
    setTimeout(function(){
        this.targetsLoaded(this.targetsLoaded() + 1);
        if(this.targetsLoaded() === this.targets()) {
            this.loaded(true);
            this.progress(100);
        }
        else {
            this.progress(Math.round((this.targetsLoaded() / this.targets()) * 100));
            _preload.call(this);
            m.redraw();
        }
    }.bind(this), 1000);
};

/*
    Public Members
*/
LoadingVM.prototype.init = function(){
    this.loaded = m.prop(false);
    this.progress= m.prop(0);
    this.targets = m.prop(GameModel.entities().length);
    this.targetsLoaded = m.prop(0);
    _preload.call(this);
};

module.exports = LoadingVM;