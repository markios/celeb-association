'use strict';
/* Global module */

var _ = require('lodash'),
	m = require('mithril');


var _numberedString = function(target){
	var index = 0;
	return target.replace(/_(.*?)_/g, function (match, text, number) {
        var res = '{' + index + '}';
        index++
        return res;  
  	});
};

module.exports = {

	relativeTime : function(previous){
		var msPerMinute = 60 * 1000;
	    var msPerHour = msPerMinute * 60;
	    var msPerDay = msPerHour * 24;
	    var msPerMonth = msPerDay * 30;
	    var msPerYear = msPerDay * 365;

	    var elapsed = Date.now() - previous;

	    if (elapsed < msPerMinute) {
	         return Math.round(elapsed/1000) + ' seconds ago';
	    }
	    else if (elapsed < msPerHour) {
	         return Math.round(elapsed/msPerMinute) + ' minutes ago';
	    }
	    else if (elapsed < msPerDay ) {
	         return Math.round(elapsed/msPerHour ) + ' hours ago';
	    }
	    else if (elapsed < msPerMonth) {
	        return Math.round(elapsed/msPerDay) + ' days ago';   
	    }
	    else if (elapsed < msPerYear) {
	        return Math.round(elapsed/msPerMonth) + ' months ago';   
	    }
	    else {
	        return Math.round(elapsed/msPerYear ) + ' years ago';   
	    }
	},

	/*
		Replaces string with "_bold_ normal" text to mithril Array
	*/
	shorthandToMithrilArray : function(target){

		if(target.length === 0) return [];

		var keywordMembers = target.match(/_(.*?)_/g),
			numberDelimiteredString = _numberedString(target),
			targetArray = _.without(numberDelimiteredString.split(/{(\d+)}/), "");

		
		for (var i = 0, j = targetArray.length; i < j; i++) {
			var t = +targetArray[i];
			if(t >= 0) targetArray[i] = m('span', keywordMembers[t].replace(/_/g, ''));    this.guesses = m.prop(0);

		};

		return targetArray;

	}

};