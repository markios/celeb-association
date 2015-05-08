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