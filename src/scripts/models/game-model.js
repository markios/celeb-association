'use strict';
/* Global module */
var m = require('mithril');

var data = {
	score     :0,
	entities  :[
		'http://img-a.zeebox.com/images/z/041c8091-2fb2-492b-8cda-68dda5538582.jpg',
		'http://img-a.zeebox.com/images/z/566907f9-aaaf-487d-b828-447c22cb1190.jpg',
		'http://img-a.zeebox.com/images/z/a89ef99d-ae59-4568-a4fe-70ec491b4ff4.jpg',
		'http://img-a.zeebox.com/images/z/2335b3a0-f10b-4cc6-ad1c-e511e2193939.jpg',
		'http://img-a.zeebox.com/images/z/a89ef99d-ae59-4568-a4fe-70ec491b4ff4.jpg'
	],
	questions :[],
	title : "Beamly Comedy Special",
	description : "Can you associate the celebrities with the shows in the time limit? lets find out...",
	brands : [
		'http://img-a.zeebox.com/images/z/a5bf62ac-3e5f-46fa-9b59-59c09bc03d3e.png'
	]
};

var GameModel = function(){
	this.score 		= m.prop(data.score);
	this.entities 	= m.prop(data.entities);
	this.questions	= m.prop(data.questions);
	this.brands     = m.prop(data.brands);
	this.title		= m.prop(data.title);
	this.description= m.prop(data.description);
	this.timer = m.prop(data.timer || 5);
};

module.exports = new GameModel();