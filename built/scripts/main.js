(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var App = require('./libs/app.js');

window.widgetVersion = "v0.0.0";

var initApp = function(params){
	var instance = new App();
};

document.addEventListener("DOMContentLoaded", function(event){
   //do work
   initApp();
});

},{"./libs/app.js":5}],2:[function(require,module,exports){
/* global m */
'use strict';

var m = require('mithril'),
	gameViewModel = require('./../models/game-vm');

var GameController = function(){
	this.VM = new gameViewModel();
	this.VM.init();
};

/*
	Public Members
*/


module.exports = GameController;
},{"./../models/game-vm":7,"mithril":"mithril"}],3:[function(require,module,exports){
/* global m */
'use strict';

var m = require('mithril'),
	introViewModel = require('./../models/intro-vm');

var IntroController = function(){
	this.VM = new introViewModel();
	this.VM.init();
};

/*
	Public Members
*/
IntroController.prototype.onBegin = function(){
	// this.VM.begin(true);
};

IntroController.prototype.startGame = function(){
	m.route("/game");
};

module.exports = IntroController;
},{"./../models/intro-vm":8,"mithril":"mithril"}],4:[function(require,module,exports){
/* global m */
'use strict';

var m = require('mithril'),
	loadingViewModel = require('./../models/loading-vm');

var LoadingController = function(){
	this.VM = new loadingViewModel();
	this.VM.init();
};

/*
	Public Members
*/
LoadingController.prototype.onloaded = function(){
	m.route("/intro");
};

module.exports = LoadingController;
},{"./../models/loading-vm":9,"mithril":"mithril"}],5:[function(require,module,exports){
'use strict';

var m = require('mithril'),
	gameController = require('../controllers/game-controller'),
	gameView = require('../views/game-view'),
	introController = require('../controllers/intro-controller'),
	introView = require('../views/intro-view'),
	loadingController = require('../controllers/loading-controller'),
	loadingView = require('../views/loading-view');

var application = function(){
	//initialize the application
	var app = {
		loading : { controller: loadingController, view: loadingView },
		intro   : { controller: introController,   view: introView },
		game	: { controller: gameController, view: gameView }
	}

	m.route.mode = "hash";

	m.route(document.body, "/", {
	    ""		 : app.loading,
	    "/intro" : app.intro,
	    "/game"  : app.game
	});
};

module.exports = application;
},{"../controllers/game-controller":2,"../controllers/intro-controller":3,"../controllers/loading-controller":4,"../views/game-view":10,"../views/intro-view":11,"../views/loading-view":12,"mithril":"mithril"}],6:[function(require,module,exports){
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
},{"mithril":"mithril"}],7:[function(require,module,exports){
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
},{"./../models/game-model":6,"mithril":"mithril"}],8:[function(require,module,exports){
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
},{"./../models/game-model":6,"mithril":"mithril"}],9:[function(require,module,exports){
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
},{"./../models/game-model":6,"mithril":"mithril"}],10:[function(require,module,exports){
/* Global module */
'use strict';

var m = require('mithril'),
    Velocity = require('velocity-animate');

var View = function(ctrl){

    var animIn = function(el, isInitialized, context) {
        if (!isInitialized) {
            document.body.className = 'game';
            Velocity(el.children[0], { translateY : '+=170px' }, { duration : 500, delay : 300, easing :  [ 250, 0 ] });
        }
    };

    return m('#game-page', [
        m('.game-holder', {
            config : animIn
        },[
            m('header.game-header.out-top-full', [
                m('.timer'),
                m('h3.current-question', ctrl.VM.question())
            ]),
            m('.game-area')
        ])
    ]);
};

module.exports = View;
},{"mithril":"mithril","velocity-animate":"velocity-animate"}],11:[function(require,module,exports){
/* Global module */
'use strict';

var m = require('mithril'),
    Velocity = require('velocity-animate');

var Loading = function(ctrl){

    var animIn = function(el, isInitialized, context) {
        if (!isInitialized) {
            document.body.className = 'intro';
            Velocity(el.children[0], { opacity : 1, left : 0 }, { duration : 500, delay : 300});
            Velocity(el.children[1], { opacity : 1, left : 0 }, { duration : 500, delay : 500});
            Velocity(el.children[2], { opacity : 1 }, { duration : 500, delay : 1000});
            Velocity(el.children[3], { opacity : 1, rotateZ : '-25', right : -50 }, { duration : 500, delay : 1500, easing : [ 250, 15 ] });
        } else {
            // Velocity(el.children, "reverse");
            Velocity(el.children, "reverse").then(ctrl.startGame);
        }
    };

    return m('#intro-page', [
        m('.intro-holder', {
            config : animIn
        },[
            m('h2.opaque.out-left-short', ctrl.VM.title()),
            m('.description.opaque.out-left-short', ctrl.VM.description()),
            m('a.begin.opaque', { onclick: ctrl.onBegin }, 'begin'),
            m('.brand.opaque.out-right-far', { style : { backgroundImage : 'url({0})'.replace('{0}', ctrl.VM.brand()) } })
        ])
    ]);
};

module.exports = Loading;
},{"mithril":"mithril","velocity-animate":"velocity-animate"}],12:[function(require,module,exports){
/* Global module */
'use strict';

var m = require('mithril'),
    Velocity = require('velocity-animate');

var Loading = function(ctrl){

    var animIn = function(el, isInitialized, context) {
        if (!isInitialized) {
            Velocity(el, { translateX : '+=100%' }, { delay : 200, duration : 300, easing : 'ease' });
        } else {
            if(ctrl.VM.loaded()) Velocity(el, "reverse").then(ctrl.onloaded);
        }
    };

    return m('#loading-page', [
        m('.message-holder.out-left-full', {
            config : animIn
        },[
            m('h3', 'Loading ' + ctrl.VM.progress() + '%')
        ])
    ]);
};

module.exports = Loading;
},{"mithril":"mithril","velocity-animate":"velocity-animate"}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9tYWluLmpzIiwic3JjL3NjcmlwdHMvY29udHJvbGxlcnMvZ2FtZS1jb250cm9sbGVyLmpzIiwic3JjL3NjcmlwdHMvY29udHJvbGxlcnMvaW50cm8tY29udHJvbGxlci5qcyIsInNyYy9zY3JpcHRzL2NvbnRyb2xsZXJzL2xvYWRpbmctY29udHJvbGxlci5qcyIsInNyYy9zY3JpcHRzL2xpYnMvYXBwLmpzIiwic3JjL3NjcmlwdHMvbW9kZWxzL2dhbWUtbW9kZWwuanMiLCJzcmMvc2NyaXB0cy9tb2RlbHMvZ2FtZS12bS5qcyIsInNyYy9zY3JpcHRzL21vZGVscy9pbnRyby12bS5qcyIsInNyYy9zY3JpcHRzL21vZGVscy9sb2FkaW5nLXZtLmpzIiwic3JjL3NjcmlwdHMvdmlld3MvZ2FtZS12aWV3LmpzIiwic3JjL3NjcmlwdHMvdmlld3MvaW50cm8tdmlldy5qcyIsInNyYy9zY3JpcHRzL3ZpZXdzL2xvYWRpbmctdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQXBwID0gcmVxdWlyZSgnLi9saWJzL2FwcC5qcycpO1xuXG53aW5kb3cud2lkZ2V0VmVyc2lvbiA9IFwidjAuMC4wXCI7XG5cbnZhciBpbml0QXBwID0gZnVuY3Rpb24ocGFyYW1zKXtcblx0dmFyIGluc3RhbmNlID0gbmV3IEFwcCgpO1xufTtcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZnVuY3Rpb24oZXZlbnQpe1xuICAgLy9kbyB3b3JrXG4gICBpbml0QXBwKCk7XG59KTtcbiIsIi8qIGdsb2JhbCBtICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRnYW1lVmlld01vZGVsID0gcmVxdWlyZSgnLi8uLi9tb2RlbHMvZ2FtZS12bScpO1xuXG52YXIgR2FtZUNvbnRyb2xsZXIgPSBmdW5jdGlvbigpe1xuXHR0aGlzLlZNID0gbmV3IGdhbWVWaWV3TW9kZWwoKTtcblx0dGhpcy5WTS5pbml0KCk7XG59O1xuXG4vKlxuXHRQdWJsaWMgTWVtYmVyc1xuKi9cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVDb250cm9sbGVyOyIsIi8qIGdsb2JhbCBtICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRpbnRyb1ZpZXdNb2RlbCA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2ludHJvLXZtJyk7XG5cbnZhciBJbnRyb0NvbnRyb2xsZXIgPSBmdW5jdGlvbigpe1xuXHR0aGlzLlZNID0gbmV3IGludHJvVmlld01vZGVsKCk7XG5cdHRoaXMuVk0uaW5pdCgpO1xufTtcblxuLypcblx0UHVibGljIE1lbWJlcnNcbiovXG5JbnRyb0NvbnRyb2xsZXIucHJvdG90eXBlLm9uQmVnaW4gPSBmdW5jdGlvbigpe1xuXHQvLyB0aGlzLlZNLmJlZ2luKHRydWUpO1xufTtcblxuSW50cm9Db250cm9sbGVyLnByb3RvdHlwZS5zdGFydEdhbWUgPSBmdW5jdGlvbigpe1xuXHRtLnJvdXRlKFwiL2dhbWVcIik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludHJvQ29udHJvbGxlcjsiLCIvKiBnbG9iYWwgbSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcblx0bG9hZGluZ1ZpZXdNb2RlbCA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2xvYWRpbmctdm0nKTtcblxudmFyIExvYWRpbmdDb250cm9sbGVyID0gZnVuY3Rpb24oKXtcblx0dGhpcy5WTSA9IG5ldyBsb2FkaW5nVmlld01vZGVsKCk7XG5cdHRoaXMuVk0uaW5pdCgpO1xufTtcblxuLypcblx0UHVibGljIE1lbWJlcnNcbiovXG5Mb2FkaW5nQ29udHJvbGxlci5wcm90b3R5cGUub25sb2FkZWQgPSBmdW5jdGlvbigpe1xuXHRtLnJvdXRlKFwiL2ludHJvXCIpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb2FkaW5nQ29udHJvbGxlcjsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRnYW1lQ29udHJvbGxlciA9IHJlcXVpcmUoJy4uL2NvbnRyb2xsZXJzL2dhbWUtY29udHJvbGxlcicpLFxuXHRnYW1lVmlldyA9IHJlcXVpcmUoJy4uL3ZpZXdzL2dhbWUtdmlldycpLFxuXHRpbnRyb0NvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9jb250cm9sbGVycy9pbnRyby1jb250cm9sbGVyJyksXG5cdGludHJvVmlldyA9IHJlcXVpcmUoJy4uL3ZpZXdzL2ludHJvLXZpZXcnKSxcblx0bG9hZGluZ0NvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9jb250cm9sbGVycy9sb2FkaW5nLWNvbnRyb2xsZXInKSxcblx0bG9hZGluZ1ZpZXcgPSByZXF1aXJlKCcuLi92aWV3cy9sb2FkaW5nLXZpZXcnKTtcblxudmFyIGFwcGxpY2F0aW9uID0gZnVuY3Rpb24oKXtcblx0Ly9pbml0aWFsaXplIHRoZSBhcHBsaWNhdGlvblxuXHR2YXIgYXBwID0ge1xuXHRcdGxvYWRpbmcgOiB7IGNvbnRyb2xsZXI6IGxvYWRpbmdDb250cm9sbGVyLCB2aWV3OiBsb2FkaW5nVmlldyB9LFxuXHRcdGludHJvICAgOiB7IGNvbnRyb2xsZXI6IGludHJvQ29udHJvbGxlciwgICB2aWV3OiBpbnRyb1ZpZXcgfSxcblx0XHRnYW1lXHQ6IHsgY29udHJvbGxlcjogZ2FtZUNvbnRyb2xsZXIsIHZpZXc6IGdhbWVWaWV3IH1cblx0fVxuXG5cdG0ucm91dGUubW9kZSA9IFwiaGFzaFwiO1xuXG5cdG0ucm91dGUoZG9jdW1lbnQuYm9keSwgXCIvXCIsIHtcblx0ICAgIFwiXCJcdFx0IDogYXBwLmxvYWRpbmcsXG5cdCAgICBcIi9pbnRyb1wiIDogYXBwLmludHJvLFxuXHQgICAgXCIvZ2FtZVwiICA6IGFwcC5nYW1lXG5cdH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBhcHBsaWNhdGlvbjsiLCIndXNlIHN0cmljdCc7XG4vKiBHbG9iYWwgbW9kdWxlICovXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxudmFyIGRhdGEgPSB7XG5cdHNjb3JlICAgICA6MCxcblx0ZW50aXRpZXMgIDpbXG5cdFx0J2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzA0MWM4MDkxLTJmYjItNDkyYi04Y2RhLTY4ZGRhNTUzODU4Mi5qcGcnLFxuXHRcdCdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei81NjY5MDdmOS1hYWFmLTQ4N2QtYjgyOC00NDdjMjJjYjExOTAuanBnJyxcblx0XHQnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovYTg5ZWY5OWQtYWU1OS00NTY4LWE0ZmUtNzBlYzQ5MWI0ZmY0LmpwZycsXG5cdFx0J2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzIzMzViM2EwLWYxMGItNGNjNi1hZDFjLWU1MTFlMjE5MzkzOS5qcGcnLFxuXHRcdCdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9hODllZjk5ZC1hZTU5LTQ1NjgtYTRmZS03MGVjNDkxYjRmZjQuanBnJ1xuXHRdLFxuXHRxdWVzdGlvbnMgOltdLFxuXHR0aXRsZSA6IFwiQmVhbWx5IENvbWVkeSBTcGVjaWFsXCIsXG5cdGRlc2NyaXB0aW9uIDogXCJDYW4geW91IGFzc29jaWF0ZSB0aGUgY2VsZWJyaXRpZXMgd2l0aCB0aGUgc2hvd3MgaW4gdGhlIHRpbWUgbGltaXQ/IGxldHMgZmluZCBvdXQuLi5cIixcblx0YnJhbmRzIDogW1xuXHRcdCdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9hNWJmNjJhYy0zZTVmLTQ2ZmEtOWI1OS01OWMwOWJjMDNkM2UucG5nJ1xuXHRdXG59O1xuXG52YXIgR2FtZU1vZGVsID0gZnVuY3Rpb24oKXtcblx0dGhpcy5zY29yZSBcdFx0PSBtLnByb3AoZGF0YS5zY29yZSk7XG5cdHRoaXMuZW50aXRpZXMgXHQ9IG0ucHJvcChkYXRhLmVudGl0aWVzKTtcblx0dGhpcy5xdWVzdGlvbnNcdD0gbS5wcm9wKGRhdGEucXVlc3Rpb25zKTtcblx0dGhpcy5icmFuZHMgICAgID0gbS5wcm9wKGRhdGEuYnJhbmRzKTtcblx0dGhpcy50aXRsZVx0XHQ9IG0ucHJvcChkYXRhLnRpdGxlKTtcblx0dGhpcy5kZXNjcmlwdGlvbj0gbS5wcm9wKGRhdGEuZGVzY3JpcHRpb24pO1xuXHR0aGlzLnRpbWVyID0gbS5wcm9wKGRhdGEudGltZXIgfHwgNSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBHYW1lTW9kZWwoKTsiLCIndXNlIHN0cmljdCc7XG4vKiBHbG9iYWwgbW9kdWxlICovXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuICAgIEdhbWVNb2RlbCA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2dhbWUtbW9kZWwnKTtcblxudmFyIEdhbWVWTSA9IGZ1bmN0aW9uKCl7fTtcblxuLypcbiAgICBQdWJsaWMgTWVtYmVyc1xuKi9cbkdhbWVWTS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHF1ZXN0aW9ucyA9IEdhbWVNb2RlbC5xdWVzdGlvbnMoKTtcbiAgICB0aGlzLmN1cnJlbnRRdWVzdGlvbiA9IG0ucHJvcCgwKTtcbiAgICB0aGlzLnF1ZXN0aW9uID0gbS5wcm9wKFwiR2V0IFJlYWR5XCIpO1xuICAgIHRoaXMuY3VycmVudFNjb3JlID0gbS5wcm9wKDApO1xuICAgIHRoaXMudGltZXIgPSBtLnByb3AoR2FtZU1vZGVsLnRpbWVyKCkpO1xuICAgIHRoaXMucXVlc3Rpb25zID0gbS5wcm9wKHF1ZXN0aW9ucyk7XG4gICAgdGhpcy50b3RhbFF1ZXN0aW9ucyA9IG0ucHJvcChxdWVzdGlvbnMubGVuZ3RoKTtcbiAgICB0aGlzLmVudGl0aWVzID0gbS5wcm9wKEdhbWVNb2RlbC5lbnRpdGllcygpKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZVZNOyIsIid1c2Ugc3RyaWN0Jztcbi8qIEdsb2JhbCBtb2R1bGUgKi9cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG4gICAgR2FtZU1vZGVsID0gcmVxdWlyZSgnLi8uLi9tb2RlbHMvZ2FtZS1tb2RlbCcpO1xuXG52YXIgSW50cm9WTSA9IGZ1bmN0aW9uKCl7fTtcblxuLypcbiAgICBQdWJsaWMgTWVtYmVyc1xuKi9cbkludHJvVk0ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpe1xuICAgIHRoaXMudGl0bGUgPSBtLnByb3AoR2FtZU1vZGVsLnRpdGxlKCkpO1xuICAgIHRoaXMuZGVzY3JpcHRpb24gPSBtLnByb3AoR2FtZU1vZGVsLmRlc2NyaXB0aW9uKCkpO1xuICAgIHRoaXMuYmVnaW4gPSBtLnByb3AoZmFsc2UpO1xuICAgIHRoaXMuYnJhbmQgPSBtLnByb3AoR2FtZU1vZGVsLmJyYW5kcygpWzBdKTtcbiAgICB0aGlzLmJlZ2luID0gbS5wcm9wKGZhbHNlKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW50cm9WTTsiLCIndXNlIHN0cmljdCc7XG4vKiBHbG9iYWwgbW9kdWxlICovXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuICAgIEdhbWVNb2RlbCA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2dhbWUtbW9kZWwnKTtcblxudmFyIExvYWRpbmdWTSA9IGZ1bmN0aW9uKCl7fTtcblxuLypcbiAgICBQcmVsb2FkIGltYWdlc1xuKi9cbnZhciBfcHJlbG9hZCA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHRhcmdldHMgPSB0aGlzLnRhcmdldHMoKSxcbiAgICAgICAgdGFyZ2V0Q291bnQgPSB0YXJnZXRzLmxlbmd0aDtcblxuICAgIHZhciBfX29uTG9hZCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBsb2FkZWQgPSB0aGlzLnRhcmdldHNMb2FkZWQoKSArIDE7XG4gICAgICAgIHRoaXMudGFyZ2V0c0xvYWRlZChsb2FkZWQpO1xuICAgICAgICB0aGlzLnByb2dyZXNzKE1hdGgucm91bmQoKGxvYWRlZCAvIHRhcmdldENvdW50KSAqIDEwMCkpO1xuICAgICAgICB0aGlzLmxvYWRlZCh0aGlzLnByb2dyZXNzKCkgPT09IDEwMCk7XG4gICAgICAgIG0ucmVkcmF3KCk7XG4gICAgfTtcblxuICAgIGZvciAodmFyIGkgPSB0YXJnZXRDb3VudCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIHZhciBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICBpbWFnZS5vbmxvYWQgPSBfX29uTG9hZC5iaW5kKHRoaXMpO1xuICAgICAgICBpbWFnZS5zcmMgPSB0YXJnZXRzW2ldO1xuICAgIH1cbn07XG5cbi8qXG4gICAgUHVibGljIE1lbWJlcnNcbiovXG5Mb2FkaW5nVk0ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpe1xuICAgIHRoaXMubG9hZGVkID0gbS5wcm9wKGZhbHNlKTtcbiAgICB0aGlzLnByb2dyZXNzID0gbS5wcm9wKDApO1xuICAgIHRoaXMudGFyZ2V0cyA9IG0ucHJvcChHYW1lTW9kZWwuZW50aXRpZXMoKS5jb25jYXQoR2FtZU1vZGVsLmJyYW5kcygpKSk7XG4gICAgdGhpcy50YXJnZXRzTG9hZGVkID0gbS5wcm9wKDApO1xuICAgIF9wcmVsb2FkLmNhbGwodGhpcyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExvYWRpbmdWTTsiLCIvKiBHbG9iYWwgbW9kdWxlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuICAgIFZlbG9jaXR5ID0gcmVxdWlyZSgndmVsb2NpdHktYW5pbWF0ZScpO1xuXG52YXIgVmlldyA9IGZ1bmN0aW9uKGN0cmwpe1xuXG4gICAgdmFyIGFuaW1JbiA9IGZ1bmN0aW9uKGVsLCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSB7XG4gICAgICAgIGlmICghaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPSAnZ2FtZSc7XG4gICAgICAgICAgICBWZWxvY2l0eShlbC5jaGlsZHJlblswXSwgeyB0cmFuc2xhdGVZIDogJys9MTcwcHgnIH0sIHsgZHVyYXRpb24gOiA1MDAsIGRlbGF5IDogMzAwLCBlYXNpbmcgOiAgWyAyNTAsIDAgXSB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbSgnI2dhbWUtcGFnZScsIFtcbiAgICAgICAgbSgnLmdhbWUtaG9sZGVyJywge1xuICAgICAgICAgICAgY29uZmlnIDogYW5pbUluXG4gICAgICAgIH0sW1xuICAgICAgICAgICAgbSgnaGVhZGVyLmdhbWUtaGVhZGVyLm91dC10b3AtZnVsbCcsIFtcbiAgICAgICAgICAgICAgICBtKCcudGltZXInKSxcbiAgICAgICAgICAgICAgICBtKCdoMy5jdXJyZW50LXF1ZXN0aW9uJywgY3RybC5WTS5xdWVzdGlvbigpKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCcuZ2FtZS1hcmVhJylcbiAgICAgICAgXSlcbiAgICBdKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVmlldzsiLCIvKiBHbG9iYWwgbW9kdWxlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuICAgIFZlbG9jaXR5ID0gcmVxdWlyZSgndmVsb2NpdHktYW5pbWF0ZScpO1xuXG52YXIgTG9hZGluZyA9IGZ1bmN0aW9uKGN0cmwpe1xuXG4gICAgdmFyIGFuaW1JbiA9IGZ1bmN0aW9uKGVsLCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSB7XG4gICAgICAgIGlmICghaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPSAnaW50cm8nO1xuICAgICAgICAgICAgVmVsb2NpdHkoZWwuY2hpbGRyZW5bMF0sIHsgb3BhY2l0eSA6IDEsIGxlZnQgOiAwIH0sIHsgZHVyYXRpb24gOiA1MDAsIGRlbGF5IDogMzAwfSk7XG4gICAgICAgICAgICBWZWxvY2l0eShlbC5jaGlsZHJlblsxXSwgeyBvcGFjaXR5IDogMSwgbGVmdCA6IDAgfSwgeyBkdXJhdGlvbiA6IDUwMCwgZGVsYXkgOiA1MDB9KTtcbiAgICAgICAgICAgIFZlbG9jaXR5KGVsLmNoaWxkcmVuWzJdLCB7IG9wYWNpdHkgOiAxIH0sIHsgZHVyYXRpb24gOiA1MDAsIGRlbGF5IDogMTAwMH0pO1xuICAgICAgICAgICAgVmVsb2NpdHkoZWwuY2hpbGRyZW5bM10sIHsgb3BhY2l0eSA6IDEsIHJvdGF0ZVogOiAnLTI1JywgcmlnaHQgOiAtNTAgfSwgeyBkdXJhdGlvbiA6IDUwMCwgZGVsYXkgOiAxNTAwLCBlYXNpbmcgOiBbIDI1MCwgMTUgXSB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFZlbG9jaXR5KGVsLmNoaWxkcmVuLCBcInJldmVyc2VcIik7XG4gICAgICAgICAgICBWZWxvY2l0eShlbC5jaGlsZHJlbiwgXCJyZXZlcnNlXCIpLnRoZW4oY3RybC5zdGFydEdhbWUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBtKCcjaW50cm8tcGFnZScsIFtcbiAgICAgICAgbSgnLmludHJvLWhvbGRlcicsIHtcbiAgICAgICAgICAgIGNvbmZpZyA6IGFuaW1JblxuICAgICAgICB9LFtcbiAgICAgICAgICAgIG0oJ2gyLm9wYXF1ZS5vdXQtbGVmdC1zaG9ydCcsIGN0cmwuVk0udGl0bGUoKSksXG4gICAgICAgICAgICBtKCcuZGVzY3JpcHRpb24ub3BhcXVlLm91dC1sZWZ0LXNob3J0JywgY3RybC5WTS5kZXNjcmlwdGlvbigpKSxcbiAgICAgICAgICAgIG0oJ2EuYmVnaW4ub3BhcXVlJywgeyBvbmNsaWNrOiBjdHJsLm9uQmVnaW4gfSwgJ2JlZ2luJyksXG4gICAgICAgICAgICBtKCcuYnJhbmQub3BhcXVlLm91dC1yaWdodC1mYXInLCB7IHN0eWxlIDogeyBiYWNrZ3JvdW5kSW1hZ2UgOiAndXJsKHswfSknLnJlcGxhY2UoJ3swfScsIGN0cmwuVk0uYnJhbmQoKSkgfSB9KVxuICAgICAgICBdKVxuICAgIF0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb2FkaW5nOyIsIi8qIEdsb2JhbCBtb2R1bGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG4gICAgVmVsb2NpdHkgPSByZXF1aXJlKCd2ZWxvY2l0eS1hbmltYXRlJyk7XG5cbnZhciBMb2FkaW5nID0gZnVuY3Rpb24oY3RybCl7XG5cbiAgICB2YXIgYW5pbUluID0gZnVuY3Rpb24oZWwsIGlzSW5pdGlhbGl6ZWQsIGNvbnRleHQpIHtcbiAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICBWZWxvY2l0eShlbCwgeyB0cmFuc2xhdGVYIDogJys9MTAwJScgfSwgeyBkZWxheSA6IDIwMCwgZHVyYXRpb24gOiAzMDAsIGVhc2luZyA6ICdlYXNlJyB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmKGN0cmwuVk0ubG9hZGVkKCkpIFZlbG9jaXR5KGVsLCBcInJldmVyc2VcIikudGhlbihjdHJsLm9ubG9hZGVkKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbSgnI2xvYWRpbmctcGFnZScsIFtcbiAgICAgICAgbSgnLm1lc3NhZ2UtaG9sZGVyLm91dC1sZWZ0LWZ1bGwnLCB7XG4gICAgICAgICAgICBjb25maWcgOiBhbmltSW5cbiAgICAgICAgfSxbXG4gICAgICAgICAgICBtKCdoMycsICdMb2FkaW5nICcgKyBjdHJsLlZNLnByb2dyZXNzKCkgKyAnJScpXG4gICAgICAgIF0pXG4gICAgXSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExvYWRpbmc7Il19
