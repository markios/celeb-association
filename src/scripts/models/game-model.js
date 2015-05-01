'use strict';
/* Global module */
var m = require('mithril');

var data = {
	score     :0,
	entities  :[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	questions :[]
};

var GameModel = function(){
	this.score 		= m.prop(data.score);
	this.entities 	= m.prop(data.entities);
	this.questions	= m.prop(data.questions);
};

module.exports = new GameModel();