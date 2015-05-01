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

},{"./libs/app.js":2}],2:[function(require,module,exports){
'use strict';

var m = require('mithril'),
	loadingViewModel = require('./../views/loading-vm'),
	loadingView = require('../views/loading-view');

var application = function(){
	var controller = function(){
		this.VM = new loadingViewModel();
		this.VM.init();
	};

	//initialize the application
	m.module(document.body, { controller: controller, view: loadingView });
};

module.exports = application;


},{"../views/loading-view":4,"./../views/loading-vm":5,"mithril":"mithril"}],3:[function(require,module,exports){
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
},{"mithril":"mithril"}],4:[function(require,module,exports){
'use strict';
/* Global module */

var m = require('mithril'),
    Velocity = require('velocity-animate');

var animIn = function(el, isInitialized, context) {
    if (!isInitialized) {
        Velocity(el, { translateX : '+=100%' }, { delay : 200, duration : 300, easing : 'ease' });
    }
};

var Loading = function(ctrl){
    return m('#loading-page', [
        m('.message-holder', {
            config : animIn
        },[
            m('h3', 'Loading'),
            m('.progress', { style: { width: ctrl.VM.progress() + '%', bottom: '-' + ((100 - ctrl.VM.progress()) / 5) + 'px' } } )
        ])
    ]);
};

module.exports = Loading;
},{"mithril":"mithril","velocity-animate":"velocity-animate"}],5:[function(require,module,exports){
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
},{"./../models/game-model":3,"mithril":"mithril"}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9tYWluLmpzIiwic3JjL3NjcmlwdHMvbGlicy9hcHAuanMiLCJzcmMvc2NyaXB0cy9tb2RlbHMvZ2FtZS1tb2RlbC5qcyIsInNyYy9zY3JpcHRzL3ZpZXdzL2xvYWRpbmctdmlldy5qcyIsInNyYy9zY3JpcHRzL3ZpZXdzL2xvYWRpbmctdm0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBBcHAgPSByZXF1aXJlKCcuL2xpYnMvYXBwLmpzJyk7XG5cbndpbmRvdy53aWRnZXRWZXJzaW9uID0gXCJ2MC4wLjBcIjtcblxudmFyIGluaXRBcHAgPSBmdW5jdGlvbihwYXJhbXMpe1xuXHR2YXIgaW5zdGFuY2UgPSBuZXcgQXBwKCk7XG59O1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBmdW5jdGlvbihldmVudCl7XG4gICAvL2RvIHdvcmtcbiAgIGluaXRBcHAoKTtcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcblx0bG9hZGluZ1ZpZXdNb2RlbCA9IHJlcXVpcmUoJy4vLi4vdmlld3MvbG9hZGluZy12bScpLFxuXHRsb2FkaW5nVmlldyA9IHJlcXVpcmUoJy4uL3ZpZXdzL2xvYWRpbmctdmlldycpO1xuXG52YXIgYXBwbGljYXRpb24gPSBmdW5jdGlvbigpe1xuXHR2YXIgY29udHJvbGxlciA9IGZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5WTSA9IG5ldyBsb2FkaW5nVmlld01vZGVsKCk7XG5cdFx0dGhpcy5WTS5pbml0KCk7XG5cdH07XG5cblx0Ly9pbml0aWFsaXplIHRoZSBhcHBsaWNhdGlvblxuXHRtLm1vZHVsZShkb2N1bWVudC5ib2R5LCB7IGNvbnRyb2xsZXI6IGNvbnRyb2xsZXIsIHZpZXc6IGxvYWRpbmdWaWV3IH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBhcHBsaWNhdGlvbjtcblxuIiwiJ3VzZSBzdHJpY3QnO1xuLyogR2xvYmFsIG1vZHVsZSAqL1xudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cbnZhciBkYXRhID0ge1xuXHRzY29yZSAgICAgOjAsXG5cdGVudGl0aWVzICA6WzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuXHRxdWVzdGlvbnMgOltdXG59O1xuXG52YXIgR2FtZU1vZGVsID0gZnVuY3Rpb24oKXtcblx0dGhpcy5zY29yZSBcdFx0PSBtLnByb3AoZGF0YS5zY29yZSk7XG5cdHRoaXMuZW50aXRpZXMgXHQ9IG0ucHJvcChkYXRhLmVudGl0aWVzKTtcblx0dGhpcy5xdWVzdGlvbnNcdD0gbS5wcm9wKGRhdGEucXVlc3Rpb25zKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IEdhbWVNb2RlbCgpOyIsIid1c2Ugc3RyaWN0Jztcbi8qIEdsb2JhbCBtb2R1bGUgKi9cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG4gICAgVmVsb2NpdHkgPSByZXF1aXJlKCd2ZWxvY2l0eS1hbmltYXRlJyk7XG5cbnZhciBhbmltSW4gPSBmdW5jdGlvbihlbCwgaXNJbml0aWFsaXplZCwgY29udGV4dCkge1xuICAgIGlmICghaXNJbml0aWFsaXplZCkge1xuICAgICAgICBWZWxvY2l0eShlbCwgeyB0cmFuc2xhdGVYIDogJys9MTAwJScgfSwgeyBkZWxheSA6IDIwMCwgZHVyYXRpb24gOiAzMDAsIGVhc2luZyA6ICdlYXNlJyB9KTtcbiAgICB9XG59O1xuXG52YXIgTG9hZGluZyA9IGZ1bmN0aW9uKGN0cmwpe1xuICAgIHJldHVybiBtKCcjbG9hZGluZy1wYWdlJywgW1xuICAgICAgICBtKCcubWVzc2FnZS1ob2xkZXInLCB7XG4gICAgICAgICAgICBjb25maWcgOiBhbmltSW5cbiAgICAgICAgfSxbXG4gICAgICAgICAgICBtKCdoMycsICdMb2FkaW5nJyksXG4gICAgICAgICAgICBtKCcucHJvZ3Jlc3MnLCB7IHN0eWxlOiB7IHdpZHRoOiBjdHJsLlZNLnByb2dyZXNzKCkgKyAnJScsIGJvdHRvbTogJy0nICsgKCgxMDAgLSBjdHJsLlZNLnByb2dyZXNzKCkpIC8gNSkgKyAncHgnIH0gfSApXG4gICAgICAgIF0pXG4gICAgXSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExvYWRpbmc7IiwiJ3VzZSBzdHJpY3QnO1xuLyogR2xvYmFsIG1vZHVsZSAqL1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcbiAgICBHYW1lTW9kZWwgPSByZXF1aXJlKCcuLy4uL21vZGVscy9nYW1lLW1vZGVsJyk7XG5cbnZhciBMb2FkaW5nVk0gPSBmdW5jdGlvbigpe307XG5cbi8qXG4gICAgUHJlbG9hZCBpbWFnZXNcbiovXG52YXIgX3ByZWxvYWQgPSBmdW5jdGlvbigpe1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy50YXJnZXRzTG9hZGVkKHRoaXMudGFyZ2V0c0xvYWRlZCgpICsgMSk7XG4gICAgICAgIGlmKHRoaXMudGFyZ2V0c0xvYWRlZCgpID09PSB0aGlzLnRhcmdldHMoKSkge1xuICAgICAgICAgICAgdGhpcy5sb2FkZWQodHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLnByb2dyZXNzKDEwMCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnByb2dyZXNzKE1hdGgucm91bmQoKHRoaXMudGFyZ2V0c0xvYWRlZCgpIC8gdGhpcy50YXJnZXRzKCkpICogMTAwKSk7XG4gICAgICAgICAgICBfcHJlbG9hZC5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSwgMTAwMCk7XG59O1xuXG4vKlxuICAgIFB1YmxpYyBNZW1iZXJzXG4qL1xuTG9hZGluZ1ZNLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmxvYWRlZCA9IG0ucHJvcChmYWxzZSk7XG4gICAgdGhpcy5wcm9ncmVzcz0gbS5wcm9wKDApO1xuICAgIHRoaXMudGFyZ2V0cyA9IG0ucHJvcChHYW1lTW9kZWwuZW50aXRpZXMoKS5sZW5ndGgpO1xuICAgIHRoaXMudGFyZ2V0c0xvYWRlZCA9IG0ucHJvcCgwKTtcbiAgICBfcHJlbG9hZC5jYWxsKHRoaXMpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb2FkaW5nVk07Il19
