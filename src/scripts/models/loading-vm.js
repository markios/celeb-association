'use strict';
/* Global module */

var m = require('mithril'),
    GameModel = require('./../models/game-model');

var LoadingVM = function(){};

/*
    Preload images
*/
var _preload = function(){
    var targets = this.targets(),
        targetCount = targets.length;

    var __onLoad = function(){
        var loaded = this.targetsLoaded() + 1;
        this.targetsLoaded(loaded);
        this.progress(Math.round((loaded / targetCount) * 100));
        this.loaded(this.progress() === 100);
        m.redraw();
    };

    for (var i = targetCount - 1; i >= 0; i--) {
        var image = new Image();
        image.onload = __onLoad.bind(this);
        image.src = targets[i];
    }
};

/*
    Public Members
*/
LoadingVM.prototype.init = function(){
    this.loaded = m.prop(false);
    this.progress = m.prop(0);
    this.targets = m.prop(GameModel.entities().concat(GameModel.brands()));
    this.targetsLoaded = m.prop(0);
    _preload.call(this);
};

module.exports = LoadingVM;