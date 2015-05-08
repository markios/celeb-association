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

},{"./libs/app.js":7}],2:[function(require,module,exports){
/**********************
   Velocity UI Pack
**********************/

/* VelocityJS.org UI Pack (5.0.4). (C) 2014 Julian Shapiro. MIT @license: en.wikipedia.org/wiki/MIT_License. Portions copyright Daniel Eden, Christian Pucci. */

;(function (factory) {
    /* CommonJS module. */
    if (typeof require === "function" && typeof exports === "object" ) {
        module.exports = factory();
    /* AMD module. */
    } else if (typeof define === "function" && define.amd) {
        define([ "velocity" ], factory);
    /* Browser globals. */
    } else {
        factory();
    }
}(function() {
return function (global, window, document, undefined) {

    /*************
        Checks
    *************/

    if (!global.Velocity || !global.Velocity.Utilities) {
        window.console && console.log("Velocity UI Pack: Velocity must be loaded first. Aborting.");
        return;
    } else {
        var Velocity = global.Velocity,
            $ = Velocity.Utilities;
    }

    var velocityVersion = Velocity.version,
        requiredVersion = { major: 1, minor: 1, patch: 0 };

    function greaterSemver (primary, secondary) {
        var versionInts = [];

        if (!primary || !secondary) { return false; }

        $.each([ primary, secondary ], function(i, versionObject) {
            var versionIntsComponents = [];

            $.each(versionObject, function(component, value) {
                while (value.toString().length < 5) {
                    value = "0" + value;
                }
                versionIntsComponents.push(value);
            });

            versionInts.push(versionIntsComponents.join(""))
        });

        return (parseFloat(versionInts[0]) > parseFloat(versionInts[1]));
    }

    if (greaterSemver(requiredVersion, velocityVersion)){
        var abortError = "Velocity UI Pack: You need to update Velocity (jquery.velocity.js) to a newer version. Visit http://github.com/julianshapiro/velocity.";
        alert(abortError);
        throw new Error(abortError);
    }

    /************************
       Effect Registration
    ************************/

    /* Note: RegisterUI is a legacy name. */
    Velocity.RegisterEffect = Velocity.RegisterUI = function (effectName, properties) {
        /* Animate the expansion/contraction of the elements' parent's height for In/Out effects. */
        function animateParentHeight (elements, direction, totalDuration, stagger) {
            var totalHeightDelta = 0,
                parentNode;

            /* Sum the total height (including padding and margin) of all targeted elements. */
            $.each(elements.nodeType ? [ elements ] : elements, function(i, element) {
                if (stagger) {
                    /* Increase the totalDuration by the successive delay amounts produced by the stagger option. */
                    totalDuration += i * stagger;
                }

                parentNode = element.parentNode;

                $.each([ "height", "paddingTop", "paddingBottom", "marginTop", "marginBottom"], function(i, property) {
                    totalHeightDelta += parseFloat(Velocity.CSS.getPropertyValue(element, property));
                });
            });

            /* Animate the parent element's height adjustment (with a varying duration multiplier for aesthetic benefits). */
            Velocity.animate(
                parentNode,
                { height: (direction === "In" ? "+" : "-") + "=" + totalHeightDelta },
                { queue: false, easing: "ease-in-out", duration: totalDuration * (direction === "In" ? 0.6 : 1) }
            );
        }

        /* Register a custom redirect for each effect. */
        Velocity.Redirects[effectName] = function (element, redirectOptions, elementsIndex, elementsSize, elements, promiseData) {
            var finalElement = (elementsIndex === elementsSize - 1);

            if (typeof properties.defaultDuration === "function") {
                properties.defaultDuration = properties.defaultDuration.call(elements, elements);
            } else {
                properties.defaultDuration = parseFloat(properties.defaultDuration);
            }

            /* Iterate through each effect's call array. */
            for (var callIndex = 0; callIndex < properties.calls.length; callIndex++) {
                var call = properties.calls[callIndex],
                    propertyMap = call[0],
                    redirectDuration = (redirectOptions.duration || properties.defaultDuration || 1000),
                    durationPercentage = call[1],
                    callOptions = call[2] || {},
                    opts = {};

                /* Assign the whitelisted per-call options. */
                opts.duration = redirectDuration * (durationPercentage || 1);
                opts.queue = redirectOptions.queue || "";
                opts.easing = callOptions.easing || "ease";
                opts.delay = parseFloat(callOptions.delay) || 0;
                opts._cacheValues = callOptions._cacheValues || true;

                /* Special processing for the first effect call. */
                if (callIndex === 0) {
                    /* If a delay was passed into the redirect, combine it with the first call's delay. */
                    opts.delay += (parseFloat(redirectOptions.delay) || 0);

                    if (elementsIndex === 0) {
                        opts.begin = function() {
                            /* Only trigger a begin callback on the first effect call with the first element in the set. */
                            redirectOptions.begin && redirectOptions.begin.call(elements, elements);

                            var direction = effectName.match(/(In|Out)$/);

                            /* Make "in" transitioning elements invisible immediately so that there's no FOUC between now
                               and the first RAF tick. */
                            if ((direction && direction[0] === "In") && propertyMap.opacity !== undefined) {
                                $.each(elements.nodeType ? [ elements ] : elements, function(i, element) {
                                    Velocity.CSS.setPropertyValue(element, "opacity", 0);
                                });
                            }

                            /* Only trigger animateParentHeight() if we're using an In/Out transition. */
                            if (redirectOptions.animateParentHeight && direction) {
                                animateParentHeight(elements, direction[0], redirectDuration + opts.delay, redirectOptions.stagger);
                            }
                        }
                    }

                    /* If the user isn't overriding the display option, default to "auto" for "In"-suffixed transitions. */
                    if (redirectOptions.display !== null) {
                        if (redirectOptions.display !== undefined && redirectOptions.display !== "none") {
                            opts.display = redirectOptions.display;
                        } else if (/In$/.test(effectName)) {
                            /* Inline elements cannot be subjected to transforms, so we switch them to inline-block. */
                            var defaultDisplay = Velocity.CSS.Values.getDisplayType(element);
                            opts.display = (defaultDisplay === "inline") ? "inline-block" : defaultDisplay;
                        }
                    }

                    if (redirectOptions.visibility && redirectOptions.visibility !== "hidden") {
                        opts.visibility = redirectOptions.visibility;
                    }
                }

                /* Special processing for the last effect call. */
                if (callIndex === properties.calls.length - 1) {
                    /* Append promise resolving onto the user's redirect callback. */
                    function injectFinalCallbacks () {
                        if ((redirectOptions.display === undefined || redirectOptions.display === "none") && /Out$/.test(effectName)) {
                            $.each(elements.nodeType ? [ elements ] : elements, function(i, element) {
                                Velocity.CSS.setPropertyValue(element, "display", "none");
                            });
                        }

                        redirectOptions.complete && redirectOptions.complete.call(elements, elements);

                        if (promiseData) {
                            promiseData.resolver(elements || element);
                        }
                    }

                    opts.complete = function() {
                        if (properties.reset) {
                            for (var resetProperty in properties.reset) {
                                var resetValue = properties.reset[resetProperty];

                                /* Format each non-array value in the reset property map to [ value, value ] so that changes apply
                                   immediately and DOM querying is avoided (via forcefeeding). */
                                /* Note: Don't forcefeed hooks, otherwise their hook roots will be defaulted to their null values. */
                                if (Velocity.CSS.Hooks.registered[resetProperty] === undefined && (typeof resetValue === "string" || typeof resetValue === "number")) {
                                    properties.reset[resetProperty] = [ properties.reset[resetProperty], properties.reset[resetProperty] ];
                                }
                            }

                            /* So that the reset values are applied instantly upon the next rAF tick, use a zero duration and parallel queueing. */
                            var resetOptions = { duration: 0, queue: false };

                            /* Since the reset option uses up the complete callback, we trigger the user's complete callback at the end of ours. */
                            if (finalElement) {
                                resetOptions.complete = injectFinalCallbacks;
                            }

                            Velocity.animate(element, properties.reset, resetOptions);
                        /* Only trigger the user's complete callback on the last effect call with the last element in the set. */
                        } else if (finalElement) {
                            injectFinalCallbacks();
                        }
                    };

                    if (redirectOptions.visibility === "hidden") {
                        opts.visibility = redirectOptions.visibility;
                    }
                }

                Velocity.animate(element, propertyMap, opts);
            }
        };

        /* Return the Velocity object so that RegisterUI calls can be chained. */
        return Velocity;
    };

    /*********************
       Packaged Effects
    *********************/

    /* Externalize the packagedEffects data so that they can optionally be modified and re-registered. */
    /* Support: <=IE8: Callouts will have no effect, and transitions will simply fade in/out. IE9/Android 2.3: Most effects are fully supported, the rest fade in/out. All other browsers: full support. */
    Velocity.RegisterEffect.packagedEffects =
        {
            /* Animate.css */
            "callout.bounce": {
                defaultDuration: 550,
                calls: [
                    [ { translateY: -30 }, 0.25 ],
                    [ { translateY: 0 }, 0.125 ],
                    [ { translateY: -15 }, 0.125 ],
                    [ { translateY: 0 }, 0.25 ]
                ]
            },
            /* Animate.css */
            "callout.shake": {
                defaultDuration: 800,
                calls: [
                    [ { translateX: -11 }, 0.125 ],
                    [ { translateX: 11 }, 0.125 ],
                    [ { translateX: -11 }, 0.125 ],
                    [ { translateX: 11 }, 0.125 ],
                    [ { translateX: -11 }, 0.125 ],
                    [ { translateX: 11 }, 0.125 ],
                    [ { translateX: -11 }, 0.125 ],
                    [ { translateX: 0 }, 0.125 ]
                ]
            },
            /* Animate.css */
            "callout.flash": {
                defaultDuration: 1100,
                calls: [
                    [ { opacity: [ 0, "easeInOutQuad", 1 ] }, 0.25 ],
                    [ { opacity: [ 1, "easeInOutQuad" ] }, 0.25 ],
                    [ { opacity: [ 0, "easeInOutQuad" ] }, 0.25 ],
                    [ { opacity: [ 1, "easeInOutQuad" ] }, 0.25 ]
                ]
            },
            /* Animate.css */
            "callout.pulse": {
                defaultDuration: 825,
                calls: [
                    [ { scaleX: 1.1, scaleY: 1.1 }, 0.50, { easing: "easeInExpo" } ],
                    [ { scaleX: 1, scaleY: 1 }, 0.50 ]
                ]
            },
            /* Animate.css */
            "callout.swing": {
                defaultDuration: 950,
                calls: [
                    [ { rotateZ: 15 }, 0.20 ],
                    [ { rotateZ: -10 }, 0.20 ],
                    [ { rotateZ: 5 }, 0.20 ],
                    [ { rotateZ: -5 }, 0.20 ],
                    [ { rotateZ: 0 }, 0.20 ]
                ]
            },
            /* Animate.css */
            "callout.tada": {
                defaultDuration: 1000,
                calls: [
                    [ { scaleX: 0.9, scaleY: 0.9, rotateZ: -3 }, 0.10 ],
                    [ { scaleX: 1.1, scaleY: 1.1, rotateZ: 3 }, 0.10 ],
                    [ { scaleX: 1.1, scaleY: 1.1, rotateZ: -3 }, 0.10 ],
                    [ "reverse", 0.125 ],
                    [ "reverse", 0.125 ],
                    [ "reverse", 0.125 ],
                    [ "reverse", 0.125 ],
                    [ "reverse", 0.125 ],
                    [ { scaleX: 1, scaleY: 1, rotateZ: 0 }, 0.20 ]
                ]
            },
            "transition.fadeIn": {
                defaultDuration: 500,
                calls: [
                    [ { opacity: [ 1, 0 ] } ]
                ]
            },
            "transition.fadeOut": {
                defaultDuration: 500,
                calls: [
                    [ { opacity: [ 0, 1 ] } ]
                ]
            },
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipXIn": {
                defaultDuration: 700,
                calls: [
                    [ { opacity: [ 1, 0 ], transformPerspective: [ 800, 800 ], rotateY: [ 0, -55 ] } ]
                ],
                reset: { transformPerspective: 0 }
            },
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipXOut": {
                defaultDuration: 700,
                calls: [
                    [ { opacity: [ 0, 1 ], transformPerspective: [ 800, 800 ], rotateY: 55 } ]
                ],
                reset: { transformPerspective: 0, rotateY: 0 }
            },
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipYIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], transformPerspective: [ 800, 800 ], rotateX: [ 0, -45 ] } ]
                ],
                reset: { transformPerspective: 0 }
            },
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipYOut": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 0, 1 ], transformPerspective: [ 800, 800 ], rotateX: 25 } ]
                ],
                reset: { transformPerspective: 0, rotateX: 0 }
            },
            /* Animate.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipBounceXIn": {
                defaultDuration: 900,
                calls: [
                    [ { opacity: [ 0.725, 0 ], transformPerspective: [ 400, 400 ], rotateY: [ -10, 90 ] }, 0.50 ],
                    [ { opacity: 0.80, rotateY: 10 }, 0.25 ],
                    [ { opacity: 1, rotateY: 0 }, 0.25 ]
                ],
                reset: { transformPerspective: 0 }
            },
            /* Animate.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipBounceXOut": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 0.9, 1 ], transformPerspective: [ 400, 400 ], rotateY: -10 }, 0.50 ],
                    [ { opacity: 0, rotateY: 90 }, 0.50 ]
                ],
                reset: { transformPerspective: 0, rotateY: 0 }
            },
            /* Animate.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipBounceYIn": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 0.725, 0 ], transformPerspective: [ 400, 400 ], rotateX: [ -10, 90 ] }, 0.50 ],
                    [ { opacity: 0.80, rotateX: 10 }, 0.25 ],
                    [ { opacity: 1, rotateX: 0 }, 0.25 ]
                ],
                reset: { transformPerspective: 0 }
            },
            /* Animate.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipBounceYOut": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 0.9, 1 ], transformPerspective: [ 400, 400 ], rotateX: -15 }, 0.50 ],
                    [ { opacity: 0, rotateX: 90 }, 0.50 ]
                ],
                reset: { transformPerspective: 0, rotateX: 0 }
            },
            /* Magic.css */
            "transition.swoopIn": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 1, 0 ], transformOriginX: [ "100%", "50%" ], transformOriginY: [ "100%", "100%" ], scaleX: [ 1, 0 ], scaleY: [ 1, 0 ], translateX: [ 0, -700 ], translateZ: 0 } ]
                ],
                reset: { transformOriginX: "50%", transformOriginY: "50%" }
            },
            /* Magic.css */
            "transition.swoopOut": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 0, 1 ], transformOriginX: [ "50%", "100%" ], transformOriginY: [ "100%", "100%" ], scaleX: 0, scaleY: 0, translateX: -700, translateZ: 0 } ]
                ],
                reset: { transformOriginX: "50%", transformOriginY: "50%", scaleX: 1, scaleY: 1, translateX: 0 }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3. (Fades and scales only.) */
            "transition.whirlIn": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 1, 0 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: [ 1, 0 ], scaleY: [ 1, 0 ], rotateY: [ 0, 160 ] }, 1, { easing: "easeInOutSine" } ]
                ]
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3. (Fades and scales only.) */
            "transition.whirlOut": {
                defaultDuration: 750,
                calls: [
                    [ { opacity: [ 0, "easeInOutQuint", 1 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: 0, scaleY: 0, rotateY: 160 }, 1, { easing: "swing" } ]
                ],
                reset: { scaleX: 1, scaleY: 1, rotateY: 0 }
            },
            "transition.shrinkIn": {
                defaultDuration: 750,
                calls: [
                    [ { opacity: [ 1, 0 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: [ 1, 1.5 ], scaleY: [ 1, 1.5 ], translateZ: 0 } ]
                ]
            },
            "transition.shrinkOut": {
                defaultDuration: 600,
                calls: [
                    [ { opacity: [ 0, 1 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: 1.3, scaleY: 1.3, translateZ: 0 } ]
                ],
                reset: { scaleX: 1, scaleY: 1 }
            },
            "transition.expandIn": {
                defaultDuration: 700,
                calls: [
                    [ { opacity: [ 1, 0 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: [ 1, 0.625 ], scaleY: [ 1, 0.625 ], translateZ: 0 } ]
                ]
            },
            "transition.expandOut": {
                defaultDuration: 700,
                calls: [
                    [ { opacity: [ 0, 1 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: 0.5, scaleY: 0.5, translateZ: 0 } ]
                ],
                reset: { scaleX: 1, scaleY: 1 }
            },
            /* Animate.css */
            "transition.bounceIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], scaleX: [ 1.05, 0.3 ], scaleY: [ 1.05, 0.3 ] }, 0.40 ],
                    [ { scaleX: 0.9, scaleY: 0.9, translateZ: 0 }, 0.20 ],
                    [ { scaleX: 1, scaleY: 1 }, 0.50 ]
                ]
            },
            /* Animate.css */
            "transition.bounceOut": {
                defaultDuration: 800,
                calls: [
                    [ { scaleX: 0.95, scaleY: 0.95 }, 0.35 ],
                    [ { scaleX: 1.1, scaleY: 1.1, translateZ: 0 }, 0.35 ],
                    [ { opacity: [ 0, 1 ], scaleX: 0.3, scaleY: 0.3 }, 0.30 ]
                ],
                reset: { scaleX: 1, scaleY: 1 }
            },
            /* Animate.css */
            "transition.bounceUpIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], translateY: [ -30, 1000 ] }, 0.60, { easing: "easeOutCirc" } ],
                    [ { translateY: 10 }, 0.20 ],
                    [ { translateY: 0 }, 0.20 ]
                ]
            },
            /* Animate.css */
            "transition.bounceUpOut": {
                defaultDuration: 1000,
                calls: [
                    [ { translateY: 20 }, 0.20 ],
                    [ { opacity: [ 0, "easeInCirc", 1 ], translateY: -1000 }, 0.80 ]
                ],
                reset: { translateY: 0 }
            },
            /* Animate.css */
            "transition.bounceDownIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], translateY: [ 30, -1000 ] }, 0.60, { easing: "easeOutCirc" } ],
                    [ { translateY: -10 }, 0.20 ],
                    [ { translateY: 0 }, 0.20 ]
                ]
            },
            /* Animate.css */
            "transition.bounceDownOut": {
                defaultDuration: 1000,
                calls: [
                    [ { translateY: -20 }, 0.20 ],
                    [ { opacity: [ 0, "easeInCirc", 1 ], translateY: 1000 }, 0.80 ]
                ],
                reset: { translateY: 0 }
            },
            /* Animate.css */
            "transition.bounceLeftIn": {
                defaultDuration: 750,
                calls: [
                    [ { opacity: [ 1, 0 ], translateX: [ 30, -1250 ] }, 0.60, { easing: "easeOutCirc" } ],
                    [ { translateX: -10 }, 0.20 ],
                    [ { translateX: 0 }, 0.20 ]
                ]
            },
            /* Animate.css */
            "transition.bounceLeftOut": {
                defaultDuration: 750,
                calls: [
                    [ { translateX: 30 }, 0.20 ],
                    [ { opacity: [ 0, "easeInCirc", 1 ], translateX: -1250 }, 0.80 ]
                ],
                reset: { translateX: 0 }
            },
            /* Animate.css */
            "transition.bounceRightIn": {
                defaultDuration: 750,
                calls: [
                    [ { opacity: [ 1, 0 ], translateX: [ -30, 1250 ] }, 0.60, { easing: "easeOutCirc" } ],
                    [ { translateX: 10 }, 0.20 ],
                    [ { translateX: 0 }, 0.20 ]
                ]
            },
            /* Animate.css */
            "transition.bounceRightOut": {
                defaultDuration: 750,
                calls: [
                    [ { translateX: -30 }, 0.20 ],
                    [ { opacity: [ 0, "easeInCirc", 1 ], translateX: 1250 }, 0.80 ]
                ],
                reset: { translateX: 0 }
            },
            "transition.slideUpIn": {
                defaultDuration: 900,
                calls: [
                    [ { opacity: [ 1, 0 ], translateY: [ 0, 20 ], translateZ: 0 } ]
                ]
            },
            "transition.slideUpOut": {
                defaultDuration: 900,
                calls: [
                    [ { opacity: [ 0, 1 ], translateY: -20, translateZ: 0 } ]
                ],
                reset: { translateY: 0 }
            },
            "transition.slideDownIn": {
                defaultDuration: 900,
                calls: [
                    [ { opacity: [ 1, 0 ], translateY: [ 0, -20 ], translateZ: 0 } ]
                ]
            },
            "transition.slideDownOut": {
                defaultDuration: 900,
                calls: [
                    [ { opacity: [ 0, 1 ], translateY: 20, translateZ: 0 } ]
                ],
                reset: { translateY: 0 }
            },
            "transition.slideLeftIn": {
                defaultDuration: 1000,
                calls: [
                    [ { opacity: [ 1, 0 ], translateX: [ 0, -20 ], translateZ: 0 } ]
                ]
            },
            "transition.slideLeftOut": {
                defaultDuration: 1050,
                calls: [
                    [ { opacity: [ 0, 1 ], translateX: -20, translateZ: 0 } ]
                ],
                reset: { translateX: 0 }
            },
            "transition.slideRightIn": {
                defaultDuration: 1000,
                calls: [
                    [ { opacity: [ 1, 0 ], translateX: [ 0, 20 ], translateZ: 0 } ]
                ]
            },
            "transition.slideRightOut": {
                defaultDuration: 1050,
                calls: [
                    [ { opacity: [ 0, 1 ], translateX: 20, translateZ: 0 } ]
                ],
                reset: { translateX: 0 }
            },
            "transition.slideUpBigIn": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 1, 0 ], translateY: [ 0, 75 ], translateZ: 0 } ]
                ]
            },
            "transition.slideUpBigOut": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 0, 1 ], translateY: -75, translateZ: 0 } ]
                ],
                reset: { translateY: 0 }
            },
            "transition.slideDownBigIn": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 1, 0 ], translateY: [ 0, -75 ], translateZ: 0 } ]
                ]
            },
            "transition.slideDownBigOut": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 0, 1 ], translateY: 75, translateZ: 0 } ]
                ],
                reset: { translateY: 0 }
            },
            "transition.slideLeftBigIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], translateX: [ 0, -75 ], translateZ: 0 } ]
                ]
            },
            "transition.slideLeftBigOut": {
                defaultDuration: 750,
                calls: [
                    [ { opacity: [ 0, 1 ], translateX: -75, translateZ: 0 } ]
                ],
                reset: { translateX: 0 }
            },
            "transition.slideRightBigIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], translateX: [ 0, 75 ], translateZ: 0 } ]
                ]
            },
            "transition.slideRightBigOut": {
                defaultDuration: 750,
                calls: [
                    [ { opacity: [ 0, 1 ], translateX: 75, translateZ: 0 } ]
                ],
                reset: { translateX: 0 }
            },
            /* Magic.css */
            "transition.perspectiveUpIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], transformPerspective: [ 800, 800 ], transformOriginX: [ 0, 0 ], transformOriginY: [ "100%", "100%" ], rotateX: [ 0, -180 ] } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%" }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.perspectiveUpOut": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 0, 1 ], transformPerspective: [ 800, 800 ], transformOriginX: [ 0, 0 ], transformOriginY: [ "100%", "100%" ], rotateX: -180 } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%", rotateX: 0 }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.perspectiveDownIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], transformPerspective: [ 800, 800 ], transformOriginX: [ 0, 0 ], transformOriginY: [ 0, 0 ], rotateX: [ 0, 180 ] } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%" }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.perspectiveDownOut": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 0, 1 ], transformPerspective: [ 800, 800 ], transformOriginX: [ 0, 0 ], transformOriginY: [ 0, 0 ], rotateX: 180 } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%", rotateX: 0 }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.perspectiveLeftIn": {
                defaultDuration: 950,
                calls: [
                    [ { opacity: [ 1, 0 ], transformPerspective: [ 2000, 2000 ], transformOriginX: [ 0, 0 ], transformOriginY: [ 0, 0 ], rotateY: [ 0, -180 ] } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%" }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.perspectiveLeftOut": {
                defaultDuration: 950,
                calls: [
                    [ { opacity: [ 0, 1 ], transformPerspective: [ 2000, 2000 ], transformOriginX: [ 0, 0 ], transformOriginY: [ 0, 0 ], rotateY: -180 } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%", rotateY: 0 }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.perspectiveRightIn": {
                defaultDuration: 950,
                calls: [
                    [ { opacity: [ 1, 0 ], transformPerspective: [ 2000, 2000 ], transformOriginX: [ "100%", "100%" ], transformOriginY: [ 0, 0 ], rotateY: [ 0, 180 ] } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%" }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.perspectiveRightOut": {
                defaultDuration: 950,
                calls: [
                    [ { opacity: [ 0, 1 ], transformPerspective: [ 2000, 2000 ], transformOriginX: [ "100%", "100%" ], transformOriginY: [ 0, 0 ], rotateY: 180 } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%", rotateY: 0 }
            }
        };

    /* Register the packaged effects. */
    for (var effectName in Velocity.RegisterEffect.packagedEffects) {
        Velocity.RegisterEffect(effectName, Velocity.RegisterEffect.packagedEffects[effectName]);
    }

    /*********************
       Sequence Running
    **********************/

    /* Note: Sequence calls must use Velocity's single-object arguments syntax. */
    Velocity.RunSequence = function (originalSequence) {
        var sequence = $.extend(true, [], originalSequence);

        if (sequence.length > 1) {
            $.each(sequence.reverse(), function(i, currentCall) {
                var nextCall = sequence[i + 1];

                if (nextCall) {
                    /* Parallel sequence calls (indicated via sequenceQueue:false) are triggered
                       in the previous call's begin callback. Otherwise, chained calls are normally triggered
                       in the previous call's complete callback. */
                    var currentCallOptions = currentCall.o || currentCall.options,
                        nextCallOptions = nextCall.o || nextCall.options;

                    var timing = (currentCallOptions && currentCallOptions.sequenceQueue === false) ? "begin" : "complete",
                        callbackOriginal = nextCallOptions && nextCallOptions[timing],
                        options = {};

                    options[timing] = function() {
                        var nextCallElements = nextCall.e || nextCall.elements;
                        var elements = nextCallElements.nodeType ? [ nextCallElements ] : nextCallElements;

                        callbackOriginal && callbackOriginal.call(elements, elements);
                        Velocity(currentCall);
                    }

                    if (nextCall.o) {
                        nextCall.o = $.extend({}, nextCallOptions, options);
                    } else {
                        nextCall.options = $.extend({}, nextCallOptions, options);
                    }
                }
            });

            sequence.reverse();
        }

        Velocity(sequence[0]);
    };
}((window.jQuery || window.Zepto || window), window, document);
}));
},{}],3:[function(require,module,exports){
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

GameController.prototype.ready = function(){
	setTimeout(function(){
		this.VM.startGame();
		m.redraw();
	}.bind(this), 1000);
};

GameController.prototype.toggle = function(ans){
	if(this.VM.locked()) return;

	var answerIsSelected = ans.selected();
	if(this.VM.question().guessLimitReached() && !answerIsSelected){
		ans.toggleRejected(true);
	} else {
		ans.selected(!ans.selected());
		ans.toggled(true);
		// count the guesses again
		this.VM.question().countGuess();
	}
	m.redraw();
};

GameController.prototype.onTime = function(){
    this.VM.locked(true);
    this.VM.endQuestion(true);
    m.redraw();
};

GameController.prototype.afterEndQuestion = function(){
    this.VM.stopQuestion();
    m.redraw();
    this.VM.nextQuestion();
    m.redraw();
};

GameController.prototype.startQuestion = function(){
    this.VM.startQuestion();
    m.redraw();
};

GameController.prototype.endGame = function(){
	this.VM.updateScore();
	m.route("/result");
};

module.exports = GameController;
},{"./../models/game-vm":10,"mithril":"mithril"}],4:[function(require,module,exports){
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
	m.redraw();
};

IntroController.prototype.startGame = function(){
	m.route("/game");
};

module.exports = IntroController;
},{"./../models/intro-vm":11,"mithril":"mithril"}],5:[function(require,module,exports){
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
},{"./../models/loading-vm":12,"mithril":"mithril"}],6:[function(require,module,exports){
/* global m */
'use strict';

var m = require('mithril'),
	resultViewModel = require('./../models/result-vm');

var ResultController = function(){
	this.VM = new resultViewModel();
	this.VM.init();
};

/*
	Public Members
*/


module.exports = ResultController;
},{"./../models/result-vm":13,"mithril":"mithril"}],7:[function(require,module,exports){
'use strict';

var m = require('mithril'),
	Velocity = require('velocity-animate'),
	v = require('velocity-animate/velocity.ui'),
	gameController = require('../controllers/game-controller'),
	gameView = require('../views/game-view'),
	resultController = require('../controllers/result-controller'),
	resultView = require('../views/result-view'),
	introController = require('../controllers/intro-controller'),
	introView = require('../views/intro-view'),
	loadingController = require('../controllers/loading-controller'),
	loadingView = require('../views/loading-view');

var application = function(){
	//initialize the application
	var app = {
		loading : { controller: loadingController, view: loadingView },
		intro   : { controller: introController,   view: introView },
		game	: { controller: gameController, view: gameView },
		result  : { controller: resultController, view: resultView },
	}

	m.route.mode = "hash";

	m.route(document.body, "/", {
	    ""		 : app.loading,
	    "/intro" : app.intro,
	    "/game"  : app.game,
	    "/result": app.result
	});
};

module.exports = application;
},{"../controllers/game-controller":3,"../controllers/intro-controller":4,"../controllers/loading-controller":5,"../controllers/result-controller":6,"../views/game-view":15,"../views/intro-view":16,"../views/loading-view":17,"../views/result-view":18,"mithril":"mithril","velocity-animate":"velocity-animate","velocity-animate/velocity.ui":2}],8:[function(require,module,exports){
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
},{"lodash":"lodash","mithril":"mithril"}],9:[function(require,module,exports){
'use strict';
/* Global module */
var m = require('mithril'),
	_ = require('lodash');

var CONST_KEY = 'show-star-beta';

/*
	You would obtain this by xhr
*/
var data = {
	title : "Show Star",
	description : "Can you associate the celebrities with the shows in the time limit? Careful though, you will be deducted for an incorrect guess",
	timer : 5,
	assets : [
		 { name : 'brand', image : 'http://img-a.zeebox.com/images/z/a5bf62ac-3e5f-46fa-9b59-59c09bc03d3e.png' },
		 { name : 'positive', image : 'http://img-a.zeebox.com/images/z/289e953b-a8b9-4e8b-89d5-1769e1fb168b.png' },
		 { name : 'moderate', image : 'http://img-a.zeebox.com/images/z/fffc4fe7-2e12-43c2-852c-d60c7d4fb5a2.png' },
		 { name : 'negative', image : 'http://img-a.zeebox.com/images/z/75fb3091-574c-4863-bf21-0ea1825c4853.png' },
		 { name : 'trophy', image : 'http://img-a.zeebox.com/images/z/9ecda2e2-6d09-48dd-a166-32ec232bdb8b.png' }
	],
	questions :[{
		question : "_Choose 3_ of the following appeared in the 90's sitcom _Friends_",
		answers  : [
			{ image : 'http://img-a.zeebox.com/images/z/ca511030-f77e-46df-a1a9-10586284a38b.png', name : 'Lisa Kudrow', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/b33cb262-e175-44f4-a58e-42523391fb5d.png', name : 'Matt Le Blanc', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/0e831e8c-8d60-43ea-ab7d-9bbfd4ffb3ad.png', name : 'Donald Glover', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/861b18aa-152c-4ae0-9118-ffa05b79bc76.png', name : 'Wayne Knight', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/5d9c9fc8-606e-484a-b4fd-eb0e0bdc4497.png', name : 'Demi Moore', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/40e8037e-12b2-44d3-9f84-71fe3de0bdaf.png', name : 'Michael Richards', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/64b80a30-57a6-4928-a805-70bc38641018.png', name : 'Jessica Westfeldt', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/4bc0776e-1cf8-4b12-881b-f7154343dbe4.png', name : 'Jennifer Aniston', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/b3f91a63-e987-4ea7-81ab-586f930610ae.png', name : 'Jason Alexander', correct : false }
		]
	},
	{
		question : "Going back a little further, _Choose 3_ who starred in the cult classic _Seinfeld_?",
		answers  : [
			{ image : 'http://img-a.zeebox.com/images/z/21d9a055-b1c6-4d4d-a4b6-51319fc65165.png', name : 'David Schwimmer', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/ca511030-f77e-46df-a1a9-10586284a38b.png', name : 'Lisa Kudrow', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/b33cb262-e175-44f4-a58e-42523391fb5d.png', name : 'Matt Le Blanc', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/e77b6617-f543-46cb-b435-37b6b1a442d7.png', name : 'Courtney Cox-Arquette', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/861b18aa-152c-4ae0-9118-ffa05b79bc76.png', name : 'Wayne Knight', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/3a6eead3-90cc-406c-99e1-493923b3e8d0.png', name : 'Matthew Perry', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/40e8037e-12b2-44d3-9f84-71fe3de0bdaf.png', name : 'Michael Richards', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/1b59c445-8f3e-46bd-ad57-c15a73c7a68a.png', name : 'Paul Wasilewski', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/b3f91a63-e987-4ea7-81ab-586f930610ae.png', name : 'Jason Alexander', correct : true }
		]
	},
	{
		question : "Which of the following _3 Actors_ appeared in _Community_",
		answers  : [
			{ image : 'http://img-a.zeebox.com/images/z/1b10f366-15a1-4c38-9ad6-42942a05c20a.png', name : 'Ryan Seacrest', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/989bbe49-753e-4234-885d-1929314a371e.png', name : 'Frank Abagnale jr', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/2948182b-fa75-43ff-961f-59e63605ae38.png', name : 'Kumail Nanjiani', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/63c31d8d-2554-4230-a006-1df7766060a7.png', name : 'Chevy Chase', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/03833a81-7aa7-4c3b-884f-167277b19c24.png', name : 'Yvette Nicole Brown', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/fc2630dc-b37e-4203-99c5-0c8370af11ab.png', name : 'Ken Jeong', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/c7663601-3352-4c11-aad6-475d09684011.png', name : 'Zack Braff', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/cf3f7e17-b850-4a12-8da6-8cd5aad4a5ba.png', name : 'Alomoa Wright', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/5296bcd0-6f6a-41c9-be27-b7a1e0bea458.png', name : 'Joel McHale', correct : true }
		]
	},
	{
		question : "Getting a little more modern, _Choose 5_ from HBO's _Silicon Valley_",
		answers  : [
			{ image : 'http://img-a.zeebox.com/images/z/f0aa487c-4b2e-4735-b963-c745ee1f7125.png', name : 'Zach Woods', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/989bbe49-753e-4234-885d-1929314a371e.png', name : 'Frank Abagnale jr', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/a6b28be6-d0f9-4de0-909f-50b021a6288a.png', name : 'Martin Starr', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/2948182b-fa75-43ff-961f-59e63605ae38.png', name : 'Kumail Nanjiani', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/03833a81-7aa7-4c3b-884f-167277b19c24.png', name : 'Yvette Nicole Brown', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/fc2630dc-b37e-4203-99c5-0c8370af11ab.png', name : 'Ken Jeong', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/c7663601-3352-4c11-aad6-475d09684011.png', name : 'Zack Braff', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/93350291-30e2-4403-afbd-97309b354f59.png', name : 'TJ Miller', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/03376004-ed1c-4061-a541-80b18e66a45d.png', name : 'Thomas Middleditch', correct : true }
		]
	}
	],
	resultMessages : {
		20  : "Oh oh….think you need to spend some time on the couch this weekend, honing in on your TV skills!",
		40  : "Pretty good, although the pressure must have got the best of you…Try again!",
		60  : "Great effort! You’re nearly amazing…nearly….why don’t you ask the Home Of Comedy TV Room for some help? Click here or try your luck again and play again!",
		80  : "Amazing Stuff - you are at the top of the leaderboard! Near perfect! Be perfect…Play again!",
		100 : "Genius…..you know your TV. Let’s see how you go on Level 2"
	}
};


var _getMaxScore = function(){
	var score = 0;
	_.each(data.questions, function(q){
		score += _.filter(q.answers, { correct : true }).length;
	});
	return score;
};

var _hasLocalStorage = function(){
	var mod = 'xx';
	try {
        localStorage.setItem(mod, mod);
        localStorage.removeItem(mod);
        return true;
    } catch(e) {
        return false;
    }
};

var _tryParse = function(target){
	var result = [];
	try {
		return JSON.parse(target) || result;
	} catch(e) {
		return result;
	}
};

var _getPreviousScores = function(){
	if(!_hasLocalStorage()) return [];
	return _tryParse(localStorage.getItem(CONST_KEY));
};

/*
	Constructor
*/
var GameModel = function(){
	this.score 		= m.prop(0);
	this.highScore  = m.prop(_getMaxScore());
	this.questions	= m.prop(data.questions);
	this.assets     = m.prop(data.assets);
	this.title		= m.prop(data.title);
	this.resultMessages = m.prop(data.resultMessages);
	this.description = m.prop(data.description);
	this.timer = m.prop(data.timer || 5);
	this.previousScores = m.prop(_getPreviousScores());
};

/*
	Public Members
*/

GameModel.prototype.saveScore = function(score){
	
	this.score(score);

	// Update previous scores
	var previousScores = this.previousScores();
	previousScores.push({ date : Date.now(), score : score });
	this.previousScores(previousScores);

	// save in local storage where available
	if(! _hasLocalStorage()) return;
	localStorage.setItem(CONST_KEY, JSON.stringify(this.previousScores()));
};



module.exports = new GameModel();




},{"lodash":"lodash","mithril":"mithril"}],10:[function(require,module,exports){
'use strict';
/* Global module */

var m = require('mithril'),
    _ = require('lodash'),
    utils = require('./../libs/utils'),
    GameModel = require('./../models/game-model');

var Answer = function(d){
    this.image = m.prop(d.image);
    this.name = m.prop(d.name);
    this.selected = m.prop(false);
    this.correct = m.prop(d.correct);
    
    // view markers
    this.toggled = m.prop(false);
    this.toggleRejected = m.prop(false);
};

Answer.prototype.getScore = function(){
    var score = 0;
    if(this.selected() && this.correct()) score = 1;
    return score;
};

var Question = function(d){
    this.text = m.prop(d.question);
    this.questionElement = m.prop(utils.shorthandToMithrilArray(d.question));
    this.answers = m.prop(_.map(d.answers, function(a){
        return new Answer(a);
    }));
    this.guesses = m.prop(0);
    this.limit = m.prop(_.filter(d.answers, { correct : true }).length);
};

Question.prototype.guessLimitReached = function(){
    return this.guesses() === this.limit();
};

Question.prototype.countGuess = function(){
    this.guesses(_.filter(this.answers(), function(ans){
        return ans.selected();
    }).length);
};

var Timer = function(time){
    this.isActive = m.prop(false);
    this.time = m.prop(time * 1000);
};
    
/*
    Constructor
*/

var GameVM = function(){};


/*
    Private Members
*/

var _clearQuestion = function(){
    return new Question({ question : "", answers : [] });
};

// You can get negative scores!!
var _updateScore = function(){
    var currentScore = this.currentScore(),
        score = 0;

    _.each(this.question().answers(), function(ans){
        score += ans.getScore();
    });

    this.currentScore(currentScore + score);
};

var _setCurrentQuestion = function(){
    var q = new Question(this.questions()[this.currentQuestion()]);
    this.question(q);
};

var _nextQuestion = function(){
    var current = this.currentQuestion() + 1,
        isEnd = current === this.totalQuestions();

    this.gameOver(isEnd);
    if(! isEnd) {
        this.questionShown(false);
        this.currentQuestion(current);
        _setCurrentQuestion.call(this);
    }
};



/*
    Public Members
*/
GameVM.prototype.init = function(){
    var questions = GameModel.questions();
    this.currentQuestion = m.prop(0);
    this.currentScore = m.prop(0);
    this.timer = m.prop(null);
    this.questions = m.prop(questions);
    this.totalQuestions = m.prop(questions.length);
    this.gameOver = m.prop(false);
    this.question = m.prop(_clearQuestion());
    
    // View Queues 
    this.locked = m.prop(true);
    this.questionShown = m.prop(false);
    this.endQuestion = m.prop(false);
};

GameVM.prototype.startGame = function(){
    _setCurrentQuestion.call(this);
};

GameVM.prototype.stopQuestion = function(){
    this.endQuestion(false);
    _updateScore.call(this);
    this.question(_clearQuestion());
};

GameVM.prototype.nextQuestion = function(){
    _nextQuestion.call(this);
};

GameVM.prototype.updateScore = function(){
    GameModel.saveScore(this.currentScore());
};

GameVM.prototype.startQuestion = function(){
    this.timer(new Timer(GameModel.timer()));
    this.locked(false);
};

module.exports = GameVM;
},{"./../libs/utils":8,"./../models/game-model":9,"lodash":"lodash","mithril":"mithril"}],11:[function(require,module,exports){
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
},{"./../models/game-model":9,"lodash":"lodash","mithril":"mithril"}],12:[function(require,module,exports){
'use strict';
/* Global module */

var m = require('mithril'),
    _  = require('lodash'),
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
    var questions = GameModel.questions(),
        assets = GameModel.assets(),
        entities = [];

    _.each(questions, function(q){
        entities = _.union(entities, _.pluck(q.answers, 'image'));
    });
    entities = _.union(entities, _.pluck(assets, 'image'));

    this.loaded = m.prop(false);
    this.progress = m.prop(0);
    this.targets = m.prop(entities);
    this.targetsLoaded = m.prop(0);
    _preload.call(this);
};

module.exports = LoadingVM;
},{"./../models/game-model":9,"lodash":"lodash","mithril":"mithril"}],13:[function(require,module,exports){
'use strict';
/* Global module */

var m = require('mithril'),
	_ = require('lodash'),
    GameModel = require('./../models/game-model');

var ResultVM = function(){};

/*
	Private Memebers
*/

var _calcMessage = function(){
	var messages = this.resultMessages(),
		percentage = Math.round((this.score() / this.highScore()) * 100),
		result = messages[20];

	for(var res in messages) {
		if(percentage >= res) result = messages[res];
		else break;
	}

	return result;
};

var _calcTopFive = function(previousScores){
    if(previousScores.length <= 1) return previousScores;
    previousScores = _.sortBy(previousScores, function(s){
        return -s.score;
    });
    return previousScores.slice(0,5);
};

var _getResultImage = function(){
	return _.findWhere(this.assets(), { name : 'trophy' }).image;
};

/*
    Public Members
*/
ResultVM.prototype.init = function(){
    this.score = m.prop(GameModel.score());
    this.highScore = m.prop(GameModel.highScore());
    this.resultMessages = m.prop(GameModel.resultMessages());
    this.assets = m.prop(GameModel.assets());
    
    // Derivative Data
    this.resultImage = m.prop(_getResultImage.call(this));
	this.scoreBoard = m.prop(_calcTopFive(GameModel.previousScores()));
    this.message = m.prop(_calcMessage.call(this));
};

module.exports = ResultVM;
},{"./../models/game-model":9,"lodash":"lodash","mithril":"mithril"}],14:[function(require,module,exports){
/* Global module */
'use strict';

var m = require('mithril'),
    Hammer = require('hammerjs'),
    Velocity = require('velocity-animate');

var View = function(ctrl, answer){

    var animIn = function(el, isInitialized, context) {
        if (answer.toggled()) {
            Velocity(el, 'callout.pulse', { duration : 400 }).then(function(){
                el.classList.toggle('selected');
            });
            answer.toggled(false);
        } 
        else if(answer.toggleRejected()){
            Velocity(el, 'callout.shake', { duration : 400 });
            answer.toggleRejected(false);
        }
        else if(!isInitialized){
            var hammertime = new Hammer(el);
            hammertime.on('tap', ctrl.toggle.bind(ctrl, answer));
        }
    };

    return m("li.answer.opaque", {
        config : animIn,
        style : { backgroundImage : "url(" + answer.image() + ")" }
    }, [
        m("h4.name", answer.name())
    ]);
};

module.exports = View;
},{"hammerjs":"hammerjs","mithril":"mithril","velocity-animate":"velocity-animate"}],15:[function(require,module,exports){
/* Global module */
'use strict';

var m = require('mithril'),
    answerView = require('./answer-view'),
    timerView = require('./timer-view'),
    Velocity = require('velocity-animate');


var renderGamePage = function(ctrl, el){
    document.body.className = 'game';
    Velocity(el.children[0], { translateY : '+=170px' }, { duration : 500, delay : 300, easing : [ 250, 0 ] }).then(function(){
        ctrl.ready();
    });
};

var renderOut = function(ctrl, el){
    Velocity(el.children[0], 'reverse').then(ctrl.endGame.bind(ctrl));
};

var renderQuestionUp = function(ctrl, el){
    var target = document.getElementsByClassName('question-number'),
    limit = document.getElementsByClassName('limit'),
    question = document.getElementsByClassName('current-question');

    var sequence = [
        { e : target, p : { left : '50px', top : '20px', fontSize : '0.9rem' } },
        { e : question,  p : 'transition.slideUpIn' },
        { e : limit, p : 'transition.bounceIn', o : { complete : ctrl.startQuestion.bind(ctrl) } }
    ];

    Velocity.RunSequence(sequence);
};

var renderAnswersOut = function(ctrl, el){
    // Velocity
    var targets = document.getElementsByClassName('answer'),
        limit = document.getElementsByClassName('limit'),
        questionNumber = document.getElementsByClassName('question-number'),
        question = document.getElementsByClassName('current-question');

    var sequence = [
        { e : targets, p : 'transition.bounceOut', o : { duration : 500 } },
        { e : question, p : 'transition.slideUpOut', o : { duration : 500 } },
        { e : limit, p : 'fadeOut', o : { duration : 200 , complete : ctrl.afterEndQuestion.bind(ctrl) } }
    ];

    Velocity.RunSequence(sequence);
};

var renderStartQuestion = function(ctrl, el){
    // Show the questions
    el.children[0].classList.add('begin');

    // get answers and remove weird init style
    var answers = document.getElementsByClassName('answers-area')[0];
    answers.style.opacity = 1;
    answers.style.display = 'block';
    
    // Show the answers
    var ul = answers.children[0],
        questionNumber = document.getElementsByClassName('question-number'),
        sequence = [
            { e : ul.children, p : 'transition.bounceIn', o : { stagger : '200ms', complete : renderQuestionUp.bind(this, ctrl, el) } }
        ];

    if(ctrl.VM.currentQuestion() > 0) sequence.unshift({ e : questionNumber, p : 'reverse' });
    Velocity.RunSequence(sequence);
    ctrl.VM.questionShown(true);
};

var View = function(ctrl){
    var animIn = function(el, isInitialized, context) {
        // Decide what to do 
        if (!isInitialized) {
            renderGamePage(ctrl, el);
        }
        // end of question
        else if(ctrl.VM.endQuestion()){
            renderAnswersOut(ctrl, el);
        }
        // show the question
        else if(!ctrl.VM.gameOver() && !ctrl.VM.questionShown()){
            renderStartQuestion(ctrl, el);
        }
        // End of game 
        else if(ctrl.VM.gameOver()) {
            renderOut(ctrl, el);
        }
    };

    return m('#game-page', [
        m('.game-holder', {
            config : animIn
        },[
            m('header.game-header.out-top-full', [
                timerView(ctrl, ctrl.VM.timer()),
                m('h3.intro', 'Get ready'),
                m('h3.question-number', "question " + (+ctrl.VM.currentQuestion() + 1)),
                m('h3.current-question.opaque', ctrl.VM.question().questionElement()),
                m('h4.limit.opaque', ['Choose ', m('span', ctrl.VM.question().limit())])
            ]),
            m('.answers-area', [
                m("ul", [
                    ctrl.VM.question().answers().map(function(answer, index) {
                        return answerView(ctrl, answer);
                    })
                ])
            ])
        ])
    ]);
};

module.exports = View;
},{"./answer-view":14,"./timer-view":19,"mithril":"mithril","velocity-animate":"velocity-animate"}],16:[function(require,module,exports){
/* Global module */
'use strict';

var m = require('mithril'),
    _ = require('lodash'),
    Hammer = require('hammerjs'),
    Velocity = require('velocity-animate');

var Loading = function(ctrl){

    var animIn = function(el, isInitialized, context) {
        var sequence = [
            { e : el.children[0], p : 'transition.slideUpIn', o : { duration : 300, delay : 300, opacity : 0 } },
            { e : el.children[1], p : 'transition.slideUpIn', o : { duration : 300 } },
            { e : el.children[2], p : 'transition.bounceIn',  o : { duration : 300 } },
            { e : el.children[3], p : { opacity : 1, rotateZ : '-25', right : -50 }, o : { duration : 500, easing : [ 250, 15 ] } }
        ];

        if (!isInitialized) {
            document.body.className = 'intro';
            Velocity.RunSequence(sequence);
        } else {
            Velocity(el.children, 'transition.fadeOut', { stagger : '100ms' }).then(ctrl.startGame);
        }
    };

    var events = function(el, isInitialized){
        if(!isInitialized) {
            var hammertime = new Hammer(el);
            hammertime.on('tap', ctrl.onBegin);
        }
    };

    return m('#intro-page', [
        m('.intro-holder', {
            config : animIn
        },[
            m('h2.opaque', ctrl.VM.title()),
            m('.description.opaque', ctrl.VM.description()),
            m('a.begin.opaque', { config: events }, 'begin'),
            m('.brand.opaque.out-right-far', { style : { backgroundImage : 'url({0})'.replace('{0}', ctrl.VM.brand()) } })
        ])
    ]);
};

module.exports = Loading;
},{"hammerjs":"hammerjs","lodash":"lodash","mithril":"mithril","velocity-animate":"velocity-animate"}],17:[function(require,module,exports){
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
},{"mithril":"mithril","velocity-animate":"velocity-animate"}],18:[function(require,module,exports){
/* Global module */
'use strict';

var m = require('mithril'),
    Velocity = require('velocity-animate');

var View = function(ctrl, timer){


    var renderReplay = function(){
        var a = document.getElementsByClassName('btn');
        Velocity(a, 'fadeIn', { stagger : 200 });
    };

    var animIn = function(el, isInitialized, context) {
        if(!isInitialized) {
            document.body.className = 'result';
            var result = document.getElementsByClassName('results')[0];
            var sequence = [
                { e : result.children[0], p : 'transition.whirlIn' },
                { e : result.children[1], p : 'transition.expandIn' },
                { e : result.children[2], p : 'transition.expandIn', o : { complete : renderReplay.bind(this) } }
            ];
            Velocity.RunSequence(sequence);
        }
    };

    return m('#result-page', [
        m('.result-holder', {
            config : animIn
        },[
            m('.results', [
                m('.result-image.opaque', { style : { backgroundImage : 'url(' + ctrl.VM.resultImage() + ')' } }),
                m('h1.result.opaque', ctrl.VM.score() + '/' + ctrl.VM.highScore()),
                m('p.opaque', ctrl.VM.message())
            ]),
            m('.scores.opaque', [
                m('ol', [
                    ctrl.VM.scoreBoard().map(function(s) {
                        return m('li', s.score + ' points');
                    })
                ])
            ]),
            m('a.btn.replay.opaque[href="#/game"]', 'Try Again'),
            m('a.btn.level2.opaque', 'Level 2')
        ])
    ]);
};

module.exports = View;
},{"mithril":"mithril","velocity-animate":"velocity-animate"}],19:[function(require,module,exports){
/* Global module */
'use strict';

var m = require('mithril'),
    Velocity = require('velocity-animate');

var View = function(ctrl, timer){

    var animIn = function(el, isInitialized, context) {
        if(!timer) return;
        if(!timer.isActive()){
            Velocity(el, { width : '100%' }, { duration : timer.time(), easing : 'linear' }).then(function(){
                ctrl.onTime();
                Velocity(el, { width : 0 },  { duration : 200 });
            });
            timer.isActive(true);
        }
    };

    return m(".timer", {
        config : animIn
    });
};

module.exports = View;
},{"mithril":"mithril","velocity-animate":"velocity-animate"}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9tYWluLmpzIiwibm9kZV9tb2R1bGVzL3ZlbG9jaXR5LWFuaW1hdGUvdmVsb2NpdHkudWkuanMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVycy9nYW1lLWNvbnRyb2xsZXIuanMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVycy9pbnRyby1jb250cm9sbGVyLmpzIiwic3JjL3NjcmlwdHMvY29udHJvbGxlcnMvbG9hZGluZy1jb250cm9sbGVyLmpzIiwic3JjL3NjcmlwdHMvY29udHJvbGxlcnMvcmVzdWx0LWNvbnRyb2xsZXIuanMiLCJzcmMvc2NyaXB0cy9saWJzL2FwcC5qcyIsInNyYy9zY3JpcHRzL2xpYnMvdXRpbHMuanMiLCJzcmMvc2NyaXB0cy9tb2RlbHMvZ2FtZS1tb2RlbC5qcyIsInNyYy9zY3JpcHRzL21vZGVscy9nYW1lLXZtLmpzIiwic3JjL3NjcmlwdHMvbW9kZWxzL2ludHJvLXZtLmpzIiwic3JjL3NjcmlwdHMvbW9kZWxzL2xvYWRpbmctdm0uanMiLCJzcmMvc2NyaXB0cy9tb2RlbHMvcmVzdWx0LXZtLmpzIiwic3JjL3NjcmlwdHMvdmlld3MvYW5zd2VyLXZpZXcuanMiLCJzcmMvc2NyaXB0cy92aWV3cy9nYW1lLXZpZXcuanMiLCJzcmMvc2NyaXB0cy92aWV3cy9pbnRyby12aWV3LmpzIiwic3JjL3NjcmlwdHMvdmlld3MvbG9hZGluZy12aWV3LmpzIiwic3JjL3NjcmlwdHMvdmlld3MvcmVzdWx0LXZpZXcuanMiLCJzcmMvc2NyaXB0cy92aWV3cy90aW1lci12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6dkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIEFwcCA9IHJlcXVpcmUoJy4vbGlicy9hcHAuanMnKTtcblxud2luZG93LndpZGdldFZlcnNpb24gPSBcInYwLjAuMFwiO1xuXG52YXIgaW5pdEFwcCA9IGZ1bmN0aW9uKHBhcmFtcyl7XG5cdHZhciBpbnN0YW5jZSA9IG5ldyBBcHAoKTtcbn07XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZ1bmN0aW9uKGV2ZW50KXtcbiAgIC8vZG8gd29ya1xuICAgaW5pdEFwcCgpO1xufSk7XG4iLCIvKioqKioqKioqKioqKioqKioqKioqKlxuICAgVmVsb2NpdHkgVUkgUGFja1xuKioqKioqKioqKioqKioqKioqKioqKi9cblxuLyogVmVsb2NpdHlKUy5vcmcgVUkgUGFjayAoNS4wLjQpLiAoQykgMjAxNCBKdWxpYW4gU2hhcGlyby4gTUlUIEBsaWNlbnNlOiBlbi53aWtpcGVkaWEub3JnL3dpa2kvTUlUX0xpY2Vuc2UuIFBvcnRpb25zIGNvcHlyaWdodCBEYW5pZWwgRWRlbiwgQ2hyaXN0aWFuIFB1Y2NpLiAqL1xuXG47KGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgLyogQ29tbW9uSlMgbW9kdWxlLiAqL1xuICAgIGlmICh0eXBlb2YgcmVxdWlyZSA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBleHBvcnRzID09PSBcIm9iamVjdFwiICkge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgICAvKiBBTUQgbW9kdWxlLiAqL1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsgXCJ2ZWxvY2l0eVwiIF0sIGZhY3RvcnkpO1xuICAgIC8qIEJyb3dzZXIgZ2xvYmFscy4gKi9cbiAgICB9IGVsc2Uge1xuICAgICAgICBmYWN0b3J5KCk7XG4gICAgfVxufShmdW5jdGlvbigpIHtcbnJldHVybiBmdW5jdGlvbiAoZ2xvYmFsLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcblxuICAgIC8qKioqKioqKioqKioqXG4gICAgICAgIENoZWNrc1xuICAgICoqKioqKioqKioqKiovXG5cbiAgICBpZiAoIWdsb2JhbC5WZWxvY2l0eSB8fCAhZ2xvYmFsLlZlbG9jaXR5LlV0aWxpdGllcykge1xuICAgICAgICB3aW5kb3cuY29uc29sZSAmJiBjb25zb2xlLmxvZyhcIlZlbG9jaXR5IFVJIFBhY2s6IFZlbG9jaXR5IG11c3QgYmUgbG9hZGVkIGZpcnN0LiBBYm9ydGluZy5cIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgVmVsb2NpdHkgPSBnbG9iYWwuVmVsb2NpdHksXG4gICAgICAgICAgICAkID0gVmVsb2NpdHkuVXRpbGl0aWVzO1xuICAgIH1cblxuICAgIHZhciB2ZWxvY2l0eVZlcnNpb24gPSBWZWxvY2l0eS52ZXJzaW9uLFxuICAgICAgICByZXF1aXJlZFZlcnNpb24gPSB7IG1ham9yOiAxLCBtaW5vcjogMSwgcGF0Y2g6IDAgfTtcblxuICAgIGZ1bmN0aW9uIGdyZWF0ZXJTZW12ZXIgKHByaW1hcnksIHNlY29uZGFyeSkge1xuICAgICAgICB2YXIgdmVyc2lvbkludHMgPSBbXTtcblxuICAgICAgICBpZiAoIXByaW1hcnkgfHwgIXNlY29uZGFyeSkgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgICAgICAkLmVhY2goWyBwcmltYXJ5LCBzZWNvbmRhcnkgXSwgZnVuY3Rpb24oaSwgdmVyc2lvbk9iamVjdCkge1xuICAgICAgICAgICAgdmFyIHZlcnNpb25JbnRzQ29tcG9uZW50cyA9IFtdO1xuXG4gICAgICAgICAgICAkLmVhY2godmVyc2lvbk9iamVjdCwgZnVuY3Rpb24oY29tcG9uZW50LCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHdoaWxlICh2YWx1ZS50b1N0cmluZygpLmxlbmd0aCA8IDUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBcIjBcIiArIHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2ZXJzaW9uSW50c0NvbXBvbmVudHMucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmVyc2lvbkludHMucHVzaCh2ZXJzaW9uSW50c0NvbXBvbmVudHMuam9pbihcIlwiKSlcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIChwYXJzZUZsb2F0KHZlcnNpb25JbnRzWzBdKSA+IHBhcnNlRmxvYXQodmVyc2lvbkludHNbMV0pKTtcbiAgICB9XG5cbiAgICBpZiAoZ3JlYXRlclNlbXZlcihyZXF1aXJlZFZlcnNpb24sIHZlbG9jaXR5VmVyc2lvbikpe1xuICAgICAgICB2YXIgYWJvcnRFcnJvciA9IFwiVmVsb2NpdHkgVUkgUGFjazogWW91IG5lZWQgdG8gdXBkYXRlIFZlbG9jaXR5IChqcXVlcnkudmVsb2NpdHkuanMpIHRvIGEgbmV3ZXIgdmVyc2lvbi4gVmlzaXQgaHR0cDovL2dpdGh1Yi5jb20vanVsaWFuc2hhcGlyby92ZWxvY2l0eS5cIjtcbiAgICAgICAgYWxlcnQoYWJvcnRFcnJvcik7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihhYm9ydEVycm9yKTtcbiAgICB9XG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgRWZmZWN0IFJlZ2lzdHJhdGlvblxuICAgICoqKioqKioqKioqKioqKioqKioqKioqKi9cblxuICAgIC8qIE5vdGU6IFJlZ2lzdGVyVUkgaXMgYSBsZWdhY3kgbmFtZS4gKi9cbiAgICBWZWxvY2l0eS5SZWdpc3RlckVmZmVjdCA9IFZlbG9jaXR5LlJlZ2lzdGVyVUkgPSBmdW5jdGlvbiAoZWZmZWN0TmFtZSwgcHJvcGVydGllcykge1xuICAgICAgICAvKiBBbmltYXRlIHRoZSBleHBhbnNpb24vY29udHJhY3Rpb24gb2YgdGhlIGVsZW1lbnRzJyBwYXJlbnQncyBoZWlnaHQgZm9yIEluL091dCBlZmZlY3RzLiAqL1xuICAgICAgICBmdW5jdGlvbiBhbmltYXRlUGFyZW50SGVpZ2h0IChlbGVtZW50cywgZGlyZWN0aW9uLCB0b3RhbER1cmF0aW9uLCBzdGFnZ2VyKSB7XG4gICAgICAgICAgICB2YXIgdG90YWxIZWlnaHREZWx0YSA9IDAsXG4gICAgICAgICAgICAgICAgcGFyZW50Tm9kZTtcblxuICAgICAgICAgICAgLyogU3VtIHRoZSB0b3RhbCBoZWlnaHQgKGluY2x1ZGluZyBwYWRkaW5nIGFuZCBtYXJnaW4pIG9mIGFsbCB0YXJnZXRlZCBlbGVtZW50cy4gKi9cbiAgICAgICAgICAgICQuZWFjaChlbGVtZW50cy5ub2RlVHlwZSA/IFsgZWxlbWVudHMgXSA6IGVsZW1lbnRzLCBmdW5jdGlvbihpLCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKHN0YWdnZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgLyogSW5jcmVhc2UgdGhlIHRvdGFsRHVyYXRpb24gYnkgdGhlIHN1Y2Nlc3NpdmUgZGVsYXkgYW1vdW50cyBwcm9kdWNlZCBieSB0aGUgc3RhZ2dlciBvcHRpb24uICovXG4gICAgICAgICAgICAgICAgICAgIHRvdGFsRHVyYXRpb24gKz0gaSAqIHN0YWdnZXI7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcGFyZW50Tm9kZSA9IGVsZW1lbnQucGFyZW50Tm9kZTtcblxuICAgICAgICAgICAgICAgICQuZWFjaChbIFwiaGVpZ2h0XCIsIFwicGFkZGluZ1RvcFwiLCBcInBhZGRpbmdCb3R0b21cIiwgXCJtYXJnaW5Ub3BcIiwgXCJtYXJnaW5Cb3R0b21cIl0sIGZ1bmN0aW9uKGksIHByb3BlcnR5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsSGVpZ2h0RGVsdGEgKz0gcGFyc2VGbG9hdChWZWxvY2l0eS5DU1MuZ2V0UHJvcGVydHlWYWx1ZShlbGVtZW50LCBwcm9wZXJ0eSkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qIEFuaW1hdGUgdGhlIHBhcmVudCBlbGVtZW50J3MgaGVpZ2h0IGFkanVzdG1lbnQgKHdpdGggYSB2YXJ5aW5nIGR1cmF0aW9uIG11bHRpcGxpZXIgZm9yIGFlc3RoZXRpYyBiZW5lZml0cykuICovXG4gICAgICAgICAgICBWZWxvY2l0eS5hbmltYXRlKFxuICAgICAgICAgICAgICAgIHBhcmVudE5vZGUsXG4gICAgICAgICAgICAgICAgeyBoZWlnaHQ6IChkaXJlY3Rpb24gPT09IFwiSW5cIiA/IFwiK1wiIDogXCItXCIpICsgXCI9XCIgKyB0b3RhbEhlaWdodERlbHRhIH0sXG4gICAgICAgICAgICAgICAgeyBxdWV1ZTogZmFsc2UsIGVhc2luZzogXCJlYXNlLWluLW91dFwiLCBkdXJhdGlvbjogdG90YWxEdXJhdGlvbiAqIChkaXJlY3Rpb24gPT09IFwiSW5cIiA/IDAuNiA6IDEpIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBSZWdpc3RlciBhIGN1c3RvbSByZWRpcmVjdCBmb3IgZWFjaCBlZmZlY3QuICovXG4gICAgICAgIFZlbG9jaXR5LlJlZGlyZWN0c1tlZmZlY3ROYW1lXSA9IGZ1bmN0aW9uIChlbGVtZW50LCByZWRpcmVjdE9wdGlvbnMsIGVsZW1lbnRzSW5kZXgsIGVsZW1lbnRzU2l6ZSwgZWxlbWVudHMsIHByb21pc2VEYXRhKSB7XG4gICAgICAgICAgICB2YXIgZmluYWxFbGVtZW50ID0gKGVsZW1lbnRzSW5kZXggPT09IGVsZW1lbnRzU2l6ZSAtIDEpO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHByb3BlcnRpZXMuZGVmYXVsdER1cmF0aW9uID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLmRlZmF1bHREdXJhdGlvbiA9IHByb3BlcnRpZXMuZGVmYXVsdER1cmF0aW9uLmNhbGwoZWxlbWVudHMsIGVsZW1lbnRzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcHJvcGVydGllcy5kZWZhdWx0RHVyYXRpb24gPSBwYXJzZUZsb2F0KHByb3BlcnRpZXMuZGVmYXVsdER1cmF0aW9uKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogSXRlcmF0ZSB0aHJvdWdoIGVhY2ggZWZmZWN0J3MgY2FsbCBhcnJheS4gKi9cbiAgICAgICAgICAgIGZvciAodmFyIGNhbGxJbmRleCA9IDA7IGNhbGxJbmRleCA8IHByb3BlcnRpZXMuY2FsbHMubGVuZ3RoOyBjYWxsSW5kZXgrKykge1xuICAgICAgICAgICAgICAgIHZhciBjYWxsID0gcHJvcGVydGllcy5jYWxsc1tjYWxsSW5kZXhdLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU1hcCA9IGNhbGxbMF0sXG4gICAgICAgICAgICAgICAgICAgIHJlZGlyZWN0RHVyYXRpb24gPSAocmVkaXJlY3RPcHRpb25zLmR1cmF0aW9uIHx8IHByb3BlcnRpZXMuZGVmYXVsdER1cmF0aW9uIHx8IDEwMDApLFxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvblBlcmNlbnRhZ2UgPSBjYWxsWzFdLFxuICAgICAgICAgICAgICAgICAgICBjYWxsT3B0aW9ucyA9IGNhbGxbMl0gfHwge30sXG4gICAgICAgICAgICAgICAgICAgIG9wdHMgPSB7fTtcblxuICAgICAgICAgICAgICAgIC8qIEFzc2lnbiB0aGUgd2hpdGVsaXN0ZWQgcGVyLWNhbGwgb3B0aW9ucy4gKi9cbiAgICAgICAgICAgICAgICBvcHRzLmR1cmF0aW9uID0gcmVkaXJlY3REdXJhdGlvbiAqIChkdXJhdGlvblBlcmNlbnRhZ2UgfHwgMSk7XG4gICAgICAgICAgICAgICAgb3B0cy5xdWV1ZSA9IHJlZGlyZWN0T3B0aW9ucy5xdWV1ZSB8fCBcIlwiO1xuICAgICAgICAgICAgICAgIG9wdHMuZWFzaW5nID0gY2FsbE9wdGlvbnMuZWFzaW5nIHx8IFwiZWFzZVwiO1xuICAgICAgICAgICAgICAgIG9wdHMuZGVsYXkgPSBwYXJzZUZsb2F0KGNhbGxPcHRpb25zLmRlbGF5KSB8fCAwO1xuICAgICAgICAgICAgICAgIG9wdHMuX2NhY2hlVmFsdWVzID0gY2FsbE9wdGlvbnMuX2NhY2hlVmFsdWVzIHx8IHRydWU7XG5cbiAgICAgICAgICAgICAgICAvKiBTcGVjaWFsIHByb2Nlc3NpbmcgZm9yIHRoZSBmaXJzdCBlZmZlY3QgY2FsbC4gKi9cbiAgICAgICAgICAgICAgICBpZiAoY2FsbEluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qIElmIGEgZGVsYXkgd2FzIHBhc3NlZCBpbnRvIHRoZSByZWRpcmVjdCwgY29tYmluZSBpdCB3aXRoIHRoZSBmaXJzdCBjYWxsJ3MgZGVsYXkuICovXG4gICAgICAgICAgICAgICAgICAgIG9wdHMuZGVsYXkgKz0gKHBhcnNlRmxvYXQocmVkaXJlY3RPcHRpb25zLmRlbGF5KSB8fCAwKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudHNJbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0cy5iZWdpbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIE9ubHkgdHJpZ2dlciBhIGJlZ2luIGNhbGxiYWNrIG9uIHRoZSBmaXJzdCBlZmZlY3QgY2FsbCB3aXRoIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZSBzZXQuICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVkaXJlY3RPcHRpb25zLmJlZ2luICYmIHJlZGlyZWN0T3B0aW9ucy5iZWdpbi5jYWxsKGVsZW1lbnRzLCBlbGVtZW50cyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGlyZWN0aW9uID0gZWZmZWN0TmFtZS5tYXRjaCgvKElufE91dCkkLyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBNYWtlIFwiaW5cIiB0cmFuc2l0aW9uaW5nIGVsZW1lbnRzIGludmlzaWJsZSBpbW1lZGlhdGVseSBzbyB0aGF0IHRoZXJlJ3Mgbm8gRk9VQyBiZXR3ZWVuIG5vd1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZCB0aGUgZmlyc3QgUkFGIHRpY2suICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKChkaXJlY3Rpb24gJiYgZGlyZWN0aW9uWzBdID09PSBcIkluXCIpICYmIHByb3BlcnR5TWFwLm9wYWNpdHkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkLmVhY2goZWxlbWVudHMubm9kZVR5cGUgPyBbIGVsZW1lbnRzIF0gOiBlbGVtZW50cywgZnVuY3Rpb24oaSwgZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVmVsb2NpdHkuQ1NTLnNldFByb3BlcnR5VmFsdWUoZWxlbWVudCwgXCJvcGFjaXR5XCIsIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBPbmx5IHRyaWdnZXIgYW5pbWF0ZVBhcmVudEhlaWdodCgpIGlmIHdlJ3JlIHVzaW5nIGFuIEluL091dCB0cmFuc2l0aW9uLiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZWRpcmVjdE9wdGlvbnMuYW5pbWF0ZVBhcmVudEhlaWdodCAmJiBkaXJlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZVBhcmVudEhlaWdodChlbGVtZW50cywgZGlyZWN0aW9uWzBdLCByZWRpcmVjdER1cmF0aW9uICsgb3B0cy5kZWxheSwgcmVkaXJlY3RPcHRpb25zLnN0YWdnZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8qIElmIHRoZSB1c2VyIGlzbid0IG92ZXJyaWRpbmcgdGhlIGRpc3BsYXkgb3B0aW9uLCBkZWZhdWx0IHRvIFwiYXV0b1wiIGZvciBcIkluXCItc3VmZml4ZWQgdHJhbnNpdGlvbnMuICovXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWRpcmVjdE9wdGlvbnMuZGlzcGxheSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlZGlyZWN0T3B0aW9ucy5kaXNwbGF5ICE9PSB1bmRlZmluZWQgJiYgcmVkaXJlY3RPcHRpb25zLmRpc3BsYXkgIT09IFwibm9uZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0cy5kaXNwbGF5ID0gcmVkaXJlY3RPcHRpb25zLmRpc3BsYXk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKC9JbiQvLnRlc3QoZWZmZWN0TmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBJbmxpbmUgZWxlbWVudHMgY2Fubm90IGJlIHN1YmplY3RlZCB0byB0cmFuc2Zvcm1zLCBzbyB3ZSBzd2l0Y2ggdGhlbSB0byBpbmxpbmUtYmxvY2suICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRlZmF1bHREaXNwbGF5ID0gVmVsb2NpdHkuQ1NTLlZhbHVlcy5nZXREaXNwbGF5VHlwZShlbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRzLmRpc3BsYXkgPSAoZGVmYXVsdERpc3BsYXkgPT09IFwiaW5saW5lXCIpID8gXCJpbmxpbmUtYmxvY2tcIiA6IGRlZmF1bHREaXNwbGF5O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlZGlyZWN0T3B0aW9ucy52aXNpYmlsaXR5ICYmIHJlZGlyZWN0T3B0aW9ucy52aXNpYmlsaXR5ICE9PSBcImhpZGRlblwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRzLnZpc2liaWxpdHkgPSByZWRpcmVjdE9wdGlvbnMudmlzaWJpbGl0eTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8qIFNwZWNpYWwgcHJvY2Vzc2luZyBmb3IgdGhlIGxhc3QgZWZmZWN0IGNhbGwuICovXG4gICAgICAgICAgICAgICAgaWYgKGNhbGxJbmRleCA9PT0gcHJvcGVydGllcy5jYWxscy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qIEFwcGVuZCBwcm9taXNlIHJlc29sdmluZyBvbnRvIHRoZSB1c2VyJ3MgcmVkaXJlY3QgY2FsbGJhY2suICovXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGluamVjdEZpbmFsQ2FsbGJhY2tzICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgocmVkaXJlY3RPcHRpb25zLmRpc3BsYXkgPT09IHVuZGVmaW5lZCB8fCByZWRpcmVjdE9wdGlvbnMuZGlzcGxheSA9PT0gXCJub25lXCIpICYmIC9PdXQkLy50ZXN0KGVmZmVjdE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJC5lYWNoKGVsZW1lbnRzLm5vZGVUeXBlID8gWyBlbGVtZW50cyBdIDogZWxlbWVudHMsIGZ1bmN0aW9uKGksIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVmVsb2NpdHkuQ1NTLnNldFByb3BlcnR5VmFsdWUoZWxlbWVudCwgXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcmVkaXJlY3RPcHRpb25zLmNvbXBsZXRlICYmIHJlZGlyZWN0T3B0aW9ucy5jb21wbGV0ZS5jYWxsKGVsZW1lbnRzLCBlbGVtZW50cyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9taXNlRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2VEYXRhLnJlc29sdmVyKGVsZW1lbnRzIHx8IGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgb3B0cy5jb21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BlcnRpZXMucmVzZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciByZXNldFByb3BlcnR5IGluIHByb3BlcnRpZXMucmVzZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc2V0VmFsdWUgPSBwcm9wZXJ0aWVzLnJlc2V0W3Jlc2V0UHJvcGVydHldO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIEZvcm1hdCBlYWNoIG5vbi1hcnJheSB2YWx1ZSBpbiB0aGUgcmVzZXQgcHJvcGVydHkgbWFwIHRvIFsgdmFsdWUsIHZhbHVlIF0gc28gdGhhdCBjaGFuZ2VzIGFwcGx5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltbWVkaWF0ZWx5IGFuZCBET00gcXVlcnlpbmcgaXMgYXZvaWRlZCAodmlhIGZvcmNlZmVlZGluZykuICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIE5vdGU6IERvbid0IGZvcmNlZmVlZCBob29rcywgb3RoZXJ3aXNlIHRoZWlyIGhvb2sgcm9vdHMgd2lsbCBiZSBkZWZhdWx0ZWQgdG8gdGhlaXIgbnVsbCB2YWx1ZXMuICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChWZWxvY2l0eS5DU1MuSG9va3MucmVnaXN0ZXJlZFtyZXNldFByb3BlcnR5XSA9PT0gdW5kZWZpbmVkICYmICh0eXBlb2YgcmVzZXRWYWx1ZSA9PT0gXCJzdHJpbmdcIiB8fCB0eXBlb2YgcmVzZXRWYWx1ZSA9PT0gXCJudW1iZXJcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXMucmVzZXRbcmVzZXRQcm9wZXJ0eV0gPSBbIHByb3BlcnRpZXMucmVzZXRbcmVzZXRQcm9wZXJ0eV0sIHByb3BlcnRpZXMucmVzZXRbcmVzZXRQcm9wZXJ0eV0gXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIFNvIHRoYXQgdGhlIHJlc2V0IHZhbHVlcyBhcmUgYXBwbGllZCBpbnN0YW50bHkgdXBvbiB0aGUgbmV4dCByQUYgdGljaywgdXNlIGEgemVybyBkdXJhdGlvbiBhbmQgcGFyYWxsZWwgcXVldWVpbmcuICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc2V0T3B0aW9ucyA9IHsgZHVyYXRpb246IDAsIHF1ZXVlOiBmYWxzZSB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogU2luY2UgdGhlIHJlc2V0IG9wdGlvbiB1c2VzIHVwIHRoZSBjb21wbGV0ZSBjYWxsYmFjaywgd2UgdHJpZ2dlciB0aGUgdXNlcidzIGNvbXBsZXRlIGNhbGxiYWNrIGF0IHRoZSBlbmQgb2Ygb3Vycy4gKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmluYWxFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0T3B0aW9ucy5jb21wbGV0ZSA9IGluamVjdEZpbmFsQ2FsbGJhY2tzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFZlbG9jaXR5LmFuaW1hdGUoZWxlbWVudCwgcHJvcGVydGllcy5yZXNldCwgcmVzZXRPcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIE9ubHkgdHJpZ2dlciB0aGUgdXNlcidzIGNvbXBsZXRlIGNhbGxiYWNrIG9uIHRoZSBsYXN0IGVmZmVjdCBjYWxsIHdpdGggdGhlIGxhc3QgZWxlbWVudCBpbiB0aGUgc2V0LiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChmaW5hbEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmplY3RGaW5hbENhbGxiYWNrcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWRpcmVjdE9wdGlvbnMudmlzaWJpbGl0eSA9PT0gXCJoaWRkZW5cIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0cy52aXNpYmlsaXR5ID0gcmVkaXJlY3RPcHRpb25zLnZpc2liaWxpdHk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBWZWxvY2l0eS5hbmltYXRlKGVsZW1lbnQsIHByb3BlcnR5TWFwLCBvcHRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvKiBSZXR1cm4gdGhlIFZlbG9jaXR5IG9iamVjdCBzbyB0aGF0IFJlZ2lzdGVyVUkgY2FsbHMgY2FuIGJlIGNoYWluZWQuICovXG4gICAgICAgIHJldHVybiBWZWxvY2l0eTtcbiAgICB9O1xuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKlxuICAgICAgIFBhY2thZ2VkIEVmZmVjdHNcbiAgICAqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgICAvKiBFeHRlcm5hbGl6ZSB0aGUgcGFja2FnZWRFZmZlY3RzIGRhdGEgc28gdGhhdCB0aGV5IGNhbiBvcHRpb25hbGx5IGJlIG1vZGlmaWVkIGFuZCByZS1yZWdpc3RlcmVkLiAqL1xuICAgIC8qIFN1cHBvcnQ6IDw9SUU4OiBDYWxsb3V0cyB3aWxsIGhhdmUgbm8gZWZmZWN0LCBhbmQgdHJhbnNpdGlvbnMgd2lsbCBzaW1wbHkgZmFkZSBpbi9vdXQuIElFOS9BbmRyb2lkIDIuMzogTW9zdCBlZmZlY3RzIGFyZSBmdWxseSBzdXBwb3J0ZWQsIHRoZSByZXN0IGZhZGUgaW4vb3V0LiBBbGwgb3RoZXIgYnJvd3NlcnM6IGZ1bGwgc3VwcG9ydC4gKi9cbiAgICBWZWxvY2l0eS5SZWdpc3RlckVmZmVjdC5wYWNrYWdlZEVmZmVjdHMgPVxuICAgICAgICB7XG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJjYWxsb3V0LmJvdW5jZVwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA1NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVk6IC0zMCB9LCAwLjI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVZOiAwIH0sIDAuMTI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVZOiAtMTUgfSwgMC4xMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVk6IDAgfSwgMC4yNSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcImNhbGxvdXQuc2hha2VcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVYOiAtMTEgfSwgMC4xMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVg6IDExIH0sIDAuMTI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVYOiAtMTEgfSwgMC4xMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVg6IDExIH0sIDAuMTI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVYOiAtMTEgfSwgMC4xMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVg6IDExIH0sIDAuMTI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVYOiAtMTEgfSwgMC4xMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVg6IDAgfSwgMC4xMjUgXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJjYWxsb3V0LmZsYXNoXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDExMDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgXCJlYXNlSW5PdXRRdWFkXCIsIDEgXSB9LCAwLjI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIFwiZWFzZUluT3V0UXVhZFwiIF0gfSwgMC4yNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCBcImVhc2VJbk91dFF1YWRcIiBdIH0sIDAuMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgXCJlYXNlSW5PdXRRdWFkXCIgXSB9LCAwLjI1IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwiY2FsbG91dC5wdWxzZVwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MjUsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IHNjYWxlWDogMS4xLCBzY2FsZVk6IDEuMSB9LCAwLjUwLCB7IGVhc2luZzogXCJlYXNlSW5FeHBvXCIgfSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgc2NhbGVYOiAxLCBzY2FsZVk6IDEgfSwgMC41MCBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcImNhbGxvdXQuc3dpbmdcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogOTUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyByb3RhdGVaOiAxNSB9LCAwLjIwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyByb3RhdGVaOiAtMTAgfSwgMC4yMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgcm90YXRlWjogNSB9LCAwLjIwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyByb3RhdGVaOiAtNSB9LCAwLjIwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyByb3RhdGVaOiAwIH0sIDAuMjAgXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJjYWxsb3V0LnRhZGFcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogMTAwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgc2NhbGVYOiAwLjksIHNjYWxlWTogMC45LCByb3RhdGVaOiAtMyB9LCAwLjEwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBzY2FsZVg6IDEuMSwgc2NhbGVZOiAxLjEsIHJvdGF0ZVo6IDMgfSwgMC4xMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgc2NhbGVYOiAxLjEsIHNjYWxlWTogMS4xLCByb3RhdGVaOiAtMyB9LCAwLjEwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgXCJyZXZlcnNlXCIsIDAuMTI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgXCJyZXZlcnNlXCIsIDAuMTI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgXCJyZXZlcnNlXCIsIDAuMTI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgXCJyZXZlcnNlXCIsIDAuMTI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgXCJyZXZlcnNlXCIsIDAuMTI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBzY2FsZVg6IDEsIHNjYWxlWTogMSwgcm90YXRlWjogMCB9LCAwLjIwIF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmZhZGVJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA1MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdIH0gXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uZmFkZU91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA1MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdIH0gXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmZsaXBYSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNzAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgODAwLCA4MDAgXSwgcm90YXRlWTogWyAwLCAtNTUgXSB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmZsaXBYT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDcwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDgwMCwgODAwIF0sIHJvdGF0ZVk6IDU1IH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAsIHJvdGF0ZVk6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uZmxpcFlJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyA4MDAsIDgwMCBdLCByb3RhdGVYOiBbIDAsIC00NSBdIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uZmxpcFlPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgODAwLCA4MDAgXSwgcm90YXRlWDogMjUgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCwgcm90YXRlWDogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uZmxpcEJvdW5jZVhJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA5MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMC43MjUsIDAgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgNDAwLCA0MDAgXSwgcm90YXRlWTogWyAtMTAsIDkwIF0gfSwgMC41MCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogMC44MCwgcm90YXRlWTogMTAgfSwgMC4yNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogMSwgcm90YXRlWTogMCB9LCAwLjI1IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5mbGlwQm91bmNlWE91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMC45LCAxIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDQwMCwgNDAwIF0sIHJvdGF0ZVk6IC0xMCB9LCAwLjUwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiAwLCByb3RhdGVZOiA5MCB9LCAwLjUwIF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwLCByb3RhdGVZOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5mbGlwQm91bmNlWUluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDg1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLjcyNSwgMCBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyA0MDAsIDQwMCBdLCByb3RhdGVYOiBbIC0xMCwgOTAgXSB9LCAwLjUwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiAwLjgwLCByb3RhdGVYOiAxMCB9LCAwLjI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiAxLCByb3RhdGVYOiAwIH0sIDAuMjUgXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmZsaXBCb3VuY2VZT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLjksIDEgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgNDAwLCA0MDAgXSwgcm90YXRlWDogLTE1IH0sIDAuNTAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IDAsIHJvdGF0ZVg6IDkwIH0sIDAuNTAgXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAsIHJvdGF0ZVg6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIE1hZ2ljLmNzcyAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnN3b29wSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyBcIjEwMCVcIiwgXCI1MCVcIiBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIFwiMTAwJVwiLCBcIjEwMCVcIiBdLCBzY2FsZVg6IFsgMSwgMCBdLCBzY2FsZVk6IFsgMSwgMCBdLCB0cmFuc2xhdGVYOiBbIDAsIC03MDAgXSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybU9yaWdpblg6IFwiNTAlXCIsIHRyYW5zZm9ybU9yaWdpblk6IFwiNTAlXCIgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIE1hZ2ljLmNzcyAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnN3b29wT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDg1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgXCI1MCVcIiwgXCIxMDAlXCIgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyBcIjEwMCVcIiwgXCIxMDAlXCIgXSwgc2NhbGVYOiAwLCBzY2FsZVk6IDAsIHRyYW5zbGF0ZVg6IC03MDAsIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1PcmlnaW5YOiBcIjUwJVwiLCB0cmFuc2Zvcm1PcmlnaW5ZOiBcIjUwJVwiLCBzY2FsZVg6IDEsIHNjYWxlWTogMSwgdHJhbnNsYXRlWDogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogTWFnaWMuY3NzICovXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMuIChGYWRlcyBhbmQgc2NhbGVzIG9ubHkuKSAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLndoaXJsSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyBcIjUwJVwiLCBcIjUwJVwiIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgXCI1MCVcIiwgXCI1MCVcIiBdLCBzY2FsZVg6IFsgMSwgMCBdLCBzY2FsZVk6IFsgMSwgMCBdLCByb3RhdGVZOiBbIDAsIDE2MCBdIH0sIDEsIHsgZWFzaW5nOiBcImVhc2VJbk91dFNpbmVcIiB9IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogTWFnaWMuY3NzICovXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMuIChGYWRlcyBhbmQgc2NhbGVzIG9ubHkuKSAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLndoaXJsT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDc1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCBcImVhc2VJbk91dFF1aW50XCIsIDEgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyBcIjUwJVwiLCBcIjUwJVwiIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgXCI1MCVcIiwgXCI1MCVcIiBdLCBzY2FsZVg6IDAsIHNjYWxlWTogMCwgcm90YXRlWTogMTYwIH0sIDEsIHsgZWFzaW5nOiBcInN3aW5nXCIgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyBzY2FsZVg6IDEsIHNjYWxlWTogMSwgcm90YXRlWTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNocmlua0luXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDc1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgXCI1MCVcIiwgXCI1MCVcIiBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIFwiNTAlXCIsIFwiNTAlXCIgXSwgc2NhbGVYOiBbIDEsIDEuNSBdLCBzY2FsZVk6IFsgMSwgMS41IF0sIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zaHJpbmtPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNjAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyBcIjUwJVwiLCBcIjUwJVwiIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgXCI1MCVcIiwgXCI1MCVcIiBdLCBzY2FsZVg6IDEuMywgc2NhbGVZOiAxLjMsIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyBzY2FsZVg6IDEsIHNjYWxlWTogMSB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmV4cGFuZEluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDcwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgXCI1MCVcIiwgXCI1MCVcIiBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIFwiNTAlXCIsIFwiNTAlXCIgXSwgc2NhbGVYOiBbIDEsIDAuNjI1IF0sIHNjYWxlWTogWyAxLCAwLjYyNSBdLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uZXhwYW5kT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDcwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgXCI1MCVcIiwgXCI1MCVcIiBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIFwiNTAlXCIsIFwiNTAlXCIgXSwgc2NhbGVYOiAwLjUsIHNjYWxlWTogMC41LCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgc2NhbGVYOiAxLCBzY2FsZVk6IDEgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uYm91bmNlSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgc2NhbGVYOiBbIDEuMDUsIDAuMyBdLCBzY2FsZVk6IFsgMS4wNSwgMC4zIF0gfSwgMC40MCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgc2NhbGVYOiAwLjksIHNjYWxlWTogMC45LCB0cmFuc2xhdGVaOiAwIH0sIDAuMjAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHNjYWxlWDogMSwgc2NhbGVZOiAxIH0sIDAuNTAgXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmJvdW5jZU91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IHNjYWxlWDogMC45NSwgc2NhbGVZOiAwLjk1IH0sIDAuMzUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHNjYWxlWDogMS4xLCBzY2FsZVk6IDEuMSwgdHJhbnNsYXRlWjogMCB9LCAwLjM1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgc2NhbGVYOiAwLjMsIHNjYWxlWTogMC4zIH0sIDAuMzAgXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgc2NhbGVYOiAxLCBzY2FsZVk6IDEgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uYm91bmNlVXBJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2xhdGVZOiBbIC0zMCwgMTAwMCBdIH0sIDAuNjAsIHsgZWFzaW5nOiBcImVhc2VPdXRDaXJjXCIgfSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWTogMTAgfSwgMC4yMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWTogMCB9LCAwLjIwIF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5ib3VuY2VVcE91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiAxMDAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVZOiAyMCB9LCAwLjIwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIFwiZWFzZUluQ2lyY1wiLCAxIF0sIHRyYW5zbGF0ZVk6IC0xMDAwIH0sIDAuODAgXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNsYXRlWTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5ib3VuY2VEb3duSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNsYXRlWTogWyAzMCwgLTEwMDAgXSB9LCAwLjYwLCB7IGVhc2luZzogXCJlYXNlT3V0Q2lyY1wiIH0gXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVk6IC0xMCB9LCAwLjIwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVZOiAwIH0sIDAuMjAgXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmJvdW5jZURvd25PdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogMTAwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWTogLTIwIH0sIDAuMjAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgXCJlYXNlSW5DaXJjXCIsIDEgXSwgdHJhbnNsYXRlWTogMTAwMCB9LCAwLjgwIF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zbGF0ZVk6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uYm91bmNlTGVmdEluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDc1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zbGF0ZVg6IFsgMzAsIC0xMjUwIF0gfSwgMC42MCwgeyBlYXNpbmc6IFwiZWFzZU91dENpcmNcIiB9IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVYOiAtMTAgfSwgMC4yMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWDogMCB9LCAwLjIwIF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5ib3VuY2VMZWZ0T3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDc1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWDogMzAgfSwgMC4yMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCBcImVhc2VJbkNpcmNcIiwgMSBdLCB0cmFuc2xhdGVYOiAtMTI1MCB9LCAwLjgwIF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zbGF0ZVg6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uYm91bmNlUmlnaHRJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA3NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2xhdGVYOiBbIC0zMCwgMTI1MCBdIH0sIDAuNjAsIHsgZWFzaW5nOiBcImVhc2VPdXRDaXJjXCIgfSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWDogMTAgfSwgMC4yMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWDogMCB9LCAwLjIwIF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5ib3VuY2VSaWdodE91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA3NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVg6IC0zMCB9LCAwLjIwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIFwiZWFzZUluQ2lyY1wiLCAxIF0sIHRyYW5zbGF0ZVg6IDEyNTAgfSwgMC44MCBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2xhdGVYOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVVcEluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDkwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zbGF0ZVk6IFsgMCwgMjAgXSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlVXBPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogOTAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNsYXRlWTogLTIwLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNsYXRlWTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlRG93bkluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDkwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zbGF0ZVk6IFsgMCwgLTIwIF0sIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZURvd25PdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogOTAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNsYXRlWTogMjAsIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2xhdGVZOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVMZWZ0SW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogMTAwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zbGF0ZVg6IFsgMCwgLTIwIF0sIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZUxlZnRPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogMTA1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zbGF0ZVg6IC0yMCwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zbGF0ZVg6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZVJpZ2h0SW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogMTAwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zbGF0ZVg6IFsgMCwgMjAgXSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlUmlnaHRPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogMTA1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zbGF0ZVg6IDIwLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNsYXRlWDogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlVXBCaWdJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2xhdGVZOiBbIDAsIDc1IF0sIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZVVwQmlnT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zbGF0ZVk6IC03NSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zbGF0ZVk6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZURvd25CaWdJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2xhdGVZOiBbIDAsIC03NSBdLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVEb3duQmlnT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zbGF0ZVk6IDc1LCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNsYXRlWTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlTGVmdEJpZ0luXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zbGF0ZVg6IFsgMCwgLTc1IF0sIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZUxlZnRCaWdPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNzUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNsYXRlWDogLTc1LCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNsYXRlWDogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlUmlnaHRCaWdJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2xhdGVYOiBbIDAsIDc1IF0sIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZVJpZ2h0QmlnT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDc1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zbGF0ZVg6IDc1LCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNsYXRlWDogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogTWFnaWMuY3NzICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24ucGVyc3BlY3RpdmVVcEluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDgwMCwgODAwIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgMCwgMCBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIFwiMTAwJVwiLCBcIjEwMCVcIiBdLCByb3RhdGVYOiBbIDAsIC0xODAgXSB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwLCB0cmFuc2Zvcm1PcmlnaW5YOiBcIjUwJVwiLCB0cmFuc2Zvcm1PcmlnaW5ZOiBcIjUwJVwiIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBNYWdpYy5jc3MgKi9cbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24ucGVyc3BlY3RpdmVVcE91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyA4MDAsIDgwMCBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIDAsIDAgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyBcIjEwMCVcIiwgXCIxMDAlXCIgXSwgcm90YXRlWDogLTE4MCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwLCB0cmFuc2Zvcm1PcmlnaW5YOiBcIjUwJVwiLCB0cmFuc2Zvcm1PcmlnaW5ZOiBcIjUwJVwiLCByb3RhdGVYOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBNYWdpYy5jc3MgKi9cbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24ucGVyc3BlY3RpdmVEb3duSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgODAwLCA4MDAgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyAwLCAwIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgMCwgMCBdLCByb3RhdGVYOiBbIDAsIDE4MCBdIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAsIHRyYW5zZm9ybU9yaWdpblg6IFwiNTAlXCIsIHRyYW5zZm9ybU9yaWdpblk6IFwiNTAlXCIgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIE1hZ2ljLmNzcyAqL1xuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5wZXJzcGVjdGl2ZURvd25PdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgODAwLCA4MDAgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyAwLCAwIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgMCwgMCBdLCByb3RhdGVYOiAxODAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCwgdHJhbnNmb3JtT3JpZ2luWDogXCI1MCVcIiwgdHJhbnNmb3JtT3JpZ2luWTogXCI1MCVcIiwgcm90YXRlWDogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogTWFnaWMuY3NzICovXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnBlcnNwZWN0aXZlTGVmdEluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDk1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDIwMDAsIDIwMDAgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyAwLCAwIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgMCwgMCBdLCByb3RhdGVZOiBbIDAsIC0xODAgXSB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwLCB0cmFuc2Zvcm1PcmlnaW5YOiBcIjUwJVwiLCB0cmFuc2Zvcm1PcmlnaW5ZOiBcIjUwJVwiIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBNYWdpYy5jc3MgKi9cbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24ucGVyc3BlY3RpdmVMZWZ0T3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDk1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDIwMDAsIDIwMDAgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyAwLCAwIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgMCwgMCBdLCByb3RhdGVZOiAtMTgwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAsIHRyYW5zZm9ybU9yaWdpblg6IFwiNTAlXCIsIHRyYW5zZm9ybU9yaWdpblk6IFwiNTAlXCIsIHJvdGF0ZVk6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIE1hZ2ljLmNzcyAqL1xuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5wZXJzcGVjdGl2ZVJpZ2h0SW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogOTUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgMjAwMCwgMjAwMCBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIFwiMTAwJVwiLCBcIjEwMCVcIiBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIDAsIDAgXSwgcm90YXRlWTogWyAwLCAxODAgXSB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwLCB0cmFuc2Zvcm1PcmlnaW5YOiBcIjUwJVwiLCB0cmFuc2Zvcm1PcmlnaW5ZOiBcIjUwJVwiIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBNYWdpYy5jc3MgKi9cbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24ucGVyc3BlY3RpdmVSaWdodE91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA5NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyAyMDAwLCAyMDAwIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgXCIxMDAlXCIsIFwiMTAwJVwiIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgMCwgMCBdLCByb3RhdGVZOiAxODAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCwgdHJhbnNmb3JtT3JpZ2luWDogXCI1MCVcIiwgdHJhbnNmb3JtT3JpZ2luWTogXCI1MCVcIiwgcm90YXRlWTogMCB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAvKiBSZWdpc3RlciB0aGUgcGFja2FnZWQgZWZmZWN0cy4gKi9cbiAgICBmb3IgKHZhciBlZmZlY3ROYW1lIGluIFZlbG9jaXR5LlJlZ2lzdGVyRWZmZWN0LnBhY2thZ2VkRWZmZWN0cykge1xuICAgICAgICBWZWxvY2l0eS5SZWdpc3RlckVmZmVjdChlZmZlY3ROYW1lLCBWZWxvY2l0eS5SZWdpc3RlckVmZmVjdC5wYWNrYWdlZEVmZmVjdHNbZWZmZWN0TmFtZV0pO1xuICAgIH1cblxuICAgIC8qKioqKioqKioqKioqKioqKioqKipcbiAgICAgICBTZXF1ZW5jZSBSdW5uaW5nXG4gICAgKioqKioqKioqKioqKioqKioqKioqKi9cblxuICAgIC8qIE5vdGU6IFNlcXVlbmNlIGNhbGxzIG11c3QgdXNlIFZlbG9jaXR5J3Mgc2luZ2xlLW9iamVjdCBhcmd1bWVudHMgc3ludGF4LiAqL1xuICAgIFZlbG9jaXR5LlJ1blNlcXVlbmNlID0gZnVuY3Rpb24gKG9yaWdpbmFsU2VxdWVuY2UpIHtcbiAgICAgICAgdmFyIHNlcXVlbmNlID0gJC5leHRlbmQodHJ1ZSwgW10sIG9yaWdpbmFsU2VxdWVuY2UpO1xuXG4gICAgICAgIGlmIChzZXF1ZW5jZS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAkLmVhY2goc2VxdWVuY2UucmV2ZXJzZSgpLCBmdW5jdGlvbihpLCBjdXJyZW50Q2FsbCkge1xuICAgICAgICAgICAgICAgIHZhciBuZXh0Q2FsbCA9IHNlcXVlbmNlW2kgKyAxXTtcblxuICAgICAgICAgICAgICAgIGlmIChuZXh0Q2FsbCkge1xuICAgICAgICAgICAgICAgICAgICAvKiBQYXJhbGxlbCBzZXF1ZW5jZSBjYWxscyAoaW5kaWNhdGVkIHZpYSBzZXF1ZW5jZVF1ZXVlOmZhbHNlKSBhcmUgdHJpZ2dlcmVkXG4gICAgICAgICAgICAgICAgICAgICAgIGluIHRoZSBwcmV2aW91cyBjYWxsJ3MgYmVnaW4gY2FsbGJhY2suIE90aGVyd2lzZSwgY2hhaW5lZCBjYWxscyBhcmUgbm9ybWFsbHkgdHJpZ2dlcmVkXG4gICAgICAgICAgICAgICAgICAgICAgIGluIHRoZSBwcmV2aW91cyBjYWxsJ3MgY29tcGxldGUgY2FsbGJhY2suICovXG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50Q2FsbE9wdGlvbnMgPSBjdXJyZW50Q2FsbC5vIHx8IGN1cnJlbnRDYWxsLm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0Q2FsbE9wdGlvbnMgPSBuZXh0Q2FsbC5vIHx8IG5leHRDYWxsLm9wdGlvbnM7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWluZyA9IChjdXJyZW50Q2FsbE9wdGlvbnMgJiYgY3VycmVudENhbGxPcHRpb25zLnNlcXVlbmNlUXVldWUgPT09IGZhbHNlKSA/IFwiYmVnaW5cIiA6IFwiY29tcGxldGVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrT3JpZ2luYWwgPSBuZXh0Q2FsbE9wdGlvbnMgJiYgbmV4dENhbGxPcHRpb25zW3RpbWluZ10sXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zID0ge307XG5cbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uc1t0aW1pbmddID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV4dENhbGxFbGVtZW50cyA9IG5leHRDYWxsLmUgfHwgbmV4dENhbGwuZWxlbWVudHM7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBuZXh0Q2FsbEVsZW1lbnRzLm5vZGVUeXBlID8gWyBuZXh0Q2FsbEVsZW1lbnRzIF0gOiBuZXh0Q2FsbEVsZW1lbnRzO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja09yaWdpbmFsICYmIGNhbGxiYWNrT3JpZ2luYWwuY2FsbChlbGVtZW50cywgZWxlbWVudHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgVmVsb2NpdHkoY3VycmVudENhbGwpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRDYWxsLm8pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRDYWxsLm8gPSAkLmV4dGVuZCh7fSwgbmV4dENhbGxPcHRpb25zLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRDYWxsLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgbmV4dENhbGxPcHRpb25zLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzZXF1ZW5jZS5yZXZlcnNlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBWZWxvY2l0eShzZXF1ZW5jZVswXSk7XG4gICAgfTtcbn0oKHdpbmRvdy5qUXVlcnkgfHwgd2luZG93LlplcHRvIHx8IHdpbmRvdyksIHdpbmRvdywgZG9jdW1lbnQpO1xufSkpOyIsIi8qIGdsb2JhbCBtICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRnYW1lVmlld01vZGVsID0gcmVxdWlyZSgnLi8uLi9tb2RlbHMvZ2FtZS12bScpO1xuXG52YXIgR2FtZUNvbnRyb2xsZXIgPSBmdW5jdGlvbigpe1xuXHR0aGlzLlZNID0gbmV3IGdhbWVWaWV3TW9kZWwoKTtcblx0dGhpcy5WTS5pbml0KCk7XG59O1xuXG4vKlxuXHRQdWJsaWMgTWVtYmVyc1xuKi9cblxuR2FtZUNvbnRyb2xsZXIucHJvdG90eXBlLnJlYWR5ID0gZnVuY3Rpb24oKXtcblx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdHRoaXMuVk0uc3RhcnRHYW1lKCk7XG5cdFx0bS5yZWRyYXcoKTtcblx0fS5iaW5kKHRoaXMpLCAxMDAwKTtcbn07XG5cbkdhbWVDb250cm9sbGVyLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbihhbnMpe1xuXHRpZih0aGlzLlZNLmxvY2tlZCgpKSByZXR1cm47XG5cblx0dmFyIGFuc3dlcklzU2VsZWN0ZWQgPSBhbnMuc2VsZWN0ZWQoKTtcblx0aWYodGhpcy5WTS5xdWVzdGlvbigpLmd1ZXNzTGltaXRSZWFjaGVkKCkgJiYgIWFuc3dlcklzU2VsZWN0ZWQpe1xuXHRcdGFucy50b2dnbGVSZWplY3RlZCh0cnVlKTtcblx0fSBlbHNlIHtcblx0XHRhbnMuc2VsZWN0ZWQoIWFucy5zZWxlY3RlZCgpKTtcblx0XHRhbnMudG9nZ2xlZCh0cnVlKTtcblx0XHQvLyBjb3VudCB0aGUgZ3Vlc3NlcyBhZ2FpblxuXHRcdHRoaXMuVk0ucXVlc3Rpb24oKS5jb3VudEd1ZXNzKCk7XG5cdH1cblx0bS5yZWRyYXcoKTtcbn07XG5cbkdhbWVDb250cm9sbGVyLnByb3RvdHlwZS5vblRpbWUgPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuVk0ubG9ja2VkKHRydWUpO1xuICAgIHRoaXMuVk0uZW5kUXVlc3Rpb24odHJ1ZSk7XG4gICAgbS5yZWRyYXcoKTtcbn07XG5cbkdhbWVDb250cm9sbGVyLnByb3RvdHlwZS5hZnRlckVuZFF1ZXN0aW9uID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLlZNLnN0b3BRdWVzdGlvbigpO1xuICAgIG0ucmVkcmF3KCk7XG4gICAgdGhpcy5WTS5uZXh0UXVlc3Rpb24oKTtcbiAgICBtLnJlZHJhdygpO1xufTtcblxuR2FtZUNvbnRyb2xsZXIucHJvdG90eXBlLnN0YXJ0UXVlc3Rpb24gPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuVk0uc3RhcnRRdWVzdGlvbigpO1xuICAgIG0ucmVkcmF3KCk7XG59O1xuXG5HYW1lQ29udHJvbGxlci5wcm90b3R5cGUuZW5kR2FtZSA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMuVk0udXBkYXRlU2NvcmUoKTtcblx0bS5yb3V0ZShcIi9yZXN1bHRcIik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVDb250cm9sbGVyOyIsIi8qIGdsb2JhbCBtICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRpbnRyb1ZpZXdNb2RlbCA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2ludHJvLXZtJyk7XG5cbnZhciBJbnRyb0NvbnRyb2xsZXIgPSBmdW5jdGlvbigpe1xuXHR0aGlzLlZNID0gbmV3IGludHJvVmlld01vZGVsKCk7XG5cdHRoaXMuVk0uaW5pdCgpO1xufTtcblxuLypcblx0UHVibGljIE1lbWJlcnNcbiovXG5JbnRyb0NvbnRyb2xsZXIucHJvdG90eXBlLm9uQmVnaW4gPSBmdW5jdGlvbigpe1xuXHRtLnJlZHJhdygpO1xufTtcblxuSW50cm9Db250cm9sbGVyLnByb3RvdHlwZS5zdGFydEdhbWUgPSBmdW5jdGlvbigpe1xuXHRtLnJvdXRlKFwiL2dhbWVcIik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludHJvQ29udHJvbGxlcjsiLCIvKiBnbG9iYWwgbSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcblx0bG9hZGluZ1ZpZXdNb2RlbCA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2xvYWRpbmctdm0nKTtcblxudmFyIExvYWRpbmdDb250cm9sbGVyID0gZnVuY3Rpb24oKXtcblx0dGhpcy5WTSA9IG5ldyBsb2FkaW5nVmlld01vZGVsKCk7XG5cdHRoaXMuVk0uaW5pdCgpO1xufTtcblxuLypcblx0UHVibGljIE1lbWJlcnNcbiovXG5Mb2FkaW5nQ29udHJvbGxlci5wcm90b3R5cGUub25sb2FkZWQgPSBmdW5jdGlvbigpe1xuXHRtLnJvdXRlKFwiL2ludHJvXCIpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb2FkaW5nQ29udHJvbGxlcjsiLCIvKiBnbG9iYWwgbSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcblx0cmVzdWx0Vmlld01vZGVsID0gcmVxdWlyZSgnLi8uLi9tb2RlbHMvcmVzdWx0LXZtJyk7XG5cbnZhciBSZXN1bHRDb250cm9sbGVyID0gZnVuY3Rpb24oKXtcblx0dGhpcy5WTSA9IG5ldyByZXN1bHRWaWV3TW9kZWwoKTtcblx0dGhpcy5WTS5pbml0KCk7XG59O1xuXG4vKlxuXHRQdWJsaWMgTWVtYmVyc1xuKi9cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlc3VsdENvbnRyb2xsZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcblx0VmVsb2NpdHkgPSByZXF1aXJlKCd2ZWxvY2l0eS1hbmltYXRlJyksXG5cdHYgPSByZXF1aXJlKCd2ZWxvY2l0eS1hbmltYXRlL3ZlbG9jaXR5LnVpJyksXG5cdGdhbWVDb250cm9sbGVyID0gcmVxdWlyZSgnLi4vY29udHJvbGxlcnMvZ2FtZS1jb250cm9sbGVyJyksXG5cdGdhbWVWaWV3ID0gcmVxdWlyZSgnLi4vdmlld3MvZ2FtZS12aWV3JyksXG5cdHJlc3VsdENvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9jb250cm9sbGVycy9yZXN1bHQtY29udHJvbGxlcicpLFxuXHRyZXN1bHRWaWV3ID0gcmVxdWlyZSgnLi4vdmlld3MvcmVzdWx0LXZpZXcnKSxcblx0aW50cm9Db250cm9sbGVyID0gcmVxdWlyZSgnLi4vY29udHJvbGxlcnMvaW50cm8tY29udHJvbGxlcicpLFxuXHRpbnRyb1ZpZXcgPSByZXF1aXJlKCcuLi92aWV3cy9pbnRyby12aWV3JyksXG5cdGxvYWRpbmdDb250cm9sbGVyID0gcmVxdWlyZSgnLi4vY29udHJvbGxlcnMvbG9hZGluZy1jb250cm9sbGVyJyksXG5cdGxvYWRpbmdWaWV3ID0gcmVxdWlyZSgnLi4vdmlld3MvbG9hZGluZy12aWV3Jyk7XG5cbnZhciBhcHBsaWNhdGlvbiA9IGZ1bmN0aW9uKCl7XG5cdC8vaW5pdGlhbGl6ZSB0aGUgYXBwbGljYXRpb25cblx0dmFyIGFwcCA9IHtcblx0XHRsb2FkaW5nIDogeyBjb250cm9sbGVyOiBsb2FkaW5nQ29udHJvbGxlciwgdmlldzogbG9hZGluZ1ZpZXcgfSxcblx0XHRpbnRybyAgIDogeyBjb250cm9sbGVyOiBpbnRyb0NvbnRyb2xsZXIsICAgdmlldzogaW50cm9WaWV3IH0sXG5cdFx0Z2FtZVx0OiB7IGNvbnRyb2xsZXI6IGdhbWVDb250cm9sbGVyLCB2aWV3OiBnYW1lVmlldyB9LFxuXHRcdHJlc3VsdCAgOiB7IGNvbnRyb2xsZXI6IHJlc3VsdENvbnRyb2xsZXIsIHZpZXc6IHJlc3VsdFZpZXcgfSxcblx0fVxuXG5cdG0ucm91dGUubW9kZSA9IFwiaGFzaFwiO1xuXG5cdG0ucm91dGUoZG9jdW1lbnQuYm9keSwgXCIvXCIsIHtcblx0ICAgIFwiXCJcdFx0IDogYXBwLmxvYWRpbmcsXG5cdCAgICBcIi9pbnRyb1wiIDogYXBwLmludHJvLFxuXHQgICAgXCIvZ2FtZVwiICA6IGFwcC5nYW1lLFxuXHQgICAgXCIvcmVzdWx0XCI6IGFwcC5yZXN1bHRcblx0fSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFwcGxpY2F0aW9uOyIsIid1c2Ugc3RyaWN0Jztcbi8qIEdsb2JhbCBtb2R1bGUgKi9cblxudmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKSxcblx0bSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG52YXIgX251bWJlcmVkU3RyaW5nID0gZnVuY3Rpb24odGFyZ2V0KXtcblx0dmFyIGluZGV4ID0gMDtcblx0cmV0dXJuIHRhcmdldC5yZXBsYWNlKC9fKC4qPylfL2csIGZ1bmN0aW9uIChtYXRjaCwgdGV4dCwgbnVtYmVyKSB7XG4gICAgICAgIHZhciByZXMgPSAneycgKyBpbmRleCArICd9JztcbiAgICAgICAgaW5kZXgrK1xuICAgICAgICByZXR1cm4gcmVzOyAgXG4gIFx0fSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuXHQvKlxuXHRcdFJlcGxhY2VzIHN0cmluZyB3aXRoIFwiX2JvbGRfIG5vcm1hbFwiIHRleHQgdG8gbWl0aHJpbCBBcnJheVxuXHQqL1xuXHRzaG9ydGhhbmRUb01pdGhyaWxBcnJheSA6IGZ1bmN0aW9uKHRhcmdldCl7XG5cblx0XHRpZih0YXJnZXQubGVuZ3RoID09PSAwKSByZXR1cm4gW107XG5cblx0XHR2YXIga2V5d29yZE1lbWJlcnMgPSB0YXJnZXQubWF0Y2goL18oLio/KV8vZyksXG5cdFx0XHRudW1iZXJEZWxpbWl0ZXJlZFN0cmluZyA9IF9udW1iZXJlZFN0cmluZyh0YXJnZXQpLFxuXHRcdFx0dGFyZ2V0QXJyYXkgPSBfLndpdGhvdXQobnVtYmVyRGVsaW1pdGVyZWRTdHJpbmcuc3BsaXQoL3soXFxkKyl9LyksIFwiXCIpO1xuXG5cdFx0XG5cdFx0Zm9yICh2YXIgaSA9IDAsIGogPSB0YXJnZXRBcnJheS5sZW5ndGg7IGkgPCBqOyBpKyspIHtcblx0XHRcdHZhciB0ID0gK3RhcmdldEFycmF5W2ldO1xuXHRcdFx0aWYodCA+PSAwKSB0YXJnZXRBcnJheVtpXSA9IG0oJ3NwYW4nLCBrZXl3b3JkTWVtYmVyc1t0XS5yZXBsYWNlKC9fL2csICcnKSk7ICAgIHRoaXMuZ3Vlc3NlcyA9IG0ucHJvcCgwKTtcblxuXHRcdH07XG5cblx0XHRyZXR1cm4gdGFyZ2V0QXJyYXk7XG5cdFx0XG5cdH1cblxufTsiLCIndXNlIHN0cmljdCc7XG4vKiBHbG9iYWwgbW9kdWxlICovXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcblx0XyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuXG52YXIgQ09OU1RfS0VZID0gJ3Nob3ctc3Rhci1iZXRhJztcblxuLypcblx0WW91IHdvdWxkIG9idGFpbiB0aGlzIGJ5IHhoclxuKi9cbnZhciBkYXRhID0ge1xuXHR0aXRsZSA6IFwiU2hvdyBTdGFyXCIsXG5cdGRlc2NyaXB0aW9uIDogXCJDYW4geW91IGFzc29jaWF0ZSB0aGUgY2VsZWJyaXRpZXMgd2l0aCB0aGUgc2hvd3MgaW4gdGhlIHRpbWUgbGltaXQ/IENhcmVmdWwgdGhvdWdoLCB5b3Ugd2lsbCBiZSBkZWR1Y3RlZCBmb3IgYW4gaW5jb3JyZWN0IGd1ZXNzXCIsXG5cdHRpbWVyIDogNSxcblx0YXNzZXRzIDogW1xuXHRcdCB7IG5hbWUgOiAnYnJhbmQnLCBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9hNWJmNjJhYy0zZTVmLTQ2ZmEtOWI1OS01OWMwOWJjMDNkM2UucG5nJyB9LFxuXHRcdCB7IG5hbWUgOiAncG9zaXRpdmUnLCBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei8yODllOTUzYi1hOGI5LTRlOGItODlkNS0xNzY5ZTFmYjE2OGIucG5nJyB9LFxuXHRcdCB7IG5hbWUgOiAnbW9kZXJhdGUnLCBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9mZmZjNGZlNy0yZTEyLTQzYzItODUyYy1kNjBjN2Q0ZmI1YTIucG5nJyB9LFxuXHRcdCB7IG5hbWUgOiAnbmVnYXRpdmUnLCBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei83NWZiMzA5MS01NzRjLTQ4NjMtYmYyMS0wZWExODI1YzQ4NTMucG5nJyB9LFxuXHRcdCB7IG5hbWUgOiAndHJvcGh5JywgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovOWVjZGEyZTItNmQwOS00OGRkLWExNjYtMzJlYzIzMmJkYjhiLnBuZycgfVxuXHRdLFxuXHRxdWVzdGlvbnMgOlt7XG5cdFx0cXVlc3Rpb24gOiBcIl9DaG9vc2UgM18gb2YgdGhlIGZvbGxvd2luZyBhcHBlYXJlZCBpbiB0aGUgOTAncyBzaXRjb20gX0ZyaWVuZHNfXCIsXG5cdFx0YW5zd2VycyAgOiBbXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2NhNTExMDMwLWY3N2UtNDZkZi1hMWE5LTEwNTg2Mjg0YTM4Yi5wbmcnLCBuYW1lIDogJ0xpc2EgS3Vkcm93JywgY29ycmVjdCA6IHRydWUgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovYjMzY2IyNjItZTE3NS00NGY0LWE1OGUtNDI1MjMzOTFmYjVkLnBuZycsIG5hbWUgOiAnTWF0dCBMZSBCbGFuYycsIGNvcnJlY3QgOiB0cnVlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzBlODMxZThjLThkNjAtNDNlYS1hYjdkLTliYmZkNGZmYjNhZC5wbmcnLCBuYW1lIDogJ0RvbmFsZCBHbG92ZXInLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovODYxYjE4YWEtMTUyYy00YWUwLTkxMTgtZmZhMDViNzliYzc2LnBuZycsIG5hbWUgOiAnV2F5bmUgS25pZ2h0JywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzVkOWM5ZmM4LTYwNmUtNDg0YS1iNGZkLWViMGUwYmRjNDQ5Ny5wbmcnLCBuYW1lIDogJ0RlbWkgTW9vcmUnLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovNDBlODAzN2UtMTJiMi00NGQzLTlmODQtNzFmZTNkZTBiZGFmLnBuZycsIG5hbWUgOiAnTWljaGFlbCBSaWNoYXJkcycsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei82NGI4MGEzMC01N2E2LTQ5MjgtYTgwNS03MGJjMzg2NDEwMTgucG5nJywgbmFtZSA6ICdKZXNzaWNhIFdlc3RmZWxkdCcsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei80YmMwNzc2ZS0xY2Y4LTRiMTItODgxYi1mNzE1NDM0M2RiZTQucG5nJywgbmFtZSA6ICdKZW5uaWZlciBBbmlzdG9uJywgY29ycmVjdCA6IHRydWUgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovYjNmOTFhNjMtZTk4Ny00ZWE3LTgxYWItNTg2ZjkzMDYxMGFlLnBuZycsIG5hbWUgOiAnSmFzb24gQWxleGFuZGVyJywgY29ycmVjdCA6IGZhbHNlIH1cblx0XHRdXG5cdH0sXG5cdHtcblx0XHRxdWVzdGlvbiA6IFwiR29pbmcgYmFjayBhIGxpdHRsZSBmdXJ0aGVyLCBfQ2hvb3NlIDNfIHdobyBzdGFycmVkIGluIHRoZSBjdWx0IGNsYXNzaWMgX1NlaW5mZWxkXz9cIixcblx0XHRhbnN3ZXJzICA6IFtcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovMjFkOWEwNTUtYjFjNi00ZDRkLWE0YjYtNTEzMTlmYzY1MTY1LnBuZycsIG5hbWUgOiAnRGF2aWQgU2Nod2ltbWVyJywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2NhNTExMDMwLWY3N2UtNDZkZi1hMWE5LTEwNTg2Mjg0YTM4Yi5wbmcnLCBuYW1lIDogJ0xpc2EgS3Vkcm93JywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2IzM2NiMjYyLWUxNzUtNDRmNC1hNThlLTQyNTIzMzkxZmI1ZC5wbmcnLCBuYW1lIDogJ01hdHQgTGUgQmxhbmMnLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovZTc3YjY2MTctZjU0My00NmNiLWI0MzUtMzdiNmIxYTQ0MmQ3LnBuZycsIG5hbWUgOiAnQ291cnRuZXkgQ294LUFycXVldHRlJywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96Lzg2MWIxOGFhLTE1MmMtNGFlMC05MTE4LWZmYTA1Yjc5YmM3Ni5wbmcnLCBuYW1lIDogJ1dheW5lIEtuaWdodCcsIGNvcnJlY3QgOiB0cnVlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzNhNmVlYWQzLTkwY2MtNDA2Yy05OWUxLTQ5MzkyM2IzZThkMC5wbmcnLCBuYW1lIDogJ01hdHRoZXcgUGVycnknLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovNDBlODAzN2UtMTJiMi00NGQzLTlmODQtNzFmZTNkZTBiZGFmLnBuZycsIG5hbWUgOiAnTWljaGFlbCBSaWNoYXJkcycsIGNvcnJlY3QgOiB0cnVlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzFiNTljNDQ1LThmM2UtNDZiZC1hZDU3LWMxNWE3M2M3YTY4YS5wbmcnLCBuYW1lIDogJ1BhdWwgV2FzaWxld3NraScsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9iM2Y5MWE2My1lOTg3LTRlYTctODFhYi01ODZmOTMwNjEwYWUucG5nJywgbmFtZSA6ICdKYXNvbiBBbGV4YW5kZXInLCBjb3JyZWN0IDogdHJ1ZSB9XG5cdFx0XVxuXHR9LFxuXHR7XG5cdFx0cXVlc3Rpb24gOiBcIldoaWNoIG9mIHRoZSBmb2xsb3dpbmcgXzMgQWN0b3JzXyBhcHBlYXJlZCBpbiBfQ29tbXVuaXR5X1wiLFxuXHRcdGFuc3dlcnMgIDogW1xuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei8xYjEwZjM2Ni0xNWExLTRjMzgtOWFkNi00Mjk0MmEwNWMyMGEucG5nJywgbmFtZSA6ICdSeWFuIFNlYWNyZXN0JywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96Lzk4OWJiZTQ5LTc1M2UtNDIzNC04ODVkLTE5MjkzMTRhMzcxZS5wbmcnLCBuYW1lIDogJ0ZyYW5rIEFiYWduYWxlIGpyJywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzI5NDgxODJiLWZhNzUtNDNmZi05NjFmLTU5ZTYzNjA1YWUzOC5wbmcnLCBuYW1lIDogJ0t1bWFpbCBOYW5qaWFuaScsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei82M2MzMWQ4ZC0yNTU0LTQyMzAtYTAwNi0xZGY3NzY2MDYwYTcucG5nJywgbmFtZSA6ICdDaGV2eSBDaGFzZScsIGNvcnJlY3QgOiB0cnVlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzAzODMzYTgxLTdhYTctNGMzYi04ODRmLTE2NzI3N2IxOWMyNC5wbmcnLCBuYW1lIDogJ1l2ZXR0ZSBOaWNvbGUgQnJvd24nLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovZmMyNjMwZGMtYjM3ZS00MjAzLTk5YzUtMGM4MzcwYWYxMWFiLnBuZycsIG5hbWUgOiAnS2VuIEplb25nJywgY29ycmVjdCA6IHRydWUgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovYzc2NjM2MDEtMzM1Mi00YzExLWFhZDYtNDc1ZDA5Njg0MDExLnBuZycsIG5hbWUgOiAnWmFjayBCcmFmZicsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9jZjNmN2UxNy1iODUwLTRhMTItOGRhNi04Y2Q1YWFkNGE1YmEucG5nJywgbmFtZSA6ICdBbG9tb2EgV3JpZ2h0JywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzUyOTZiY2QwLTZmNmEtNDFjOS1iZTI3LWI3YTFlMGJlYTQ1OC5wbmcnLCBuYW1lIDogJ0pvZWwgTWNIYWxlJywgY29ycmVjdCA6IHRydWUgfVxuXHRcdF1cblx0fSxcblx0e1xuXHRcdHF1ZXN0aW9uIDogXCJHZXR0aW5nIGEgbGl0dGxlIG1vcmUgbW9kZXJuLCBfQ2hvb3NlIDVfIGZyb20gSEJPJ3MgX1NpbGljb24gVmFsbGV5X1wiLFxuXHRcdGFuc3dlcnMgIDogW1xuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9mMGFhNDg3Yy00YjJlLTQ3MzUtYjk2My1jNzQ1ZWUxZjcxMjUucG5nJywgbmFtZSA6ICdaYWNoIFdvb2RzJywgY29ycmVjdCA6IHRydWUgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovOTg5YmJlNDktNzUzZS00MjM0LTg4NWQtMTkyOTMxNGEzNzFlLnBuZycsIG5hbWUgOiAnRnJhbmsgQWJhZ25hbGUganInLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovYTZiMjhiZTYtZDBmOS00ZGUwLTkwOWYtNTBiMDIxYTYyODhhLnBuZycsIG5hbWUgOiAnTWFydGluIFN0YXJyJywgY29ycmVjdCA6IHRydWUgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovMjk0ODE4MmItZmE3NS00M2ZmLTk2MWYtNTllNjM2MDVhZTM4LnBuZycsIG5hbWUgOiAnS3VtYWlsIE5hbmppYW5pJywgY29ycmVjdCA6IHRydWUgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovMDM4MzNhODEtN2FhNy00YzNiLTg4NGYtMTY3Mjc3YjE5YzI0LnBuZycsIG5hbWUgOiAnWXZldHRlIE5pY29sZSBCcm93bicsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9mYzI2MzBkYy1iMzdlLTQyMDMtOTljNS0wYzgzNzBhZjExYWIucG5nJywgbmFtZSA6ICdLZW4gSmVvbmcnLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovYzc2NjM2MDEtMzM1Mi00YzExLWFhZDYtNDc1ZDA5Njg0MDExLnBuZycsIG5hbWUgOiAnWmFjayBCcmFmZicsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei85MzM1MDI5MS0zMGUyLTQ0MDMtYWZiZC05NzMwOWIzNTRmNTkucG5nJywgbmFtZSA6ICdUSiBNaWxsZXInLCBjb3JyZWN0IDogdHJ1ZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei8wMzM3NjAwNC1lZDFjLTQwNjEtYTU0MS04MGIxOGU2NmE0NWQucG5nJywgbmFtZSA6ICdUaG9tYXMgTWlkZGxlZGl0Y2gnLCBjb3JyZWN0IDogdHJ1ZSB9XG5cdFx0XVxuXHR9XG5cdF0sXG5cdHJlc3VsdE1lc3NhZ2VzIDoge1xuXHRcdDIwICA6IFwiT2ggb2jigKYudGhpbmsgeW91IG5lZWQgdG8gc3BlbmQgc29tZSB0aW1lIG9uIHRoZSBjb3VjaCB0aGlzIHdlZWtlbmQsIGhvbmluZyBpbiBvbiB5b3VyIFRWIHNraWxscyFcIixcblx0XHQ0MCAgOiBcIlByZXR0eSBnb29kLCBhbHRob3VnaCB0aGUgcHJlc3N1cmUgbXVzdCBoYXZlIGdvdCB0aGUgYmVzdCBvZiB5b3XigKZUcnkgYWdhaW4hXCIsXG5cdFx0NjAgIDogXCJHcmVhdCBlZmZvcnQhIFlvdeKAmXJlIG5lYXJseSBhbWF6aW5n4oCmbmVhcmx54oCmLndoeSBkb27igJl0IHlvdSBhc2sgdGhlIEhvbWUgT2YgQ29tZWR5IFRWIFJvb20gZm9yIHNvbWUgaGVscD8gQ2xpY2sgaGVyZSBvciB0cnkgeW91ciBsdWNrIGFnYWluIGFuZCBwbGF5IGFnYWluIVwiLFxuXHRcdDgwICA6IFwiQW1hemluZyBTdHVmZiAtIHlvdSBhcmUgYXQgdGhlIHRvcCBvZiB0aGUgbGVhZGVyYm9hcmQhIE5lYXIgcGVyZmVjdCEgQmUgcGVyZmVjdOKAplBsYXkgYWdhaW4hXCIsXG5cdFx0MTAwIDogXCJHZW5pdXPigKYuLnlvdSBrbm93IHlvdXIgVFYuIExldOKAmXMgc2VlIGhvdyB5b3UgZ28gb24gTGV2ZWwgMlwiXG5cdH1cbn07XG5cblxudmFyIF9nZXRNYXhTY29yZSA9IGZ1bmN0aW9uKCl7XG5cdHZhciBzY29yZSA9IDA7XG5cdF8uZWFjaChkYXRhLnF1ZXN0aW9ucywgZnVuY3Rpb24ocSl7XG5cdFx0c2NvcmUgKz0gXy5maWx0ZXIocS5hbnN3ZXJzLCB7IGNvcnJlY3QgOiB0cnVlIH0pLmxlbmd0aDtcblx0fSk7XG5cdHJldHVybiBzY29yZTtcbn07XG5cbnZhciBfaGFzTG9jYWxTdG9yYWdlID0gZnVuY3Rpb24oKXtcblx0dmFyIG1vZCA9ICd4eCc7XG5cdHRyeSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKG1vZCwgbW9kKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0obW9kKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59O1xuXG52YXIgX3RyeVBhcnNlID0gZnVuY3Rpb24odGFyZ2V0KXtcblx0dmFyIHJlc3VsdCA9IFtdO1xuXHR0cnkge1xuXHRcdHJldHVybiBKU09OLnBhcnNlKHRhcmdldCkgfHwgcmVzdWx0O1xuXHR9IGNhdGNoKGUpIHtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG59O1xuXG52YXIgX2dldFByZXZpb3VzU2NvcmVzID0gZnVuY3Rpb24oKXtcblx0aWYoIV9oYXNMb2NhbFN0b3JhZ2UoKSkgcmV0dXJuIFtdO1xuXHRyZXR1cm4gX3RyeVBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKENPTlNUX0tFWSkpO1xufTtcblxuLypcblx0Q29uc3RydWN0b3JcbiovXG52YXIgR2FtZU1vZGVsID0gZnVuY3Rpb24oKXtcblx0dGhpcy5zY29yZSBcdFx0PSBtLnByb3AoMCk7XG5cdHRoaXMuaGlnaFNjb3JlICA9IG0ucHJvcChfZ2V0TWF4U2NvcmUoKSk7XG5cdHRoaXMucXVlc3Rpb25zXHQ9IG0ucHJvcChkYXRhLnF1ZXN0aW9ucyk7XG5cdHRoaXMuYXNzZXRzICAgICA9IG0ucHJvcChkYXRhLmFzc2V0cyk7XG5cdHRoaXMudGl0bGVcdFx0PSBtLnByb3AoZGF0YS50aXRsZSk7XG5cdHRoaXMucmVzdWx0TWVzc2FnZXMgPSBtLnByb3AoZGF0YS5yZXN1bHRNZXNzYWdlcyk7XG5cdHRoaXMuZGVzY3JpcHRpb24gPSBtLnByb3AoZGF0YS5kZXNjcmlwdGlvbik7XG5cdHRoaXMudGltZXIgPSBtLnByb3AoZGF0YS50aW1lciB8fCA1KTtcblx0dGhpcy5wcmV2aW91c1Njb3JlcyA9IG0ucHJvcChfZ2V0UHJldmlvdXNTY29yZXMoKSk7XG59O1xuXG4vKlxuXHRQdWJsaWMgTWVtYmVyc1xuKi9cblxuR2FtZU1vZGVsLnByb3RvdHlwZS5zYXZlU2NvcmUgPSBmdW5jdGlvbihzY29yZSl7XG5cdFxuXHR0aGlzLnNjb3JlKHNjb3JlKTtcblxuXHQvLyBVcGRhdGUgcHJldmlvdXMgc2NvcmVzXG5cdHZhciBwcmV2aW91c1Njb3JlcyA9IHRoaXMucHJldmlvdXNTY29yZXMoKTtcblx0cHJldmlvdXNTY29yZXMucHVzaCh7IGRhdGUgOiBEYXRlLm5vdygpLCBzY29yZSA6IHNjb3JlIH0pO1xuXHR0aGlzLnByZXZpb3VzU2NvcmVzKHByZXZpb3VzU2NvcmVzKTtcblxuXHQvLyBzYXZlIGluIGxvY2FsIHN0b3JhZ2Ugd2hlcmUgYXZhaWxhYmxlXG5cdGlmKCEgX2hhc0xvY2FsU3RvcmFnZSgpKSByZXR1cm47XG5cdGxvY2FsU3RvcmFnZS5zZXRJdGVtKENPTlNUX0tFWSwgSlNPTi5zdHJpbmdpZnkodGhpcy5wcmV2aW91c1Njb3JlcygpKSk7XG59O1xuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgR2FtZU1vZGVsKCk7XG5cblxuXG4iLCIndXNlIHN0cmljdCc7XG4vKiBHbG9iYWwgbW9kdWxlICovXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuICAgIF8gPSByZXF1aXJlKCdsb2Rhc2gnKSxcbiAgICB1dGlscyA9IHJlcXVpcmUoJy4vLi4vbGlicy91dGlscycpLFxuICAgIEdhbWVNb2RlbCA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2dhbWUtbW9kZWwnKTtcblxudmFyIEFuc3dlciA9IGZ1bmN0aW9uKGQpe1xuICAgIHRoaXMuaW1hZ2UgPSBtLnByb3AoZC5pbWFnZSk7XG4gICAgdGhpcy5uYW1lID0gbS5wcm9wKGQubmFtZSk7XG4gICAgdGhpcy5zZWxlY3RlZCA9IG0ucHJvcChmYWxzZSk7XG4gICAgdGhpcy5jb3JyZWN0ID0gbS5wcm9wKGQuY29ycmVjdCk7XG4gICAgXG4gICAgLy8gdmlldyBtYXJrZXJzXG4gICAgdGhpcy50b2dnbGVkID0gbS5wcm9wKGZhbHNlKTtcbiAgICB0aGlzLnRvZ2dsZVJlamVjdGVkID0gbS5wcm9wKGZhbHNlKTtcbn07XG5cbkFuc3dlci5wcm90b3R5cGUuZ2V0U2NvcmUgPSBmdW5jdGlvbigpe1xuICAgIHZhciBzY29yZSA9IDA7XG4gICAgaWYodGhpcy5zZWxlY3RlZCgpICYmIHRoaXMuY29ycmVjdCgpKSBzY29yZSA9IDE7XG4gICAgcmV0dXJuIHNjb3JlO1xufTtcblxudmFyIFF1ZXN0aW9uID0gZnVuY3Rpb24oZCl7XG4gICAgdGhpcy50ZXh0ID0gbS5wcm9wKGQucXVlc3Rpb24pO1xuICAgIHRoaXMucXVlc3Rpb25FbGVtZW50ID0gbS5wcm9wKHV0aWxzLnNob3J0aGFuZFRvTWl0aHJpbEFycmF5KGQucXVlc3Rpb24pKTtcbiAgICB0aGlzLmFuc3dlcnMgPSBtLnByb3AoXy5tYXAoZC5hbnN3ZXJzLCBmdW5jdGlvbihhKXtcbiAgICAgICAgcmV0dXJuIG5ldyBBbnN3ZXIoYSk7XG4gICAgfSkpO1xuICAgIHRoaXMuZ3Vlc3NlcyA9IG0ucHJvcCgwKTtcbiAgICB0aGlzLmxpbWl0ID0gbS5wcm9wKF8uZmlsdGVyKGQuYW5zd2VycywgeyBjb3JyZWN0IDogdHJ1ZSB9KS5sZW5ndGgpO1xufTtcblxuUXVlc3Rpb24ucHJvdG90eXBlLmd1ZXNzTGltaXRSZWFjaGVkID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5ndWVzc2VzKCkgPT09IHRoaXMubGltaXQoKTtcbn07XG5cblF1ZXN0aW9uLnByb3RvdHlwZS5jb3VudEd1ZXNzID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmd1ZXNzZXMoXy5maWx0ZXIodGhpcy5hbnN3ZXJzKCksIGZ1bmN0aW9uKGFucyl7XG4gICAgICAgIHJldHVybiBhbnMuc2VsZWN0ZWQoKTtcbiAgICB9KS5sZW5ndGgpO1xufTtcblxudmFyIFRpbWVyID0gZnVuY3Rpb24odGltZSl7XG4gICAgdGhpcy5pc0FjdGl2ZSA9IG0ucHJvcChmYWxzZSk7XG4gICAgdGhpcy50aW1lID0gbS5wcm9wKHRpbWUgKiAxMDAwKTtcbn07XG4gICAgXG4vKlxuICAgIENvbnN0cnVjdG9yXG4qL1xuXG52YXIgR2FtZVZNID0gZnVuY3Rpb24oKXt9O1xuXG5cbi8qXG4gICAgUHJpdmF0ZSBNZW1iZXJzXG4qL1xuXG52YXIgX2NsZWFyUXVlc3Rpb24gPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBuZXcgUXVlc3Rpb24oeyBxdWVzdGlvbiA6IFwiXCIsIGFuc3dlcnMgOiBbXSB9KTtcbn07XG5cbi8vIFlvdSBjYW4gZ2V0IG5lZ2F0aXZlIHNjb3JlcyEhXG52YXIgX3VwZGF0ZVNjb3JlID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgY3VycmVudFNjb3JlID0gdGhpcy5jdXJyZW50U2NvcmUoKSxcbiAgICAgICAgc2NvcmUgPSAwO1xuXG4gICAgXy5lYWNoKHRoaXMucXVlc3Rpb24oKS5hbnN3ZXJzKCksIGZ1bmN0aW9uKGFucyl7XG4gICAgICAgIHNjb3JlICs9IGFucy5nZXRTY29yZSgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5jdXJyZW50U2NvcmUoY3VycmVudFNjb3JlICsgc2NvcmUpO1xufTtcblxudmFyIF9zZXRDdXJyZW50UXVlc3Rpb24gPSBmdW5jdGlvbigpe1xuICAgIHZhciBxID0gbmV3IFF1ZXN0aW9uKHRoaXMucXVlc3Rpb25zKClbdGhpcy5jdXJyZW50UXVlc3Rpb24oKV0pO1xuICAgIHRoaXMucXVlc3Rpb24ocSk7XG59O1xuXG52YXIgX25leHRRdWVzdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGN1cnJlbnQgPSB0aGlzLmN1cnJlbnRRdWVzdGlvbigpICsgMSxcbiAgICAgICAgaXNFbmQgPSBjdXJyZW50ID09PSB0aGlzLnRvdGFsUXVlc3Rpb25zKCk7XG5cbiAgICB0aGlzLmdhbWVPdmVyKGlzRW5kKTtcbiAgICBpZighIGlzRW5kKSB7XG4gICAgICAgIHRoaXMucXVlc3Rpb25TaG93bihmYWxzZSk7XG4gICAgICAgIHRoaXMuY3VycmVudFF1ZXN0aW9uKGN1cnJlbnQpO1xuICAgICAgICBfc2V0Q3VycmVudFF1ZXN0aW9uLmNhbGwodGhpcyk7XG4gICAgfVxufTtcblxuXG5cbi8qXG4gICAgUHVibGljIE1lbWJlcnNcbiovXG5HYW1lVk0ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpe1xuICAgIHZhciBxdWVzdGlvbnMgPSBHYW1lTW9kZWwucXVlc3Rpb25zKCk7XG4gICAgdGhpcy5jdXJyZW50UXVlc3Rpb24gPSBtLnByb3AoMCk7XG4gICAgdGhpcy5jdXJyZW50U2NvcmUgPSBtLnByb3AoMCk7XG4gICAgdGhpcy50aW1lciA9IG0ucHJvcChudWxsKTtcbiAgICB0aGlzLnF1ZXN0aW9ucyA9IG0ucHJvcChxdWVzdGlvbnMpO1xuICAgIHRoaXMudG90YWxRdWVzdGlvbnMgPSBtLnByb3AocXVlc3Rpb25zLmxlbmd0aCk7XG4gICAgdGhpcy5nYW1lT3ZlciA9IG0ucHJvcChmYWxzZSk7XG4gICAgdGhpcy5xdWVzdGlvbiA9IG0ucHJvcChfY2xlYXJRdWVzdGlvbigpKTtcbiAgICBcbiAgICAvLyBWaWV3IFF1ZXVlcyBcbiAgICB0aGlzLmxvY2tlZCA9IG0ucHJvcCh0cnVlKTtcbiAgICB0aGlzLnF1ZXN0aW9uU2hvd24gPSBtLnByb3AoZmFsc2UpO1xuICAgIHRoaXMuZW5kUXVlc3Rpb24gPSBtLnByb3AoZmFsc2UpO1xufTtcblxuR2FtZVZNLnByb3RvdHlwZS5zdGFydEdhbWUgPSBmdW5jdGlvbigpe1xuICAgIF9zZXRDdXJyZW50UXVlc3Rpb24uY2FsbCh0aGlzKTtcbn07XG5cbkdhbWVWTS5wcm90b3R5cGUuc3RvcFF1ZXN0aW9uID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmVuZFF1ZXN0aW9uKGZhbHNlKTtcbiAgICBfdXBkYXRlU2NvcmUuY2FsbCh0aGlzKTtcbiAgICB0aGlzLnF1ZXN0aW9uKF9jbGVhclF1ZXN0aW9uKCkpO1xufTtcblxuR2FtZVZNLnByb3RvdHlwZS5uZXh0UXVlc3Rpb24gPSBmdW5jdGlvbigpe1xuICAgIF9uZXh0UXVlc3Rpb24uY2FsbCh0aGlzKTtcbn07XG5cbkdhbWVWTS5wcm90b3R5cGUudXBkYXRlU2NvcmUgPSBmdW5jdGlvbigpe1xuICAgIEdhbWVNb2RlbC5zYXZlU2NvcmUodGhpcy5jdXJyZW50U2NvcmUoKSk7XG59O1xuXG5HYW1lVk0ucHJvdG90eXBlLnN0YXJ0UXVlc3Rpb24gPSBmdW5jdGlvbigpe1xuICAgIHRoaXMudGltZXIobmV3IFRpbWVyKEdhbWVNb2RlbC50aW1lcigpKSk7XG4gICAgdGhpcy5sb2NrZWQoZmFsc2UpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBHYW1lVk07IiwiJ3VzZSBzdHJpY3QnO1xuLyogR2xvYmFsIG1vZHVsZSAqL1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcblx0XyA9IHJlcXVpcmUoJ2xvZGFzaCcpLFxuICAgIEdhbWVNb2RlbCA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2dhbWUtbW9kZWwnKTtcblxudmFyIEludHJvVk0gPSBmdW5jdGlvbigpe307XG5cbi8qXG4gICAgUHVibGljIE1lbWJlcnNcbiovXG5JbnRyb1ZNLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLnRpdGxlID0gbS5wcm9wKEdhbWVNb2RlbC50aXRsZSgpKTtcbiAgICB0aGlzLmRlc2NyaXB0aW9uID0gbS5wcm9wKEdhbWVNb2RlbC5kZXNjcmlwdGlvbigpKTtcbiAgICB0aGlzLmJlZ2luID0gbS5wcm9wKGZhbHNlKTtcbiAgICB0aGlzLmJyYW5kID0gbS5wcm9wKF8uZmluZFdoZXJlKEdhbWVNb2RlbC5hc3NldHMoKSwgeyBuYW1lIDogJ2JyYW5kJyB9KS5pbWFnZSk7XG4gICAgdGhpcy5iZWdpbiA9IG0ucHJvcChmYWxzZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludHJvVk07IiwiJ3VzZSBzdHJpY3QnO1xuLyogR2xvYmFsIG1vZHVsZSAqL1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcbiAgICBfICA9IHJlcXVpcmUoJ2xvZGFzaCcpLFxuICAgIEdhbWVNb2RlbCA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2dhbWUtbW9kZWwnKTtcblxudmFyIExvYWRpbmdWTSA9IGZ1bmN0aW9uKCl7fTtcblxuLypcbiAgICBQcmVsb2FkIGltYWdlc1xuKi9cbnZhciBfcHJlbG9hZCA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHRhcmdldHMgPSB0aGlzLnRhcmdldHMoKSxcbiAgICAgICAgdGFyZ2V0Q291bnQgPSB0YXJnZXRzLmxlbmd0aDtcblxuICAgIHZhciBfX29uTG9hZCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBsb2FkZWQgPSB0aGlzLnRhcmdldHNMb2FkZWQoKSArIDE7XG4gICAgICAgIHRoaXMudGFyZ2V0c0xvYWRlZChsb2FkZWQpO1xuICAgICAgICB0aGlzLnByb2dyZXNzKE1hdGgucm91bmQoKGxvYWRlZCAvIHRhcmdldENvdW50KSAqIDEwMCkpO1xuICAgICAgICB0aGlzLmxvYWRlZCh0aGlzLnByb2dyZXNzKCkgPT09IDEwMCk7XG4gICAgICAgIG0ucmVkcmF3KCk7XG4gICAgfTtcblxuICAgIGZvciAodmFyIGkgPSB0YXJnZXRDb3VudCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIHZhciBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICBpbWFnZS5vbmxvYWQgPSBfX29uTG9hZC5iaW5kKHRoaXMpO1xuICAgICAgICBpbWFnZS5zcmMgPSB0YXJnZXRzW2ldO1xuICAgIH1cbn07XG5cbi8qXG4gICAgUHVibGljIE1lbWJlcnNcbiovXG5Mb2FkaW5nVk0ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpe1xuICAgIHZhciBxdWVzdGlvbnMgPSBHYW1lTW9kZWwucXVlc3Rpb25zKCksXG4gICAgICAgIGFzc2V0cyA9IEdhbWVNb2RlbC5hc3NldHMoKSxcbiAgICAgICAgZW50aXRpZXMgPSBbXTtcblxuICAgIF8uZWFjaChxdWVzdGlvbnMsIGZ1bmN0aW9uKHEpe1xuICAgICAgICBlbnRpdGllcyA9IF8udW5pb24oZW50aXRpZXMsIF8ucGx1Y2socS5hbnN3ZXJzLCAnaW1hZ2UnKSk7XG4gICAgfSk7XG4gICAgZW50aXRpZXMgPSBfLnVuaW9uKGVudGl0aWVzLCBfLnBsdWNrKGFzc2V0cywgJ2ltYWdlJykpO1xuXG4gICAgdGhpcy5sb2FkZWQgPSBtLnByb3AoZmFsc2UpO1xuICAgIHRoaXMucHJvZ3Jlc3MgPSBtLnByb3AoMCk7XG4gICAgdGhpcy50YXJnZXRzID0gbS5wcm9wKGVudGl0aWVzKTtcbiAgICB0aGlzLnRhcmdldHNMb2FkZWQgPSBtLnByb3AoMCk7XG4gICAgX3ByZWxvYWQuY2FsbCh0aGlzKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTG9hZGluZ1ZNOyIsIid1c2Ugc3RyaWN0Jztcbi8qIEdsb2JhbCBtb2R1bGUgKi9cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG5cdF8gPSByZXF1aXJlKCdsb2Rhc2gnKSxcbiAgICBHYW1lTW9kZWwgPSByZXF1aXJlKCcuLy4uL21vZGVscy9nYW1lLW1vZGVsJyk7XG5cbnZhciBSZXN1bHRWTSA9IGZ1bmN0aW9uKCl7fTtcblxuLypcblx0UHJpdmF0ZSBNZW1lYmVyc1xuKi9cblxudmFyIF9jYWxjTWVzc2FnZSA9IGZ1bmN0aW9uKCl7XG5cdHZhciBtZXNzYWdlcyA9IHRoaXMucmVzdWx0TWVzc2FnZXMoKSxcblx0XHRwZXJjZW50YWdlID0gTWF0aC5yb3VuZCgodGhpcy5zY29yZSgpIC8gdGhpcy5oaWdoU2NvcmUoKSkgKiAxMDApLFxuXHRcdHJlc3VsdCA9IG1lc3NhZ2VzWzIwXTtcblxuXHRmb3IodmFyIHJlcyBpbiBtZXNzYWdlcykge1xuXHRcdGlmKHBlcmNlbnRhZ2UgPj0gcmVzKSByZXN1bHQgPSBtZXNzYWdlc1tyZXNdO1xuXHRcdGVsc2UgYnJlYWs7XG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxudmFyIF9jYWxjVG9wRml2ZSA9IGZ1bmN0aW9uKHByZXZpb3VzU2NvcmVzKXtcbiAgICBpZihwcmV2aW91c1Njb3Jlcy5sZW5ndGggPD0gMSkgcmV0dXJuIHByZXZpb3VzU2NvcmVzO1xuICAgIHByZXZpb3VzU2NvcmVzID0gXy5zb3J0QnkocHJldmlvdXNTY29yZXMsIGZ1bmN0aW9uKHMpe1xuICAgICAgICByZXR1cm4gLXMuc2NvcmU7XG4gICAgfSk7XG4gICAgcmV0dXJuIHByZXZpb3VzU2NvcmVzLnNsaWNlKDAsNSk7XG59O1xuXG52YXIgX2dldFJlc3VsdEltYWdlID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIF8uZmluZFdoZXJlKHRoaXMuYXNzZXRzKCksIHsgbmFtZSA6ICd0cm9waHknIH0pLmltYWdlO1xufTtcblxuLypcbiAgICBQdWJsaWMgTWVtYmVyc1xuKi9cblJlc3VsdFZNLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLnNjb3JlID0gbS5wcm9wKEdhbWVNb2RlbC5zY29yZSgpKTtcbiAgICB0aGlzLmhpZ2hTY29yZSA9IG0ucHJvcChHYW1lTW9kZWwuaGlnaFNjb3JlKCkpO1xuICAgIHRoaXMucmVzdWx0TWVzc2FnZXMgPSBtLnByb3AoR2FtZU1vZGVsLnJlc3VsdE1lc3NhZ2VzKCkpO1xuICAgIHRoaXMuYXNzZXRzID0gbS5wcm9wKEdhbWVNb2RlbC5hc3NldHMoKSk7XG4gICAgXG4gICAgLy8gRGVyaXZhdGl2ZSBEYXRhXG4gICAgdGhpcy5yZXN1bHRJbWFnZSA9IG0ucHJvcChfZ2V0UmVzdWx0SW1hZ2UuY2FsbCh0aGlzKSk7XG5cdHRoaXMuc2NvcmVCb2FyZCA9IG0ucHJvcChfY2FsY1RvcEZpdmUoR2FtZU1vZGVsLnByZXZpb3VzU2NvcmVzKCkpKTtcbiAgICB0aGlzLm1lc3NhZ2UgPSBtLnByb3AoX2NhbGNNZXNzYWdlLmNhbGwodGhpcykpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZXN1bHRWTTsiLCIvKiBHbG9iYWwgbW9kdWxlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuICAgIEhhbW1lciA9IHJlcXVpcmUoJ2hhbW1lcmpzJyksXG4gICAgVmVsb2NpdHkgPSByZXF1aXJlKCd2ZWxvY2l0eS1hbmltYXRlJyk7XG5cbnZhciBWaWV3ID0gZnVuY3Rpb24oY3RybCwgYW5zd2VyKXtcblxuICAgIHZhciBhbmltSW4gPSBmdW5jdGlvbihlbCwgaXNJbml0aWFsaXplZCwgY29udGV4dCkge1xuICAgICAgICBpZiAoYW5zd2VyLnRvZ2dsZWQoKSkge1xuICAgICAgICAgICAgVmVsb2NpdHkoZWwsICdjYWxsb3V0LnB1bHNlJywgeyBkdXJhdGlvbiA6IDQwMCB9KS50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnRvZ2dsZSgnc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYW5zd2VyLnRvZ2dsZWQoZmFsc2UpO1xuICAgICAgICB9IFxuICAgICAgICBlbHNlIGlmKGFuc3dlci50b2dnbGVSZWplY3RlZCgpKXtcbiAgICAgICAgICAgIFZlbG9jaXR5KGVsLCAnY2FsbG91dC5zaGFrZScsIHsgZHVyYXRpb24gOiA0MDAgfSk7XG4gICAgICAgICAgICBhbnN3ZXIudG9nZ2xlUmVqZWN0ZWQoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYoIWlzSW5pdGlhbGl6ZWQpe1xuICAgICAgICAgICAgdmFyIGhhbW1lcnRpbWUgPSBuZXcgSGFtbWVyKGVsKTtcbiAgICAgICAgICAgIGhhbW1lcnRpbWUub24oJ3RhcCcsIGN0cmwudG9nZ2xlLmJpbmQoY3RybCwgYW5zd2VyKSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIG0oXCJsaS5hbnN3ZXIub3BhcXVlXCIsIHtcbiAgICAgICAgY29uZmlnIDogYW5pbUluLFxuICAgICAgICBzdHlsZSA6IHsgYmFja2dyb3VuZEltYWdlIDogXCJ1cmwoXCIgKyBhbnN3ZXIuaW1hZ2UoKSArIFwiKVwiIH1cbiAgICB9LCBbXG4gICAgICAgIG0oXCJoNC5uYW1lXCIsIGFuc3dlci5uYW1lKCkpXG4gICAgXSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXc7IiwiLyogR2xvYmFsIG1vZHVsZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcbiAgICBhbnN3ZXJWaWV3ID0gcmVxdWlyZSgnLi9hbnN3ZXItdmlldycpLFxuICAgIHRpbWVyVmlldyA9IHJlcXVpcmUoJy4vdGltZXItdmlldycpLFxuICAgIFZlbG9jaXR5ID0gcmVxdWlyZSgndmVsb2NpdHktYW5pbWF0ZScpO1xuXG5cbnZhciByZW5kZXJHYW1lUGFnZSA9IGZ1bmN0aW9uKGN0cmwsIGVsKXtcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9ICdnYW1lJztcbiAgICBWZWxvY2l0eShlbC5jaGlsZHJlblswXSwgeyB0cmFuc2xhdGVZIDogJys9MTcwcHgnIH0sIHsgZHVyYXRpb24gOiA1MDAsIGRlbGF5IDogMzAwLCBlYXNpbmcgOiBbIDI1MCwgMCBdIH0pLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgY3RybC5yZWFkeSgpO1xuICAgIH0pO1xufTtcblxudmFyIHJlbmRlck91dCA9IGZ1bmN0aW9uKGN0cmwsIGVsKXtcbiAgICBWZWxvY2l0eShlbC5jaGlsZHJlblswXSwgJ3JldmVyc2UnKS50aGVuKGN0cmwuZW5kR2FtZS5iaW5kKGN0cmwpKTtcbn07XG5cbnZhciByZW5kZXJRdWVzdGlvblVwID0gZnVuY3Rpb24oY3RybCwgZWwpe1xuICAgIHZhciB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdxdWVzdGlvbi1udW1iZXInKSxcbiAgICBsaW1pdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2xpbWl0JyksXG4gICAgcXVlc3Rpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjdXJyZW50LXF1ZXN0aW9uJyk7XG5cbiAgICB2YXIgc2VxdWVuY2UgPSBbXG4gICAgICAgIHsgZSA6IHRhcmdldCwgcCA6IHsgbGVmdCA6ICc1MHB4JywgdG9wIDogJzIwcHgnLCBmb250U2l6ZSA6ICcwLjlyZW0nIH0gfSxcbiAgICAgICAgeyBlIDogcXVlc3Rpb24sICBwIDogJ3RyYW5zaXRpb24uc2xpZGVVcEluJyB9LFxuICAgICAgICB7IGUgOiBsaW1pdCwgcCA6ICd0cmFuc2l0aW9uLmJvdW5jZUluJywgbyA6IHsgY29tcGxldGUgOiBjdHJsLnN0YXJ0UXVlc3Rpb24uYmluZChjdHJsKSB9IH1cbiAgICBdO1xuXG4gICAgVmVsb2NpdHkuUnVuU2VxdWVuY2Uoc2VxdWVuY2UpO1xufTtcblxudmFyIHJlbmRlckFuc3dlcnNPdXQgPSBmdW5jdGlvbihjdHJsLCBlbCl7XG4gICAgLy8gVmVsb2NpdHlcbiAgICB2YXIgdGFyZ2V0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2Fuc3dlcicpLFxuICAgICAgICBsaW1pdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2xpbWl0JyksXG4gICAgICAgIHF1ZXN0aW9uTnVtYmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncXVlc3Rpb24tbnVtYmVyJyksXG4gICAgICAgIHF1ZXN0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY3VycmVudC1xdWVzdGlvbicpO1xuXG4gICAgdmFyIHNlcXVlbmNlID0gW1xuICAgICAgICB7IGUgOiB0YXJnZXRzLCBwIDogJ3RyYW5zaXRpb24uYm91bmNlT3V0JywgbyA6IHsgZHVyYXRpb24gOiA1MDAgfSB9LFxuICAgICAgICB7IGUgOiBxdWVzdGlvbiwgcCA6ICd0cmFuc2l0aW9uLnNsaWRlVXBPdXQnLCBvIDogeyBkdXJhdGlvbiA6IDUwMCB9IH0sXG4gICAgICAgIHsgZSA6IGxpbWl0LCBwIDogJ2ZhZGVPdXQnLCBvIDogeyBkdXJhdGlvbiA6IDIwMCAsIGNvbXBsZXRlIDogY3RybC5hZnRlckVuZFF1ZXN0aW9uLmJpbmQoY3RybCkgfSB9XG4gICAgXTtcblxuICAgIFZlbG9jaXR5LlJ1blNlcXVlbmNlKHNlcXVlbmNlKTtcbn07XG5cbnZhciByZW5kZXJTdGFydFF1ZXN0aW9uID0gZnVuY3Rpb24oY3RybCwgZWwpe1xuICAgIC8vIFNob3cgdGhlIHF1ZXN0aW9uc1xuICAgIGVsLmNoaWxkcmVuWzBdLmNsYXNzTGlzdC5hZGQoJ2JlZ2luJyk7XG5cbiAgICAvLyBnZXQgYW5zd2VycyBhbmQgcmVtb3ZlIHdlaXJkIGluaXQgc3R5bGVcbiAgICB2YXIgYW5zd2VycyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2Fuc3dlcnMtYXJlYScpWzBdO1xuICAgIGFuc3dlcnMuc3R5bGUub3BhY2l0eSA9IDE7XG4gICAgYW5zd2Vycy5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICBcbiAgICAvLyBTaG93IHRoZSBhbnN3ZXJzXG4gICAgdmFyIHVsID0gYW5zd2Vycy5jaGlsZHJlblswXSxcbiAgICAgICAgcXVlc3Rpb25OdW1iZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdxdWVzdGlvbi1udW1iZXInKSxcbiAgICAgICAgc2VxdWVuY2UgPSBbXG4gICAgICAgICAgICB7IGUgOiB1bC5jaGlsZHJlbiwgcCA6ICd0cmFuc2l0aW9uLmJvdW5jZUluJywgbyA6IHsgc3RhZ2dlciA6ICcyMDBtcycsIGNvbXBsZXRlIDogcmVuZGVyUXVlc3Rpb25VcC5iaW5kKHRoaXMsIGN0cmwsIGVsKSB9IH1cbiAgICAgICAgXTtcblxuICAgIGlmKGN0cmwuVk0uY3VycmVudFF1ZXN0aW9uKCkgPiAwKSBzZXF1ZW5jZS51bnNoaWZ0KHsgZSA6IHF1ZXN0aW9uTnVtYmVyLCBwIDogJ3JldmVyc2UnIH0pO1xuICAgIFZlbG9jaXR5LlJ1blNlcXVlbmNlKHNlcXVlbmNlKTtcbiAgICBjdHJsLlZNLnF1ZXN0aW9uU2hvd24odHJ1ZSk7XG59O1xuXG52YXIgVmlldyA9IGZ1bmN0aW9uKGN0cmwpe1xuICAgIHZhciBhbmltSW4gPSBmdW5jdGlvbihlbCwgaXNJbml0aWFsaXplZCwgY29udGV4dCkge1xuICAgICAgICAvLyBEZWNpZGUgd2hhdCB0byBkbyBcbiAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICByZW5kZXJHYW1lUGFnZShjdHJsLCBlbCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZW5kIG9mIHF1ZXN0aW9uXG4gICAgICAgIGVsc2UgaWYoY3RybC5WTS5lbmRRdWVzdGlvbigpKXtcbiAgICAgICAgICAgIHJlbmRlckFuc3dlcnNPdXQoY3RybCwgZWwpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHNob3cgdGhlIHF1ZXN0aW9uXG4gICAgICAgIGVsc2UgaWYoIWN0cmwuVk0uZ2FtZU92ZXIoKSAmJiAhY3RybC5WTS5xdWVzdGlvblNob3duKCkpe1xuICAgICAgICAgICAgcmVuZGVyU3RhcnRRdWVzdGlvbihjdHJsLCBlbCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gRW5kIG9mIGdhbWUgXG4gICAgICAgIGVsc2UgaWYoY3RybC5WTS5nYW1lT3ZlcigpKSB7XG4gICAgICAgICAgICByZW5kZXJPdXQoY3RybCwgZWwpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBtKCcjZ2FtZS1wYWdlJywgW1xuICAgICAgICBtKCcuZ2FtZS1ob2xkZXInLCB7XG4gICAgICAgICAgICBjb25maWcgOiBhbmltSW5cbiAgICAgICAgfSxbXG4gICAgICAgICAgICBtKCdoZWFkZXIuZ2FtZS1oZWFkZXIub3V0LXRvcC1mdWxsJywgW1xuICAgICAgICAgICAgICAgIHRpbWVyVmlldyhjdHJsLCBjdHJsLlZNLnRpbWVyKCkpLFxuICAgICAgICAgICAgICAgIG0oJ2gzLmludHJvJywgJ0dldCByZWFkeScpLFxuICAgICAgICAgICAgICAgIG0oJ2gzLnF1ZXN0aW9uLW51bWJlcicsIFwicXVlc3Rpb24gXCIgKyAoK2N0cmwuVk0uY3VycmVudFF1ZXN0aW9uKCkgKyAxKSksXG4gICAgICAgICAgICAgICAgbSgnaDMuY3VycmVudC1xdWVzdGlvbi5vcGFxdWUnLCBjdHJsLlZNLnF1ZXN0aW9uKCkucXVlc3Rpb25FbGVtZW50KCkpLFxuICAgICAgICAgICAgICAgIG0oJ2g0LmxpbWl0Lm9wYXF1ZScsIFsnQ2hvb3NlICcsIG0oJ3NwYW4nLCBjdHJsLlZNLnF1ZXN0aW9uKCkubGltaXQoKSldKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCcuYW5zd2Vycy1hcmVhJywgW1xuICAgICAgICAgICAgICAgIG0oXCJ1bFwiLCBbXG4gICAgICAgICAgICAgICAgICAgIGN0cmwuVk0ucXVlc3Rpb24oKS5hbnN3ZXJzKCkubWFwKGZ1bmN0aW9uKGFuc3dlciwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhbnN3ZXJWaWV3KGN0cmwsIGFuc3dlcik7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pXG4gICAgICAgIF0pXG4gICAgXSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXc7IiwiLyogR2xvYmFsIG1vZHVsZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcbiAgICBfID0gcmVxdWlyZSgnbG9kYXNoJyksXG4gICAgSGFtbWVyID0gcmVxdWlyZSgnaGFtbWVyanMnKSxcbiAgICBWZWxvY2l0eSA9IHJlcXVpcmUoJ3ZlbG9jaXR5LWFuaW1hdGUnKTtcblxudmFyIExvYWRpbmcgPSBmdW5jdGlvbihjdHJsKXtcblxuICAgIHZhciBhbmltSW4gPSBmdW5jdGlvbihlbCwgaXNJbml0aWFsaXplZCwgY29udGV4dCkge1xuICAgICAgICB2YXIgc2VxdWVuY2UgPSBbXG4gICAgICAgICAgICB7IGUgOiBlbC5jaGlsZHJlblswXSwgcCA6ICd0cmFuc2l0aW9uLnNsaWRlVXBJbicsIG8gOiB7IGR1cmF0aW9uIDogMzAwLCBkZWxheSA6IDMwMCwgb3BhY2l0eSA6IDAgfSB9LFxuICAgICAgICAgICAgeyBlIDogZWwuY2hpbGRyZW5bMV0sIHAgOiAndHJhbnNpdGlvbi5zbGlkZVVwSW4nLCBvIDogeyBkdXJhdGlvbiA6IDMwMCB9IH0sXG4gICAgICAgICAgICB7IGUgOiBlbC5jaGlsZHJlblsyXSwgcCA6ICd0cmFuc2l0aW9uLmJvdW5jZUluJywgIG8gOiB7IGR1cmF0aW9uIDogMzAwIH0gfSxcbiAgICAgICAgICAgIHsgZSA6IGVsLmNoaWxkcmVuWzNdLCBwIDogeyBvcGFjaXR5IDogMSwgcm90YXRlWiA6ICctMjUnLCByaWdodCA6IC01MCB9LCBvIDogeyBkdXJhdGlvbiA6IDUwMCwgZWFzaW5nIDogWyAyNTAsIDE1IF0gfSB9XG4gICAgICAgIF07XG5cbiAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9ICdpbnRybyc7XG4gICAgICAgICAgICBWZWxvY2l0eS5SdW5TZXF1ZW5jZShzZXF1ZW5jZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBWZWxvY2l0eShlbC5jaGlsZHJlbiwgJ3RyYW5zaXRpb24uZmFkZU91dCcsIHsgc3RhZ2dlciA6ICcxMDBtcycgfSkudGhlbihjdHJsLnN0YXJ0R2FtZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGV2ZW50cyA9IGZ1bmN0aW9uKGVsLCBpc0luaXRpYWxpemVkKXtcbiAgICAgICAgaWYoIWlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgIHZhciBoYW1tZXJ0aW1lID0gbmV3IEhhbW1lcihlbCk7XG4gICAgICAgICAgICBoYW1tZXJ0aW1lLm9uKCd0YXAnLCBjdHJsLm9uQmVnaW4pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBtKCcjaW50cm8tcGFnZScsIFtcbiAgICAgICAgbSgnLmludHJvLWhvbGRlcicsIHtcbiAgICAgICAgICAgIGNvbmZpZyA6IGFuaW1JblxuICAgICAgICB9LFtcbiAgICAgICAgICAgIG0oJ2gyLm9wYXF1ZScsIGN0cmwuVk0udGl0bGUoKSksXG4gICAgICAgICAgICBtKCcuZGVzY3JpcHRpb24ub3BhcXVlJywgY3RybC5WTS5kZXNjcmlwdGlvbigpKSxcbiAgICAgICAgICAgIG0oJ2EuYmVnaW4ub3BhcXVlJywgeyBjb25maWc6IGV2ZW50cyB9LCAnYmVnaW4nKSxcbiAgICAgICAgICAgIG0oJy5icmFuZC5vcGFxdWUub3V0LXJpZ2h0LWZhcicsIHsgc3R5bGUgOiB7IGJhY2tncm91bmRJbWFnZSA6ICd1cmwoezB9KScucmVwbGFjZSgnezB9JywgY3RybC5WTS5icmFuZCgpKSB9IH0pXG4gICAgICAgIF0pXG4gICAgXSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExvYWRpbmc7IiwiLyogR2xvYmFsIG1vZHVsZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcbiAgICBWZWxvY2l0eSA9IHJlcXVpcmUoJ3ZlbG9jaXR5LWFuaW1hdGUnKTtcblxudmFyIExvYWRpbmcgPSBmdW5jdGlvbihjdHJsKXtcblxuICAgIHZhciBhbmltSW4gPSBmdW5jdGlvbihlbCwgaXNJbml0aWFsaXplZCwgY29udGV4dCkge1xuICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgIFZlbG9jaXR5KGVsLCB7IHRyYW5zbGF0ZVggOiAnKz0xMDAlJyB9LCB7IGRlbGF5IDogMjAwLCBkdXJhdGlvbiA6IDMwMCwgZWFzaW5nIDogJ2Vhc2UnIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYoY3RybC5WTS5sb2FkZWQoKSkgVmVsb2NpdHkoZWwsIFwicmV2ZXJzZVwiKS50aGVuKGN0cmwub25sb2FkZWQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBtKCcjbG9hZGluZy1wYWdlJywgW1xuICAgICAgICBtKCcubWVzc2FnZS1ob2xkZXIub3V0LWxlZnQtZnVsbCcsIHtcbiAgICAgICAgICAgIGNvbmZpZyA6IGFuaW1JblxuICAgICAgICB9LFtcbiAgICAgICAgICAgIG0oJ2gzJywgJ0xvYWRpbmcgJyArIGN0cmwuVk0ucHJvZ3Jlc3MoKSArICclJylcbiAgICAgICAgXSlcbiAgICBdKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTG9hZGluZzsiLCIvKiBHbG9iYWwgbW9kdWxlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuICAgIFZlbG9jaXR5ID0gcmVxdWlyZSgndmVsb2NpdHktYW5pbWF0ZScpO1xuXG52YXIgVmlldyA9IGZ1bmN0aW9uKGN0cmwsIHRpbWVyKXtcblxuXG4gICAgdmFyIHJlbmRlclJlcGxheSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBhID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnYnRuJyk7XG4gICAgICAgIFZlbG9jaXR5KGEsICdmYWRlSW4nLCB7IHN0YWdnZXIgOiAyMDAgfSk7XG4gICAgfTtcblxuICAgIHZhciBhbmltSW4gPSBmdW5jdGlvbihlbCwgaXNJbml0aWFsaXplZCwgY29udGV4dCkge1xuICAgICAgICBpZighaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPSAncmVzdWx0JztcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdyZXN1bHRzJylbMF07XG4gICAgICAgICAgICB2YXIgc2VxdWVuY2UgPSBbXG4gICAgICAgICAgICAgICAgeyBlIDogcmVzdWx0LmNoaWxkcmVuWzBdLCBwIDogJ3RyYW5zaXRpb24ud2hpcmxJbicgfSxcbiAgICAgICAgICAgICAgICB7IGUgOiByZXN1bHQuY2hpbGRyZW5bMV0sIHAgOiAndHJhbnNpdGlvbi5leHBhbmRJbicgfSxcbiAgICAgICAgICAgICAgICB7IGUgOiByZXN1bHQuY2hpbGRyZW5bMl0sIHAgOiAndHJhbnNpdGlvbi5leHBhbmRJbicsIG8gOiB7IGNvbXBsZXRlIDogcmVuZGVyUmVwbGF5LmJpbmQodGhpcykgfSB9XG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgVmVsb2NpdHkuUnVuU2VxdWVuY2Uoc2VxdWVuY2UpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBtKCcjcmVzdWx0LXBhZ2UnLCBbXG4gICAgICAgIG0oJy5yZXN1bHQtaG9sZGVyJywge1xuICAgICAgICAgICAgY29uZmlnIDogYW5pbUluXG4gICAgICAgIH0sW1xuICAgICAgICAgICAgbSgnLnJlc3VsdHMnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnJlc3VsdC1pbWFnZS5vcGFxdWUnLCB7IHN0eWxlIDogeyBiYWNrZ3JvdW5kSW1hZ2UgOiAndXJsKCcgKyBjdHJsLlZNLnJlc3VsdEltYWdlKCkgKyAnKScgfSB9KSxcbiAgICAgICAgICAgICAgICBtKCdoMS5yZXN1bHQub3BhcXVlJywgY3RybC5WTS5zY29yZSgpICsgJy8nICsgY3RybC5WTS5oaWdoU2NvcmUoKSksXG4gICAgICAgICAgICAgICAgbSgncC5vcGFxdWUnLCBjdHJsLlZNLm1lc3NhZ2UoKSlcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLnNjb3Jlcy5vcGFxdWUnLCBbXG4gICAgICAgICAgICAgICAgbSgnb2wnLCBbXG4gICAgICAgICAgICAgICAgICAgIGN0cmwuVk0uc2NvcmVCb2FyZCgpLm1hcChmdW5jdGlvbihzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnbGknLCBzLnNjb3JlICsgJyBwb2ludHMnKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCdhLmJ0bi5yZXBsYXkub3BhcXVlW2hyZWY9XCIjL2dhbWVcIl0nLCAnVHJ5IEFnYWluJyksXG4gICAgICAgICAgICBtKCdhLmJ0bi5sZXZlbDIub3BhcXVlJywgJ0xldmVsIDInKVxuICAgICAgICBdKVxuICAgIF0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3OyIsIi8qIEdsb2JhbCBtb2R1bGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG4gICAgVmVsb2NpdHkgPSByZXF1aXJlKCd2ZWxvY2l0eS1hbmltYXRlJyk7XG5cbnZhciBWaWV3ID0gZnVuY3Rpb24oY3RybCwgdGltZXIpe1xuXG4gICAgdmFyIGFuaW1JbiA9IGZ1bmN0aW9uKGVsLCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSB7XG4gICAgICAgIGlmKCF0aW1lcikgcmV0dXJuO1xuICAgICAgICBpZighdGltZXIuaXNBY3RpdmUoKSl7XG4gICAgICAgICAgICBWZWxvY2l0eShlbCwgeyB3aWR0aCA6ICcxMDAlJyB9LCB7IGR1cmF0aW9uIDogdGltZXIudGltZSgpLCBlYXNpbmcgOiAnbGluZWFyJyB9KS50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgY3RybC5vblRpbWUoKTtcbiAgICAgICAgICAgICAgICBWZWxvY2l0eShlbCwgeyB3aWR0aCA6IDAgfSwgIHsgZHVyYXRpb24gOiAyMDAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRpbWVyLmlzQWN0aXZlKHRydWUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBtKFwiLnRpbWVyXCIsIHtcbiAgICAgICAgY29uZmlnIDogYW5pbUluXG4gICAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXc7Il19
