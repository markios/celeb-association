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

},{"./libs/app.js":6}],2:[function(require,module,exports){
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

module.exports = GameController;
},{"./../models/game-vm":8,"mithril":"mithril"}],4:[function(require,module,exports){
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
},{"./../models/intro-vm":9,"mithril":"mithril"}],5:[function(require,module,exports){
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
},{"./../models/loading-vm":10,"mithril":"mithril"}],6:[function(require,module,exports){
'use strict';

var m = require('mithril'),
	Velocity = require('velocity-animate'),
	v = require('velocity-animate/velocity.ui'),
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
},{"../controllers/game-controller":3,"../controllers/intro-controller":4,"../controllers/loading-controller":5,"../views/game-view":12,"../views/intro-view":13,"../views/loading-view":14,"mithril":"mithril","velocity-animate":"velocity-animate","velocity-animate/velocity.ui":2}],7:[function(require,module,exports){
'use strict';
/* Global module */
var m = require('mithril');

/*
	You would obtain this by xhr
*/
var data = {
	score : 0,
	title : "Beamly Comedy Special",
	description : "Can you associate the celebrities with the shows in the time limit? Careful though, you will be deducted for an incorrect guess",
	timer : 5,
	brands : [
		'http://img-a.zeebox.com/images/z/a5bf62ac-3e5f-46fa-9b59-59c09bc03d3e.png'
	],
	questions :[{
		question : "Which of the following appeared in the 90's sitcom Friends",
		answers  : [
			{ image : 'http://img-a.zeebox.com/images/z/ca511030-f77e-46df-a1a9-10586284a38b.png', name : 'Lisa Kudrow', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/b33cb262-e175-44f4-a58e-42523391fb5d.png', name : 'Matt Le Blanc', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/e77b6617-f543-46cb-b435-37b6b1a442d7.png', name : 'Courtney Cox-Arquette', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/861b18aa-152c-4ae0-9118-ffa05b79bc76.png', name : 'Wayne Knight', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/3a6eead3-90cc-406c-99e1-493923b3e8d0.png', name : 'Matthew Perry', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/40e8037e-12b2-44d3-9f84-71fe3de0bdaf.png', name : 'Michael Richards', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/1b59c445-8f3e-46bd-ad57-c15a73c7a68a.png', name : 'Paul Wasilewski', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/4bc0776e-1cf8-4b12-881b-f7154343dbe4.png', name : 'Jennifer Aniston', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/b3f91a63-e987-4ea7-81ab-586f930610ae.png', name : 'Jason Alexander', correct : false }
		]
	},
	{
		question : "Going back a little further, who starred in the cult classic Seinfeld?",
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
	}]
};


/*
	Constructor
*/
var GameModel = function(){
	this.score 		= m.prop(data.score);
	this.questions	= m.prop(data.questions);
	this.brands     = m.prop(data.brands);
	this.title		= m.prop(data.title);
	this.description= m.prop(data.description);
	this.timer = m.prop(data.timer || 5);
};

module.exports = new GameModel();
},{"mithril":"mithril"}],8:[function(require,module,exports){
'use strict';
/* Global module */

var m = require('mithril'),
    _ = require('lodash'),
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
    this.answers = m.prop(_.map(d.answers, function(a){
        return new Answer(a);
    }));
    this.limit = m.prop(_.filter(d.answers, { correct : true }).length);
    this.guesses = m.prop(0);
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
    this.question = m.prop(new Question({ question : "", answers : [] }));
    
    // View Queues 
    this.questionShown = m.prop(false);
    this.endQuestion = m.prop(false);
};

GameVM.prototype.startGame = function(){
    _setCurrentQuestion.call(this);
};

GameVM.prototype.stopQuestion = function(){
    this.endQuestion(false);
    _updateScore.call(this);
    this.question(new Question({ question : "", answers : [] }));
};

GameVM.prototype.nextQuestion = function(){
    _nextQuestion.call(this);
};

GameVM.prototype.startQuestion = function(){
    this.timer(new Timer(GameModel.timer()));
};

module.exports = GameVM;
},{"./../models/game-model":7,"lodash":"lodash","mithril":"mithril"}],9:[function(require,module,exports){
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
},{"./../models/game-model":7,"mithril":"mithril"}],10:[function(require,module,exports){
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
        entities = [];

    _.each(questions, function(q){
        entities = _.union(entities, _.pluck(q.answers, 'image'));
    });

    this.loaded = m.prop(false);
    this.progress = m.prop(0);
    this.targets = m.prop(entities.concat(GameModel.brands()));
    this.targetsLoaded = m.prop(0);
    _preload.call(this);
};

module.exports = LoadingVM;
},{"./../models/game-model":7,"lodash":"lodash","mithril":"mithril"}],11:[function(require,module,exports){
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
},{"hammerjs":"hammerjs","mithril":"mithril","velocity-animate":"velocity-animate"}],12:[function(require,module,exports){
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
        { e : limit, p : 'fadeOut', o : { duration : 200 }, o : { complete : ctrl.afterEndQuestion.bind(ctrl) } }
        
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
            // alert('score = ' + ctrl.VM.currentScore());
            console.log(ctrl.VM.currentScore());
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
                m('h3.current-question.opaque', ctrl.VM.question().text()),
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
},{"./answer-view":11,"./timer-view":15,"mithril":"mithril","velocity-animate":"velocity-animate"}],13:[function(require,module,exports){
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
},{"hammerjs":"hammerjs","lodash":"lodash","mithril":"mithril","velocity-animate":"velocity-animate"}],14:[function(require,module,exports){
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
},{"mithril":"mithril","velocity-animate":"velocity-animate"}],15:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9tYWluLmpzIiwibm9kZV9tb2R1bGVzL3ZlbG9jaXR5LWFuaW1hdGUvdmVsb2NpdHkudWkuanMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVycy9nYW1lLWNvbnRyb2xsZXIuanMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVycy9pbnRyby1jb250cm9sbGVyLmpzIiwic3JjL3NjcmlwdHMvY29udHJvbGxlcnMvbG9hZGluZy1jb250cm9sbGVyLmpzIiwic3JjL3NjcmlwdHMvbGlicy9hcHAuanMiLCJzcmMvc2NyaXB0cy9tb2RlbHMvZ2FtZS1tb2RlbC5qcyIsInNyYy9zY3JpcHRzL21vZGVscy9nYW1lLXZtLmpzIiwic3JjL3NjcmlwdHMvbW9kZWxzL2ludHJvLXZtLmpzIiwic3JjL3NjcmlwdHMvbW9kZWxzL2xvYWRpbmctdm0uanMiLCJzcmMvc2NyaXB0cy92aWV3cy9hbnN3ZXItdmlldy5qcyIsInNyYy9zY3JpcHRzL3ZpZXdzL2dhbWUtdmlldy5qcyIsInNyYy9zY3JpcHRzL3ZpZXdzL2ludHJvLXZpZXcuanMiLCJzcmMvc2NyaXB0cy92aWV3cy9sb2FkaW5nLXZpZXcuanMiLCJzcmMvc2NyaXB0cy92aWV3cy90aW1lci12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6dkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBBcHAgPSByZXF1aXJlKCcuL2xpYnMvYXBwLmpzJyk7XG5cbndpbmRvdy53aWRnZXRWZXJzaW9uID0gXCJ2MC4wLjBcIjtcblxudmFyIGluaXRBcHAgPSBmdW5jdGlvbihwYXJhbXMpe1xuXHR2YXIgaW5zdGFuY2UgPSBuZXcgQXBwKCk7XG59O1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBmdW5jdGlvbihldmVudCl7XG4gICAvL2RvIHdvcmtcbiAgIGluaXRBcHAoKTtcbn0pO1xuIiwiLyoqKioqKioqKioqKioqKioqKioqKipcbiAgIFZlbG9jaXR5IFVJIFBhY2tcbioqKioqKioqKioqKioqKioqKioqKiovXG5cbi8qIFZlbG9jaXR5SlMub3JnIFVJIFBhY2sgKDUuMC40KS4gKEMpIDIwMTQgSnVsaWFuIFNoYXBpcm8uIE1JVCBAbGljZW5zZTogZW4ud2lraXBlZGlhLm9yZy93aWtpL01JVF9MaWNlbnNlLiBQb3J0aW9ucyBjb3B5cmlnaHQgRGFuaWVsIEVkZW4sIENocmlzdGlhbiBQdWNjaS4gKi9cblxuOyhmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIC8qIENvbW1vbkpTIG1vZHVsZS4gKi9cbiAgICBpZiAodHlwZW9mIHJlcXVpcmUgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgZXhwb3J0cyA9PT0gXCJvYmplY3RcIiApIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gICAgLyogQU1EIG1vZHVsZS4gKi9cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbIFwidmVsb2NpdHlcIiBdLCBmYWN0b3J5KTtcbiAgICAvKiBCcm93c2VyIGdsb2JhbHMuICovXG4gICAgfSBlbHNlIHtcbiAgICAgICAgZmFjdG9yeSgpO1xuICAgIH1cbn0oZnVuY3Rpb24oKSB7XG5yZXR1cm4gZnVuY3Rpb24gKGdsb2JhbCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG5cbiAgICAvKioqKioqKioqKioqKlxuICAgICAgICBDaGVja3NcbiAgICAqKioqKioqKioqKioqL1xuXG4gICAgaWYgKCFnbG9iYWwuVmVsb2NpdHkgfHwgIWdsb2JhbC5WZWxvY2l0eS5VdGlsaXRpZXMpIHtcbiAgICAgICAgd2luZG93LmNvbnNvbGUgJiYgY29uc29sZS5sb2coXCJWZWxvY2l0eSBVSSBQYWNrOiBWZWxvY2l0eSBtdXN0IGJlIGxvYWRlZCBmaXJzdC4gQWJvcnRpbmcuXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIFZlbG9jaXR5ID0gZ2xvYmFsLlZlbG9jaXR5LFxuICAgICAgICAgICAgJCA9IFZlbG9jaXR5LlV0aWxpdGllcztcbiAgICB9XG5cbiAgICB2YXIgdmVsb2NpdHlWZXJzaW9uID0gVmVsb2NpdHkudmVyc2lvbixcbiAgICAgICAgcmVxdWlyZWRWZXJzaW9uID0geyBtYWpvcjogMSwgbWlub3I6IDEsIHBhdGNoOiAwIH07XG5cbiAgICBmdW5jdGlvbiBncmVhdGVyU2VtdmVyIChwcmltYXJ5LCBzZWNvbmRhcnkpIHtcbiAgICAgICAgdmFyIHZlcnNpb25JbnRzID0gW107XG5cbiAgICAgICAgaWYgKCFwcmltYXJ5IHx8ICFzZWNvbmRhcnkpIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgICAgICAgJC5lYWNoKFsgcHJpbWFyeSwgc2Vjb25kYXJ5IF0sIGZ1bmN0aW9uKGksIHZlcnNpb25PYmplY3QpIHtcbiAgICAgICAgICAgIHZhciB2ZXJzaW9uSW50c0NvbXBvbmVudHMgPSBbXTtcblxuICAgICAgICAgICAgJC5lYWNoKHZlcnNpb25PYmplY3QsIGZ1bmN0aW9uKGNvbXBvbmVudCwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICB3aGlsZSAodmFsdWUudG9TdHJpbmcoKS5sZW5ndGggPCA1KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gXCIwXCIgKyB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmVyc2lvbkludHNDb21wb25lbnRzLnB1c2godmFsdWUpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZlcnNpb25JbnRzLnB1c2godmVyc2lvbkludHNDb21wb25lbnRzLmpvaW4oXCJcIikpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAocGFyc2VGbG9hdCh2ZXJzaW9uSW50c1swXSkgPiBwYXJzZUZsb2F0KHZlcnNpb25JbnRzWzFdKSk7XG4gICAgfVxuXG4gICAgaWYgKGdyZWF0ZXJTZW12ZXIocmVxdWlyZWRWZXJzaW9uLCB2ZWxvY2l0eVZlcnNpb24pKXtcbiAgICAgICAgdmFyIGFib3J0RXJyb3IgPSBcIlZlbG9jaXR5IFVJIFBhY2s6IFlvdSBuZWVkIHRvIHVwZGF0ZSBWZWxvY2l0eSAoanF1ZXJ5LnZlbG9jaXR5LmpzKSB0byBhIG5ld2VyIHZlcnNpb24uIFZpc2l0IGh0dHA6Ly9naXRodWIuY29tL2p1bGlhbnNoYXBpcm8vdmVsb2NpdHkuXCI7XG4gICAgICAgIGFsZXJ0KGFib3J0RXJyb3IpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYWJvcnRFcnJvcik7XG4gICAgfVxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgIEVmZmVjdCBSZWdpc3RyYXRpb25cbiAgICAqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgICAvKiBOb3RlOiBSZWdpc3RlclVJIGlzIGEgbGVnYWN5IG5hbWUuICovXG4gICAgVmVsb2NpdHkuUmVnaXN0ZXJFZmZlY3QgPSBWZWxvY2l0eS5SZWdpc3RlclVJID0gZnVuY3Rpb24gKGVmZmVjdE5hbWUsIHByb3BlcnRpZXMpIHtcbiAgICAgICAgLyogQW5pbWF0ZSB0aGUgZXhwYW5zaW9uL2NvbnRyYWN0aW9uIG9mIHRoZSBlbGVtZW50cycgcGFyZW50J3MgaGVpZ2h0IGZvciBJbi9PdXQgZWZmZWN0cy4gKi9cbiAgICAgICAgZnVuY3Rpb24gYW5pbWF0ZVBhcmVudEhlaWdodCAoZWxlbWVudHMsIGRpcmVjdGlvbiwgdG90YWxEdXJhdGlvbiwgc3RhZ2dlcikge1xuICAgICAgICAgICAgdmFyIHRvdGFsSGVpZ2h0RGVsdGEgPSAwLFxuICAgICAgICAgICAgICAgIHBhcmVudE5vZGU7XG5cbiAgICAgICAgICAgIC8qIFN1bSB0aGUgdG90YWwgaGVpZ2h0IChpbmNsdWRpbmcgcGFkZGluZyBhbmQgbWFyZ2luKSBvZiBhbGwgdGFyZ2V0ZWQgZWxlbWVudHMuICovXG4gICAgICAgICAgICAkLmVhY2goZWxlbWVudHMubm9kZVR5cGUgPyBbIGVsZW1lbnRzIF0gOiBlbGVtZW50cywgZnVuY3Rpb24oaSwgZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIGlmIChzdGFnZ2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qIEluY3JlYXNlIHRoZSB0b3RhbER1cmF0aW9uIGJ5IHRoZSBzdWNjZXNzaXZlIGRlbGF5IGFtb3VudHMgcHJvZHVjZWQgYnkgdGhlIHN0YWdnZXIgb3B0aW9uLiAqL1xuICAgICAgICAgICAgICAgICAgICB0b3RhbER1cmF0aW9uICs9IGkgKiBzdGFnZ2VyO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHBhcmVudE5vZGUgPSBlbGVtZW50LnBhcmVudE5vZGU7XG5cbiAgICAgICAgICAgICAgICAkLmVhY2goWyBcImhlaWdodFwiLCBcInBhZGRpbmdUb3BcIiwgXCJwYWRkaW5nQm90dG9tXCIsIFwibWFyZ2luVG9wXCIsIFwibWFyZ2luQm90dG9tXCJdLCBmdW5jdGlvbihpLCBwcm9wZXJ0eSkge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbEhlaWdodERlbHRhICs9IHBhcnNlRmxvYXQoVmVsb2NpdHkuQ1NTLmdldFByb3BlcnR5VmFsdWUoZWxlbWVudCwgcHJvcGVydHkpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKiBBbmltYXRlIHRoZSBwYXJlbnQgZWxlbWVudCdzIGhlaWdodCBhZGp1c3RtZW50ICh3aXRoIGEgdmFyeWluZyBkdXJhdGlvbiBtdWx0aXBsaWVyIGZvciBhZXN0aGV0aWMgYmVuZWZpdHMpLiAqL1xuICAgICAgICAgICAgVmVsb2NpdHkuYW5pbWF0ZShcbiAgICAgICAgICAgICAgICBwYXJlbnROb2RlLFxuICAgICAgICAgICAgICAgIHsgaGVpZ2h0OiAoZGlyZWN0aW9uID09PSBcIkluXCIgPyBcIitcIiA6IFwiLVwiKSArIFwiPVwiICsgdG90YWxIZWlnaHREZWx0YSB9LFxuICAgICAgICAgICAgICAgIHsgcXVldWU6IGZhbHNlLCBlYXNpbmc6IFwiZWFzZS1pbi1vdXRcIiwgZHVyYXRpb246IHRvdGFsRHVyYXRpb24gKiAoZGlyZWN0aW9uID09PSBcIkluXCIgPyAwLjYgOiAxKSB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogUmVnaXN0ZXIgYSBjdXN0b20gcmVkaXJlY3QgZm9yIGVhY2ggZWZmZWN0LiAqL1xuICAgICAgICBWZWxvY2l0eS5SZWRpcmVjdHNbZWZmZWN0TmFtZV0gPSBmdW5jdGlvbiAoZWxlbWVudCwgcmVkaXJlY3RPcHRpb25zLCBlbGVtZW50c0luZGV4LCBlbGVtZW50c1NpemUsIGVsZW1lbnRzLCBwcm9taXNlRGF0YSkge1xuICAgICAgICAgICAgdmFyIGZpbmFsRWxlbWVudCA9IChlbGVtZW50c0luZGV4ID09PSBlbGVtZW50c1NpemUgLSAxKTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm9wZXJ0aWVzLmRlZmF1bHREdXJhdGlvbiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgcHJvcGVydGllcy5kZWZhdWx0RHVyYXRpb24gPSBwcm9wZXJ0aWVzLmRlZmF1bHREdXJhdGlvbi5jYWxsKGVsZW1lbnRzLCBlbGVtZW50cyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHByb3BlcnRpZXMuZGVmYXVsdER1cmF0aW9uID0gcGFyc2VGbG9hdChwcm9wZXJ0aWVzLmRlZmF1bHREdXJhdGlvbik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIEl0ZXJhdGUgdGhyb3VnaCBlYWNoIGVmZmVjdCdzIGNhbGwgYXJyYXkuICovXG4gICAgICAgICAgICBmb3IgKHZhciBjYWxsSW5kZXggPSAwOyBjYWxsSW5kZXggPCBwcm9wZXJ0aWVzLmNhbGxzLmxlbmd0aDsgY2FsbEluZGV4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY2FsbCA9IHByb3BlcnRpZXMuY2FsbHNbY2FsbEluZGV4XSxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlNYXAgPSBjYWxsWzBdLFxuICAgICAgICAgICAgICAgICAgICByZWRpcmVjdER1cmF0aW9uID0gKHJlZGlyZWN0T3B0aW9ucy5kdXJhdGlvbiB8fCBwcm9wZXJ0aWVzLmRlZmF1bHREdXJhdGlvbiB8fCAxMDAwKSxcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb25QZXJjZW50YWdlID0gY2FsbFsxXSxcbiAgICAgICAgICAgICAgICAgICAgY2FsbE9wdGlvbnMgPSBjYWxsWzJdIHx8IHt9LFxuICAgICAgICAgICAgICAgICAgICBvcHRzID0ge307XG5cbiAgICAgICAgICAgICAgICAvKiBBc3NpZ24gdGhlIHdoaXRlbGlzdGVkIHBlci1jYWxsIG9wdGlvbnMuICovXG4gICAgICAgICAgICAgICAgb3B0cy5kdXJhdGlvbiA9IHJlZGlyZWN0RHVyYXRpb24gKiAoZHVyYXRpb25QZXJjZW50YWdlIHx8IDEpO1xuICAgICAgICAgICAgICAgIG9wdHMucXVldWUgPSByZWRpcmVjdE9wdGlvbnMucXVldWUgfHwgXCJcIjtcbiAgICAgICAgICAgICAgICBvcHRzLmVhc2luZyA9IGNhbGxPcHRpb25zLmVhc2luZyB8fCBcImVhc2VcIjtcbiAgICAgICAgICAgICAgICBvcHRzLmRlbGF5ID0gcGFyc2VGbG9hdChjYWxsT3B0aW9ucy5kZWxheSkgfHwgMDtcbiAgICAgICAgICAgICAgICBvcHRzLl9jYWNoZVZhbHVlcyA9IGNhbGxPcHRpb25zLl9jYWNoZVZhbHVlcyB8fCB0cnVlO1xuXG4gICAgICAgICAgICAgICAgLyogU3BlY2lhbCBwcm9jZXNzaW5nIGZvciB0aGUgZmlyc3QgZWZmZWN0IGNhbGwuICovXG4gICAgICAgICAgICAgICAgaWYgKGNhbGxJbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAvKiBJZiBhIGRlbGF5IHdhcyBwYXNzZWQgaW50byB0aGUgcmVkaXJlY3QsIGNvbWJpbmUgaXQgd2l0aCB0aGUgZmlyc3QgY2FsbCdzIGRlbGF5LiAqL1xuICAgICAgICAgICAgICAgICAgICBvcHRzLmRlbGF5ICs9IChwYXJzZUZsb2F0KHJlZGlyZWN0T3B0aW9ucy5kZWxheSkgfHwgMCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnRzSW5kZXggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdHMuYmVnaW4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBPbmx5IHRyaWdnZXIgYSBiZWdpbiBjYWxsYmFjayBvbiB0aGUgZmlyc3QgZWZmZWN0IGNhbGwgd2l0aCB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGUgc2V0LiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZGlyZWN0T3B0aW9ucy5iZWdpbiAmJiByZWRpcmVjdE9wdGlvbnMuYmVnaW4uY2FsbChlbGVtZW50cywgZWxlbWVudHMpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRpcmVjdGlvbiA9IGVmZmVjdE5hbWUubWF0Y2goLyhJbnxPdXQpJC8pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogTWFrZSBcImluXCIgdHJhbnNpdGlvbmluZyBlbGVtZW50cyBpbnZpc2libGUgaW1tZWRpYXRlbHkgc28gdGhhdCB0aGVyZSdzIG5vIEZPVUMgYmV0d2VlbiBub3dcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmQgdGhlIGZpcnN0IFJBRiB0aWNrLiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgoZGlyZWN0aW9uICYmIGRpcmVjdGlvblswXSA9PT0gXCJJblwiKSAmJiBwcm9wZXJ0eU1hcC5vcGFjaXR5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJC5lYWNoKGVsZW1lbnRzLm5vZGVUeXBlID8gWyBlbGVtZW50cyBdIDogZWxlbWVudHMsIGZ1bmN0aW9uKGksIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFZlbG9jaXR5LkNTUy5zZXRQcm9wZXJ0eVZhbHVlKGVsZW1lbnQsIFwib3BhY2l0eVwiLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogT25seSB0cmlnZ2VyIGFuaW1hdGVQYXJlbnRIZWlnaHQoKSBpZiB3ZSdyZSB1c2luZyBhbiBJbi9PdXQgdHJhbnNpdGlvbi4gKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVkaXJlY3RPcHRpb25zLmFuaW1hdGVQYXJlbnRIZWlnaHQgJiYgZGlyZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGVQYXJlbnRIZWlnaHQoZWxlbWVudHMsIGRpcmVjdGlvblswXSwgcmVkaXJlY3REdXJhdGlvbiArIG9wdHMuZGVsYXksIHJlZGlyZWN0T3B0aW9ucy5zdGFnZ2VyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvKiBJZiB0aGUgdXNlciBpc24ndCBvdmVycmlkaW5nIHRoZSBkaXNwbGF5IG9wdGlvbiwgZGVmYXVsdCB0byBcImF1dG9cIiBmb3IgXCJJblwiLXN1ZmZpeGVkIHRyYW5zaXRpb25zLiAqL1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVkaXJlY3RPcHRpb25zLmRpc3BsYXkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZWRpcmVjdE9wdGlvbnMuZGlzcGxheSAhPT0gdW5kZWZpbmVkICYmIHJlZGlyZWN0T3B0aW9ucy5kaXNwbGF5ICE9PSBcIm5vbmVcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdHMuZGlzcGxheSA9IHJlZGlyZWN0T3B0aW9ucy5kaXNwbGF5O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICgvSW4kLy50ZXN0KGVmZmVjdE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogSW5saW5lIGVsZW1lbnRzIGNhbm5vdCBiZSBzdWJqZWN0ZWQgdG8gdHJhbnNmb3Jtcywgc28gd2Ugc3dpdGNoIHRoZW0gdG8gaW5saW5lLWJsb2NrLiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkZWZhdWx0RGlzcGxheSA9IFZlbG9jaXR5LkNTUy5WYWx1ZXMuZ2V0RGlzcGxheVR5cGUoZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0cy5kaXNwbGF5ID0gKGRlZmF1bHREaXNwbGF5ID09PSBcImlubGluZVwiKSA/IFwiaW5saW5lLWJsb2NrXCIgOiBkZWZhdWx0RGlzcGxheTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWRpcmVjdE9wdGlvbnMudmlzaWJpbGl0eSAmJiByZWRpcmVjdE9wdGlvbnMudmlzaWJpbGl0eSAhPT0gXCJoaWRkZW5cIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0cy52aXNpYmlsaXR5ID0gcmVkaXJlY3RPcHRpb25zLnZpc2liaWxpdHk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvKiBTcGVjaWFsIHByb2Nlc3NpbmcgZm9yIHRoZSBsYXN0IGVmZmVjdCBjYWxsLiAqL1xuICAgICAgICAgICAgICAgIGlmIChjYWxsSW5kZXggPT09IHByb3BlcnRpZXMuY2FsbHMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICAvKiBBcHBlbmQgcHJvbWlzZSByZXNvbHZpbmcgb250byB0aGUgdXNlcidzIHJlZGlyZWN0IGNhbGxiYWNrLiAqL1xuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBpbmplY3RGaW5hbENhbGxiYWNrcyAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoKHJlZGlyZWN0T3B0aW9ucy5kaXNwbGF5ID09PSB1bmRlZmluZWQgfHwgcmVkaXJlY3RPcHRpb25zLmRpc3BsYXkgPT09IFwibm9uZVwiKSAmJiAvT3V0JC8udGVzdChlZmZlY3ROYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQuZWFjaChlbGVtZW50cy5ub2RlVHlwZSA/IFsgZWxlbWVudHMgXSA6IGVsZW1lbnRzLCBmdW5jdGlvbihpLCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFZlbG9jaXR5LkNTUy5zZXRQcm9wZXJ0eVZhbHVlKGVsZW1lbnQsIFwiZGlzcGxheVwiLCBcIm5vbmVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZGlyZWN0T3B0aW9ucy5jb21wbGV0ZSAmJiByZWRpcmVjdE9wdGlvbnMuY29tcGxldGUuY2FsbChlbGVtZW50cywgZWxlbWVudHMpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvbWlzZURhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9taXNlRGF0YS5yZXNvbHZlcihlbGVtZW50cyB8fCBlbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIG9wdHMuY29tcGxldGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0aWVzLnJlc2V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgcmVzZXRQcm9wZXJ0eSBpbiBwcm9wZXJ0aWVzLnJlc2V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXNldFZhbHVlID0gcHJvcGVydGllcy5yZXNldFtyZXNldFByb3BlcnR5XTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBGb3JtYXQgZWFjaCBub24tYXJyYXkgdmFsdWUgaW4gdGhlIHJlc2V0IHByb3BlcnR5IG1hcCB0byBbIHZhbHVlLCB2YWx1ZSBdIHNvIHRoYXQgY2hhbmdlcyBhcHBseVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbW1lZGlhdGVseSBhbmQgRE9NIHF1ZXJ5aW5nIGlzIGF2b2lkZWQgKHZpYSBmb3JjZWZlZWRpbmcpLiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBOb3RlOiBEb24ndCBmb3JjZWZlZWQgaG9va3MsIG90aGVyd2lzZSB0aGVpciBob29rIHJvb3RzIHdpbGwgYmUgZGVmYXVsdGVkIHRvIHRoZWlyIG51bGwgdmFsdWVzLiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoVmVsb2NpdHkuQ1NTLkhvb2tzLnJlZ2lzdGVyZWRbcmVzZXRQcm9wZXJ0eV0gPT09IHVuZGVmaW5lZCAmJiAodHlwZW9mIHJlc2V0VmFsdWUgPT09IFwic3RyaW5nXCIgfHwgdHlwZW9mIHJlc2V0VmFsdWUgPT09IFwibnVtYmVyXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLnJlc2V0W3Jlc2V0UHJvcGVydHldID0gWyBwcm9wZXJ0aWVzLnJlc2V0W3Jlc2V0UHJvcGVydHldLCBwcm9wZXJ0aWVzLnJlc2V0W3Jlc2V0UHJvcGVydHldIF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBTbyB0aGF0IHRoZSByZXNldCB2YWx1ZXMgYXJlIGFwcGxpZWQgaW5zdGFudGx5IHVwb24gdGhlIG5leHQgckFGIHRpY2ssIHVzZSBhIHplcm8gZHVyYXRpb24gYW5kIHBhcmFsbGVsIHF1ZXVlaW5nLiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXNldE9wdGlvbnMgPSB7IGR1cmF0aW9uOiAwLCBxdWV1ZTogZmFsc2UgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIFNpbmNlIHRoZSByZXNldCBvcHRpb24gdXNlcyB1cCB0aGUgY29tcGxldGUgY2FsbGJhY2ssIHdlIHRyaWdnZXIgdGhlIHVzZXIncyBjb21wbGV0ZSBjYWxsYmFjayBhdCB0aGUgZW5kIG9mIG91cnMuICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbmFsRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNldE9wdGlvbnMuY29tcGxldGUgPSBpbmplY3RGaW5hbENhbGxiYWNrcztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBWZWxvY2l0eS5hbmltYXRlKGVsZW1lbnQsIHByb3BlcnRpZXMucmVzZXQsIHJlc2V0T3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBPbmx5IHRyaWdnZXIgdGhlIHVzZXIncyBjb21wbGV0ZSBjYWxsYmFjayBvbiB0aGUgbGFzdCBlZmZlY3QgY2FsbCB3aXRoIHRoZSBsYXN0IGVsZW1lbnQgaW4gdGhlIHNldC4gKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZmluYWxFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5qZWN0RmluYWxDYWxsYmFja3MoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAocmVkaXJlY3RPcHRpb25zLnZpc2liaWxpdHkgPT09IFwiaGlkZGVuXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdHMudmlzaWJpbGl0eSA9IHJlZGlyZWN0T3B0aW9ucy52aXNpYmlsaXR5O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgVmVsb2NpdHkuYW5pbWF0ZShlbGVtZW50LCBwcm9wZXJ0eU1hcCwgb3B0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLyogUmV0dXJuIHRoZSBWZWxvY2l0eSBvYmplY3Qgc28gdGhhdCBSZWdpc3RlclVJIGNhbGxzIGNhbiBiZSBjaGFpbmVkLiAqL1xuICAgICAgICByZXR1cm4gVmVsb2NpdHk7XG4gICAgfTtcblxuICAgIC8qKioqKioqKioqKioqKioqKioqKipcbiAgICAgICBQYWNrYWdlZCBFZmZlY3RzXG4gICAgKioqKioqKioqKioqKioqKioqKioqL1xuXG4gICAgLyogRXh0ZXJuYWxpemUgdGhlIHBhY2thZ2VkRWZmZWN0cyBkYXRhIHNvIHRoYXQgdGhleSBjYW4gb3B0aW9uYWxseSBiZSBtb2RpZmllZCBhbmQgcmUtcmVnaXN0ZXJlZC4gKi9cbiAgICAvKiBTdXBwb3J0OiA8PUlFODogQ2FsbG91dHMgd2lsbCBoYXZlIG5vIGVmZmVjdCwgYW5kIHRyYW5zaXRpb25zIHdpbGwgc2ltcGx5IGZhZGUgaW4vb3V0LiBJRTkvQW5kcm9pZCAyLjM6IE1vc3QgZWZmZWN0cyBhcmUgZnVsbHkgc3VwcG9ydGVkLCB0aGUgcmVzdCBmYWRlIGluL291dC4gQWxsIG90aGVyIGJyb3dzZXJzOiBmdWxsIHN1cHBvcnQuICovXG4gICAgVmVsb2NpdHkuUmVnaXN0ZXJFZmZlY3QucGFja2FnZWRFZmZlY3RzID1cbiAgICAgICAge1xuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwiY2FsbG91dC5ib3VuY2VcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNTUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVZOiAtMzAgfSwgMC4yNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWTogMCB9LCAwLjEyNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWTogLTE1IH0sIDAuMTI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVZOiAwIH0sIDAuMjUgXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJjYWxsb3V0LnNoYWtlXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWDogLTExIH0sIDAuMTI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVYOiAxMSB9LCAwLjEyNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWDogLTExIH0sIDAuMTI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVYOiAxMSB9LCAwLjEyNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWDogLTExIH0sIDAuMTI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVYOiAxMSB9LCAwLjEyNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWDogLTExIH0sIDAuMTI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVYOiAwIH0sIDAuMTI1IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwiY2FsbG91dC5mbGFzaFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiAxMTAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIFwiZWFzZUluT3V0UXVhZFwiLCAxIF0gfSwgMC4yNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCBcImVhc2VJbk91dFF1YWRcIiBdIH0sIDAuMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgXCJlYXNlSW5PdXRRdWFkXCIgXSB9LCAwLjI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIFwiZWFzZUluT3V0UXVhZFwiIF0gfSwgMC4yNSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcImNhbGxvdXQucHVsc2VcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODI1LFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBzY2FsZVg6IDEuMSwgc2NhbGVZOiAxLjEgfSwgMC41MCwgeyBlYXNpbmc6IFwiZWFzZUluRXhwb1wiIH0gXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHNjYWxlWDogMSwgc2NhbGVZOiAxIH0sIDAuNTAgXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJjYWxsb3V0LnN3aW5nXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDk1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgcm90YXRlWjogMTUgfSwgMC4yMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgcm90YXRlWjogLTEwIH0sIDAuMjAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHJvdGF0ZVo6IDUgfSwgMC4yMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgcm90YXRlWjogLTUgfSwgMC4yMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgcm90YXRlWjogMCB9LCAwLjIwIF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwiY2FsbG91dC50YWRhXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDEwMDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IHNjYWxlWDogMC45LCBzY2FsZVk6IDAuOSwgcm90YXRlWjogLTMgfSwgMC4xMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgc2NhbGVYOiAxLjEsIHNjYWxlWTogMS4xLCByb3RhdGVaOiAzIH0sIDAuMTAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHNjYWxlWDogMS4xLCBzY2FsZVk6IDEuMSwgcm90YXRlWjogLTMgfSwgMC4xMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIFwicmV2ZXJzZVwiLCAwLjEyNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIFwicmV2ZXJzZVwiLCAwLjEyNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIFwicmV2ZXJzZVwiLCAwLjEyNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIFwicmV2ZXJzZVwiLCAwLjEyNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIFwicmV2ZXJzZVwiLCAwLjEyNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgc2NhbGVYOiAxLCBzY2FsZVk6IDEsIHJvdGF0ZVo6IDAgfSwgMC4yMCBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5mYWRlSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNTAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSB9IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmZhZGVPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNTAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSB9IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5mbGlwWEluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDcwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDgwMCwgODAwIF0sIHJvdGF0ZVk6IFsgMCwgLTU1IF0gfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5mbGlwWE91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA3MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyA4MDAsIDgwMCBdLCByb3RhdGVZOiA1NSB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwLCByb3RhdGVZOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmZsaXBZSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgODAwLCA4MDAgXSwgcm90YXRlWDogWyAwLCAtNDUgXSB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmZsaXBZT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDgwMCwgODAwIF0sIHJvdGF0ZVg6IDI1IH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAsIHJvdGF0ZVg6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmZsaXBCb3VuY2VYSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogOTAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAuNzI1LCAwIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDQwMCwgNDAwIF0sIHJvdGF0ZVk6IFsgLTEwLCA5MCBdIH0sIDAuNTAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IDAuODAsIHJvdGF0ZVk6IDEwIH0sIDAuMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IDEsIHJvdGF0ZVk6IDAgfSwgMC4yNSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uZmxpcEJvdW5jZVhPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAuOSwgMSBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyA0MDAsIDQwMCBdLCByb3RhdGVZOiAtMTAgfSwgMC41MCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogMCwgcm90YXRlWTogOTAgfSwgMC41MCBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCwgcm90YXRlWTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uZmxpcEJvdW5jZVlJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMC43MjUsIDAgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgNDAwLCA0MDAgXSwgcm90YXRlWDogWyAtMTAsIDkwIF0gfSwgMC41MCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogMC44MCwgcm90YXRlWDogMTAgfSwgMC4yNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogMSwgcm90YXRlWDogMCB9LCAwLjI1IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5mbGlwQm91bmNlWU91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMC45LCAxIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDQwMCwgNDAwIF0sIHJvdGF0ZVg6IC0xNSB9LCAwLjUwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiAwLCByb3RhdGVYOiA5MCB9LCAwLjUwIF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwLCByb3RhdGVYOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBNYWdpYy5jc3MgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zd29vcEluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDg1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgXCIxMDAlXCIsIFwiNTAlXCIgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyBcIjEwMCVcIiwgXCIxMDAlXCIgXSwgc2NhbGVYOiBbIDEsIDAgXSwgc2NhbGVZOiBbIDEsIDAgXSwgdHJhbnNsYXRlWDogWyAwLCAtNzAwIF0sIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1PcmlnaW5YOiBcIjUwJVwiLCB0cmFuc2Zvcm1PcmlnaW5ZOiBcIjUwJVwiIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBNYWdpYy5jc3MgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zd29vcE91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIFwiNTAlXCIsIFwiMTAwJVwiIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgXCIxMDAlXCIsIFwiMTAwJVwiIF0sIHNjYWxlWDogMCwgc2NhbGVZOiAwLCB0cmFuc2xhdGVYOiAtNzAwLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtT3JpZ2luWDogXCI1MCVcIiwgdHJhbnNmb3JtT3JpZ2luWTogXCI1MCVcIiwgc2NhbGVYOiAxLCBzY2FsZVk6IDEsIHRyYW5zbGF0ZVg6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIE1hZ2ljLmNzcyAqL1xuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zLiAoRmFkZXMgYW5kIHNjYWxlcyBvbmx5LikgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi53aGlybEluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDg1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgXCI1MCVcIiwgXCI1MCVcIiBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIFwiNTAlXCIsIFwiNTAlXCIgXSwgc2NhbGVYOiBbIDEsIDAgXSwgc2NhbGVZOiBbIDEsIDAgXSwgcm90YXRlWTogWyAwLCAxNjAgXSB9LCAxLCB7IGVhc2luZzogXCJlYXNlSW5PdXRTaW5lXCIgfSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIE1hZ2ljLmNzcyAqL1xuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zLiAoRmFkZXMgYW5kIHNjYWxlcyBvbmx5LikgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi53aGlybE91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA3NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgXCJlYXNlSW5PdXRRdWludFwiLCAxIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgXCI1MCVcIiwgXCI1MCVcIiBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIFwiNTAlXCIsIFwiNTAlXCIgXSwgc2NhbGVYOiAwLCBzY2FsZVk6IDAsIHJvdGF0ZVk6IDE2MCB9LCAxLCB7IGVhc2luZzogXCJzd2luZ1wiIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgc2NhbGVYOiAxLCBzY2FsZVk6IDEsIHJvdGF0ZVk6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zaHJpbmtJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA3NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIFwiNTAlXCIsIFwiNTAlXCIgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyBcIjUwJVwiLCBcIjUwJVwiIF0sIHNjYWxlWDogWyAxLCAxLjUgXSwgc2NhbGVZOiBbIDEsIDEuNSBdLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2hyaW5rT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDYwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgXCI1MCVcIiwgXCI1MCVcIiBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIFwiNTAlXCIsIFwiNTAlXCIgXSwgc2NhbGVYOiAxLjMsIHNjYWxlWTogMS4zLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgc2NhbGVYOiAxLCBzY2FsZVk6IDEgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5leHBhbmRJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA3MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIFwiNTAlXCIsIFwiNTAlXCIgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyBcIjUwJVwiLCBcIjUwJVwiIF0sIHNjYWxlWDogWyAxLCAwLjYyNSBdLCBzY2FsZVk6IFsgMSwgMC42MjUgXSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmV4cGFuZE91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA3MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIFwiNTAlXCIsIFwiNTAlXCIgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyBcIjUwJVwiLCBcIjUwJVwiIF0sIHNjYWxlWDogMC41LCBzY2FsZVk6IDAuNSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHNjYWxlWDogMSwgc2NhbGVZOiAxIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmJvdW5jZUluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHNjYWxlWDogWyAxLjA1LCAwLjMgXSwgc2NhbGVZOiBbIDEuMDUsIDAuMyBdIH0sIDAuNDAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHNjYWxlWDogMC45LCBzY2FsZVk6IDAuOSwgdHJhbnNsYXRlWjogMCB9LCAwLjIwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBzY2FsZVg6IDEsIHNjYWxlWTogMSB9LCAwLjUwIF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5ib3VuY2VPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBzY2FsZVg6IDAuOTUsIHNjYWxlWTogMC45NSB9LCAwLjM1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBzY2FsZVg6IDEuMSwgc2NhbGVZOiAxLjEsIHRyYW5zbGF0ZVo6IDAgfSwgMC4zNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHNjYWxlWDogMC4zLCBzY2FsZVk6IDAuMyB9LCAwLjMwIF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHNjYWxlWDogMSwgc2NhbGVZOiAxIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmJvdW5jZVVwSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNsYXRlWTogWyAtMzAsIDEwMDAgXSB9LCAwLjYwLCB7IGVhc2luZzogXCJlYXNlT3V0Q2lyY1wiIH0gXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVk6IDEwIH0sIDAuMjAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVk6IDAgfSwgMC4yMCBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uYm91bmNlVXBPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogMTAwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWTogMjAgfSwgMC4yMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCBcImVhc2VJbkNpcmNcIiwgMSBdLCB0cmFuc2xhdGVZOiAtMTAwMCB9LCAwLjgwIF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zbGF0ZVk6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uYm91bmNlRG93bkluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zbGF0ZVk6IFsgMzAsIC0xMDAwIF0gfSwgMC42MCwgeyBlYXNpbmc6IFwiZWFzZU91dENpcmNcIiB9IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVZOiAtMTAgfSwgMC4yMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWTogMCB9LCAwLjIwIF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5ib3VuY2VEb3duT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDEwMDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVk6IC0yMCB9LCAwLjIwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIFwiZWFzZUluQ2lyY1wiLCAxIF0sIHRyYW5zbGF0ZVk6IDEwMDAgfSwgMC44MCBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2xhdGVZOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmJvdW5jZUxlZnRJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA3NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2xhdGVYOiBbIDMwLCAtMTI1MCBdIH0sIDAuNjAsIHsgZWFzaW5nOiBcImVhc2VPdXRDaXJjXCIgfSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWDogLTEwIH0sIDAuMjAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVg6IDAgfSwgMC4yMCBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uYm91bmNlTGVmdE91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA3NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVg6IDMwIH0sIDAuMjAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgXCJlYXNlSW5DaXJjXCIsIDEgXSwgdHJhbnNsYXRlWDogLTEyNTAgfSwgMC44MCBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2xhdGVYOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmJvdW5jZVJpZ2h0SW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNzUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNsYXRlWDogWyAtMzAsIDEyNTAgXSB9LCAwLjYwLCB7IGVhc2luZzogXCJlYXNlT3V0Q2lyY1wiIH0gXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVg6IDEwIH0sIDAuMjAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVg6IDAgfSwgMC4yMCBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uYm91bmNlUmlnaHRPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNzUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVYOiAtMzAgfSwgMC4yMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCBcImVhc2VJbkNpcmNcIiwgMSBdLCB0cmFuc2xhdGVYOiAxMjUwIH0sIDAuODAgXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNsYXRlWDogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlVXBJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA5MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2xhdGVZOiBbIDAsIDIwIF0sIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZVVwT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDkwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zbGF0ZVk6IC0yMCwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zbGF0ZVk6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZURvd25JblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA5MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2xhdGVZOiBbIDAsIC0yMCBdLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVEb3duT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDkwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zbGF0ZVk6IDIwLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNsYXRlWTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlTGVmdEluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDEwMDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2xhdGVYOiBbIDAsIC0yMCBdLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVMZWZ0T3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDEwNTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2xhdGVYOiAtMjAsIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2xhdGVYOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVSaWdodEluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDEwMDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2xhdGVYOiBbIDAsIDIwIF0sIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZVJpZ2h0T3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDEwNTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2xhdGVYOiAyMCwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zbGF0ZVg6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZVVwQmlnSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNsYXRlWTogWyAwLCA3NSBdLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVVcEJpZ091dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2xhdGVZOiAtNzUsIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2xhdGVZOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVEb3duQmlnSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNsYXRlWTogWyAwLCAtNzUgXSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlRG93bkJpZ091dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2xhdGVZOiA3NSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zbGF0ZVk6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZUxlZnRCaWdJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2xhdGVYOiBbIDAsIC03NSBdLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVMZWZ0QmlnT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDc1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zbGF0ZVg6IC03NSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zbGF0ZVg6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZVJpZ2h0QmlnSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNsYXRlWDogWyAwLCA3NSBdLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVSaWdodEJpZ091dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA3NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2xhdGVYOiA3NSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zbGF0ZVg6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIE1hZ2ljLmNzcyAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnBlcnNwZWN0aXZlVXBJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyA4MDAsIDgwMCBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIDAsIDAgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyBcIjEwMCVcIiwgXCIxMDAlXCIgXSwgcm90YXRlWDogWyAwLCAtMTgwIF0gfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCwgdHJhbnNmb3JtT3JpZ2luWDogXCI1MCVcIiwgdHJhbnNmb3JtT3JpZ2luWTogXCI1MCVcIiB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogTWFnaWMuY3NzICovXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnBlcnNwZWN0aXZlVXBPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgODAwLCA4MDAgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyAwLCAwIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgXCIxMDAlXCIsIFwiMTAwJVwiIF0sIHJvdGF0ZVg6IC0xODAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCwgdHJhbnNmb3JtT3JpZ2luWDogXCI1MCVcIiwgdHJhbnNmb3JtT3JpZ2luWTogXCI1MCVcIiwgcm90YXRlWDogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogTWFnaWMuY3NzICovXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnBlcnNwZWN0aXZlRG93bkluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDgwMCwgODAwIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgMCwgMCBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIDAsIDAgXSwgcm90YXRlWDogWyAwLCAxODAgXSB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwLCB0cmFuc2Zvcm1PcmlnaW5YOiBcIjUwJVwiLCB0cmFuc2Zvcm1PcmlnaW5ZOiBcIjUwJVwiIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBNYWdpYy5jc3MgKi9cbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24ucGVyc3BlY3RpdmVEb3duT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDg1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDgwMCwgODAwIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgMCwgMCBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIDAsIDAgXSwgcm90YXRlWDogMTgwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAsIHRyYW5zZm9ybU9yaWdpblg6IFwiNTAlXCIsIHRyYW5zZm9ybU9yaWdpblk6IFwiNTAlXCIsIHJvdGF0ZVg6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIE1hZ2ljLmNzcyAqL1xuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5wZXJzcGVjdGl2ZUxlZnRJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA5NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyAyMDAwLCAyMDAwIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgMCwgMCBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIDAsIDAgXSwgcm90YXRlWTogWyAwLCAtMTgwIF0gfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCwgdHJhbnNmb3JtT3JpZ2luWDogXCI1MCVcIiwgdHJhbnNmb3JtT3JpZ2luWTogXCI1MCVcIiB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogTWFnaWMuY3NzICovXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnBlcnNwZWN0aXZlTGVmdE91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA5NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyAyMDAwLCAyMDAwIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgMCwgMCBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIDAsIDAgXSwgcm90YXRlWTogLTE4MCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwLCB0cmFuc2Zvcm1PcmlnaW5YOiBcIjUwJVwiLCB0cmFuc2Zvcm1PcmlnaW5ZOiBcIjUwJVwiLCByb3RhdGVZOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBNYWdpYy5jc3MgKi9cbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24ucGVyc3BlY3RpdmVSaWdodEluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDk1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDIwMDAsIDIwMDAgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyBcIjEwMCVcIiwgXCIxMDAlXCIgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyAwLCAwIF0sIHJvdGF0ZVk6IFsgMCwgMTgwIF0gfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCwgdHJhbnNmb3JtT3JpZ2luWDogXCI1MCVcIiwgdHJhbnNmb3JtT3JpZ2luWTogXCI1MCVcIiB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogTWFnaWMuY3NzICovXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnBlcnNwZWN0aXZlUmlnaHRPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogOTUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgMjAwMCwgMjAwMCBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIFwiMTAwJVwiLCBcIjEwMCVcIiBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIDAsIDAgXSwgcm90YXRlWTogMTgwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAsIHRyYW5zZm9ybU9yaWdpblg6IFwiNTAlXCIsIHRyYW5zZm9ybU9yaWdpblk6IFwiNTAlXCIsIHJvdGF0ZVk6IDAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgLyogUmVnaXN0ZXIgdGhlIHBhY2thZ2VkIGVmZmVjdHMuICovXG4gICAgZm9yICh2YXIgZWZmZWN0TmFtZSBpbiBWZWxvY2l0eS5SZWdpc3RlckVmZmVjdC5wYWNrYWdlZEVmZmVjdHMpIHtcbiAgICAgICAgVmVsb2NpdHkuUmVnaXN0ZXJFZmZlY3QoZWZmZWN0TmFtZSwgVmVsb2NpdHkuUmVnaXN0ZXJFZmZlY3QucGFja2FnZWRFZmZlY3RzW2VmZmVjdE5hbWVdKTtcbiAgICB9XG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgU2VxdWVuY2UgUnVubmluZ1xuICAgICoqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgICAvKiBOb3RlOiBTZXF1ZW5jZSBjYWxscyBtdXN0IHVzZSBWZWxvY2l0eSdzIHNpbmdsZS1vYmplY3QgYXJndW1lbnRzIHN5bnRheC4gKi9cbiAgICBWZWxvY2l0eS5SdW5TZXF1ZW5jZSA9IGZ1bmN0aW9uIChvcmlnaW5hbFNlcXVlbmNlKSB7XG4gICAgICAgIHZhciBzZXF1ZW5jZSA9ICQuZXh0ZW5kKHRydWUsIFtdLCBvcmlnaW5hbFNlcXVlbmNlKTtcblxuICAgICAgICBpZiAoc2VxdWVuY2UubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgJC5lYWNoKHNlcXVlbmNlLnJldmVyc2UoKSwgZnVuY3Rpb24oaSwgY3VycmVudENhbGwpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV4dENhbGwgPSBzZXF1ZW5jZVtpICsgMV07XG5cbiAgICAgICAgICAgICAgICBpZiAobmV4dENhbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLyogUGFyYWxsZWwgc2VxdWVuY2UgY2FsbHMgKGluZGljYXRlZCB2aWEgc2VxdWVuY2VRdWV1ZTpmYWxzZSkgYXJlIHRyaWdnZXJlZFxuICAgICAgICAgICAgICAgICAgICAgICBpbiB0aGUgcHJldmlvdXMgY2FsbCdzIGJlZ2luIGNhbGxiYWNrLiBPdGhlcndpc2UsIGNoYWluZWQgY2FsbHMgYXJlIG5vcm1hbGx5IHRyaWdnZXJlZFxuICAgICAgICAgICAgICAgICAgICAgICBpbiB0aGUgcHJldmlvdXMgY2FsbCdzIGNvbXBsZXRlIGNhbGxiYWNrLiAqL1xuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudENhbGxPcHRpb25zID0gY3VycmVudENhbGwubyB8fCBjdXJyZW50Q2FsbC5vcHRpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dENhbGxPcHRpb25zID0gbmV4dENhbGwubyB8fCBuZXh0Q2FsbC5vcHRpb25zO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aW1pbmcgPSAoY3VycmVudENhbGxPcHRpb25zICYmIGN1cnJlbnRDYWxsT3B0aW9ucy5zZXF1ZW5jZVF1ZXVlID09PSBmYWxzZSkgPyBcImJlZ2luXCIgOiBcImNvbXBsZXRlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja09yaWdpbmFsID0gbmV4dENhbGxPcHRpb25zICYmIG5leHRDYWxsT3B0aW9uc1t0aW1pbmddLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xuXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnNbdGltaW5nXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5leHRDYWxsRWxlbWVudHMgPSBuZXh0Q2FsbC5lIHx8IG5leHRDYWxsLmVsZW1lbnRzO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gbmV4dENhbGxFbGVtZW50cy5ub2RlVHlwZSA/IFsgbmV4dENhbGxFbGVtZW50cyBdIDogbmV4dENhbGxFbGVtZW50cztcblxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tPcmlnaW5hbCAmJiBjYWxsYmFja09yaWdpbmFsLmNhbGwoZWxlbWVudHMsIGVsZW1lbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFZlbG9jaXR5KGN1cnJlbnRDYWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0Q2FsbC5vKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0Q2FsbC5vID0gJC5leHRlbmQoe30sIG5leHRDYWxsT3B0aW9ucywgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0Q2FsbC5vcHRpb25zID0gJC5leHRlbmQoe30sIG5leHRDYWxsT3B0aW9ucywgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2VxdWVuY2UucmV2ZXJzZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgVmVsb2NpdHkoc2VxdWVuY2VbMF0pO1xuICAgIH07XG59KCh3aW5kb3cualF1ZXJ5IHx8IHdpbmRvdy5aZXB0byB8fCB3aW5kb3cpLCB3aW5kb3csIGRvY3VtZW50KTtcbn0pKTsiLCIvKiBnbG9iYWwgbSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcblx0Z2FtZVZpZXdNb2RlbCA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2dhbWUtdm0nKTtcblxudmFyIEdhbWVDb250cm9sbGVyID0gZnVuY3Rpb24oKXtcblx0dGhpcy5WTSA9IG5ldyBnYW1lVmlld01vZGVsKCk7XG5cdHRoaXMuVk0uaW5pdCgpO1xufTtcblxuXG4vKlxuXHRQdWJsaWMgTWVtYmVyc1xuKi9cblxuR2FtZUNvbnRyb2xsZXIucHJvdG90eXBlLnJlYWR5ID0gZnVuY3Rpb24oKXtcblx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdHRoaXMuVk0uc3RhcnRHYW1lKCk7XG5cdFx0bS5yZWRyYXcoKTtcblx0fS5iaW5kKHRoaXMpLCAxMDAwKTtcbn07XG5cbkdhbWVDb250cm9sbGVyLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbihhbnMpe1xuXHR2YXIgYW5zd2VySXNTZWxlY3RlZCA9IGFucy5zZWxlY3RlZCgpO1xuXHRpZih0aGlzLlZNLnF1ZXN0aW9uKCkuZ3Vlc3NMaW1pdFJlYWNoZWQoKSAmJiAhYW5zd2VySXNTZWxlY3RlZCl7XG5cdFx0YW5zLnRvZ2dsZVJlamVjdGVkKHRydWUpO1xuXHR9IGVsc2Uge1xuXHRcdGFucy5zZWxlY3RlZCghYW5zLnNlbGVjdGVkKCkpO1xuXHRcdGFucy50b2dnbGVkKHRydWUpO1xuXHRcdC8vIGNvdW50IHRoZSBndWVzc2VzIGFnYWluXG5cdFx0dGhpcy5WTS5xdWVzdGlvbigpLmNvdW50R3Vlc3MoKTtcblx0fVxuXHRtLnJlZHJhdygpO1xufTtcblxuR2FtZUNvbnRyb2xsZXIucHJvdG90eXBlLm9uVGltZSA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5WTS5lbmRRdWVzdGlvbih0cnVlKTtcbiAgICBtLnJlZHJhdygpO1xufTtcblxuR2FtZUNvbnRyb2xsZXIucHJvdG90eXBlLmFmdGVyRW5kUXVlc3Rpb24gPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuVk0uc3RvcFF1ZXN0aW9uKCk7XG4gICAgbS5yZWRyYXcoKTtcbiAgICB0aGlzLlZNLm5leHRRdWVzdGlvbigpO1xuICAgIG0ucmVkcmF3KCk7XG59O1xuXG5HYW1lQ29udHJvbGxlci5wcm90b3R5cGUuc3RhcnRRdWVzdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5WTS5zdGFydFF1ZXN0aW9uKCk7XG4gICAgbS5yZWRyYXcoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZUNvbnRyb2xsZXI7IiwiLyogZ2xvYmFsIG0gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG5cdGludHJvVmlld01vZGVsID0gcmVxdWlyZSgnLi8uLi9tb2RlbHMvaW50cm8tdm0nKTtcblxudmFyIEludHJvQ29udHJvbGxlciA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMuVk0gPSBuZXcgaW50cm9WaWV3TW9kZWwoKTtcblx0dGhpcy5WTS5pbml0KCk7XG59O1xuXG4vKlxuXHRQdWJsaWMgTWVtYmVyc1xuKi9cbkludHJvQ29udHJvbGxlci5wcm90b3R5cGUub25CZWdpbiA9IGZ1bmN0aW9uKCl7XG5cdG0ucmVkcmF3KCk7XG59O1xuXG5JbnRyb0NvbnRyb2xsZXIucHJvdG90eXBlLnN0YXJ0R2FtZSA9IGZ1bmN0aW9uKCl7XG5cdG0ucm91dGUoXCIvZ2FtZVwiKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW50cm9Db250cm9sbGVyOyIsIi8qIGdsb2JhbCBtICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRsb2FkaW5nVmlld01vZGVsID0gcmVxdWlyZSgnLi8uLi9tb2RlbHMvbG9hZGluZy12bScpO1xuXG52YXIgTG9hZGluZ0NvbnRyb2xsZXIgPSBmdW5jdGlvbigpe1xuXHR0aGlzLlZNID0gbmV3IGxvYWRpbmdWaWV3TW9kZWwoKTtcblx0dGhpcy5WTS5pbml0KCk7XG59O1xuXG4vKlxuXHRQdWJsaWMgTWVtYmVyc1xuKi9cbkxvYWRpbmdDb250cm9sbGVyLnByb3RvdHlwZS5vbmxvYWRlZCA9IGZ1bmN0aW9uKCl7XG5cdG0ucm91dGUoXCIvaW50cm9cIik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExvYWRpbmdDb250cm9sbGVyOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG5cdFZlbG9jaXR5ID0gcmVxdWlyZSgndmVsb2NpdHktYW5pbWF0ZScpLFxuXHR2ID0gcmVxdWlyZSgndmVsb2NpdHktYW5pbWF0ZS92ZWxvY2l0eS51aScpLFxuXHRnYW1lQ29udHJvbGxlciA9IHJlcXVpcmUoJy4uL2NvbnRyb2xsZXJzL2dhbWUtY29udHJvbGxlcicpLFxuXHRnYW1lVmlldyA9IHJlcXVpcmUoJy4uL3ZpZXdzL2dhbWUtdmlldycpLFxuXHRpbnRyb0NvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9jb250cm9sbGVycy9pbnRyby1jb250cm9sbGVyJyksXG5cdGludHJvVmlldyA9IHJlcXVpcmUoJy4uL3ZpZXdzL2ludHJvLXZpZXcnKSxcblx0bG9hZGluZ0NvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9jb250cm9sbGVycy9sb2FkaW5nLWNvbnRyb2xsZXInKSxcblx0bG9hZGluZ1ZpZXcgPSByZXF1aXJlKCcuLi92aWV3cy9sb2FkaW5nLXZpZXcnKTtcblxudmFyIGFwcGxpY2F0aW9uID0gZnVuY3Rpb24oKXtcblx0Ly9pbml0aWFsaXplIHRoZSBhcHBsaWNhdGlvblxuXHR2YXIgYXBwID0ge1xuXHRcdGxvYWRpbmcgOiB7IGNvbnRyb2xsZXI6IGxvYWRpbmdDb250cm9sbGVyLCB2aWV3OiBsb2FkaW5nVmlldyB9LFxuXHRcdGludHJvICAgOiB7IGNvbnRyb2xsZXI6IGludHJvQ29udHJvbGxlciwgICB2aWV3OiBpbnRyb1ZpZXcgfSxcblx0XHRnYW1lXHQ6IHsgY29udHJvbGxlcjogZ2FtZUNvbnRyb2xsZXIsIHZpZXc6IGdhbWVWaWV3IH1cblx0fVxuXG5cdG0ucm91dGUubW9kZSA9IFwiaGFzaFwiO1xuXG5cdG0ucm91dGUoZG9jdW1lbnQuYm9keSwgXCIvXCIsIHtcblx0ICAgIFwiXCJcdFx0IDogYXBwLmxvYWRpbmcsXG5cdCAgICBcIi9pbnRyb1wiIDogYXBwLmludHJvLFxuXHQgICAgXCIvZ2FtZVwiICA6IGFwcC5nYW1lXG5cdH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBhcHBsaWNhdGlvbjsiLCIndXNlIHN0cmljdCc7XG4vKiBHbG9iYWwgbW9kdWxlICovXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuLypcblx0WW91IHdvdWxkIG9idGFpbiB0aGlzIGJ5IHhoclxuKi9cbnZhciBkYXRhID0ge1xuXHRzY29yZSA6IDAsXG5cdHRpdGxlIDogXCJCZWFtbHkgQ29tZWR5IFNwZWNpYWxcIixcblx0ZGVzY3JpcHRpb24gOiBcIkNhbiB5b3UgYXNzb2NpYXRlIHRoZSBjZWxlYnJpdGllcyB3aXRoIHRoZSBzaG93cyBpbiB0aGUgdGltZSBsaW1pdD8gQ2FyZWZ1bCB0aG91Z2gsIHlvdSB3aWxsIGJlIGRlZHVjdGVkIGZvciBhbiBpbmNvcnJlY3QgZ3Vlc3NcIixcblx0dGltZXIgOiA1LFxuXHRicmFuZHMgOiBbXG5cdFx0J2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2E1YmY2MmFjLTNlNWYtNDZmYS05YjU5LTU5YzA5YmMwM2QzZS5wbmcnXG5cdF0sXG5cdHF1ZXN0aW9ucyA6W3tcblx0XHRxdWVzdGlvbiA6IFwiV2hpY2ggb2YgdGhlIGZvbGxvd2luZyBhcHBlYXJlZCBpbiB0aGUgOTAncyBzaXRjb20gRnJpZW5kc1wiLFxuXHRcdGFuc3dlcnMgIDogW1xuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9jYTUxMTAzMC1mNzdlLTQ2ZGYtYTFhOS0xMDU4NjI4NGEzOGIucG5nJywgbmFtZSA6ICdMaXNhIEt1ZHJvdycsIGNvcnJlY3QgOiB0cnVlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2IzM2NiMjYyLWUxNzUtNDRmNC1hNThlLTQyNTIzMzkxZmI1ZC5wbmcnLCBuYW1lIDogJ01hdHQgTGUgQmxhbmMnLCBjb3JyZWN0IDogdHJ1ZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9lNzdiNjYxNy1mNTQzLTQ2Y2ItYjQzNS0zN2I2YjFhNDQyZDcucG5nJywgbmFtZSA6ICdDb3VydG5leSBDb3gtQXJxdWV0dGUnLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovODYxYjE4YWEtMTUyYy00YWUwLTkxMTgtZmZhMDViNzliYzc2LnBuZycsIG5hbWUgOiAnV2F5bmUgS25pZ2h0JywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzNhNmVlYWQzLTkwY2MtNDA2Yy05OWUxLTQ5MzkyM2IzZThkMC5wbmcnLCBuYW1lIDogJ01hdHRoZXcgUGVycnknLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovNDBlODAzN2UtMTJiMi00NGQzLTlmODQtNzFmZTNkZTBiZGFmLnBuZycsIG5hbWUgOiAnTWljaGFlbCBSaWNoYXJkcycsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei8xYjU5YzQ0NS04ZjNlLTQ2YmQtYWQ1Ny1jMTVhNzNjN2E2OGEucG5nJywgbmFtZSA6ICdQYXVsIFdhc2lsZXdza2knLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovNGJjMDc3NmUtMWNmOC00YjEyLTg4MWItZjcxNTQzNDNkYmU0LnBuZycsIG5hbWUgOiAnSmVubmlmZXIgQW5pc3RvbicsIGNvcnJlY3QgOiB0cnVlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2IzZjkxYTYzLWU5ODctNGVhNy04MWFiLTU4NmY5MzA2MTBhZS5wbmcnLCBuYW1lIDogJ0phc29uIEFsZXhhbmRlcicsIGNvcnJlY3QgOiBmYWxzZSB9XG5cdFx0XVxuXHR9LFxuXHR7XG5cdFx0cXVlc3Rpb24gOiBcIkdvaW5nIGJhY2sgYSBsaXR0bGUgZnVydGhlciwgd2hvIHN0YXJyZWQgaW4gdGhlIGN1bHQgY2xhc3NpYyBTZWluZmVsZD9cIixcblx0XHRhbnN3ZXJzICA6IFtcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovMjFkOWEwNTUtYjFjNi00ZDRkLWE0YjYtNTEzMTlmYzY1MTY1LnBuZycsIG5hbWUgOiAnRGF2aWQgU2Nod2ltbWVyJywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2NhNTExMDMwLWY3N2UtNDZkZi1hMWE5LTEwNTg2Mjg0YTM4Yi5wbmcnLCBuYW1lIDogJ0xpc2EgS3Vkcm93JywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2IzM2NiMjYyLWUxNzUtNDRmNC1hNThlLTQyNTIzMzkxZmI1ZC5wbmcnLCBuYW1lIDogJ01hdHQgTGUgQmxhbmMnLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovZTc3YjY2MTctZjU0My00NmNiLWI0MzUtMzdiNmIxYTQ0MmQ3LnBuZycsIG5hbWUgOiAnQ291cnRuZXkgQ294LUFycXVldHRlJywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96Lzg2MWIxOGFhLTE1MmMtNGFlMC05MTE4LWZmYTA1Yjc5YmM3Ni5wbmcnLCBuYW1lIDogJ1dheW5lIEtuaWdodCcsIGNvcnJlY3QgOiB0cnVlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzNhNmVlYWQzLTkwY2MtNDA2Yy05OWUxLTQ5MzkyM2IzZThkMC5wbmcnLCBuYW1lIDogJ01hdHRoZXcgUGVycnknLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovNDBlODAzN2UtMTJiMi00NGQzLTlmODQtNzFmZTNkZTBiZGFmLnBuZycsIG5hbWUgOiAnTWljaGFlbCBSaWNoYXJkcycsIGNvcnJlY3QgOiB0cnVlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzFiNTljNDQ1LThmM2UtNDZiZC1hZDU3LWMxNWE3M2M3YTY4YS5wbmcnLCBuYW1lIDogJ1BhdWwgV2FzaWxld3NraScsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9iM2Y5MWE2My1lOTg3LTRlYTctODFhYi01ODZmOTMwNjEwYWUucG5nJywgbmFtZSA6ICdKYXNvbiBBbGV4YW5kZXInLCBjb3JyZWN0IDogdHJ1ZSB9XG5cdFx0XVxuXHR9XVxufTtcblxuXG4vKlxuXHRDb25zdHJ1Y3RvclxuKi9cbnZhciBHYW1lTW9kZWwgPSBmdW5jdGlvbigpe1xuXHR0aGlzLnNjb3JlIFx0XHQ9IG0ucHJvcChkYXRhLnNjb3JlKTtcblx0dGhpcy5xdWVzdGlvbnNcdD0gbS5wcm9wKGRhdGEucXVlc3Rpb25zKTtcblx0dGhpcy5icmFuZHMgICAgID0gbS5wcm9wKGRhdGEuYnJhbmRzKTtcblx0dGhpcy50aXRsZVx0XHQ9IG0ucHJvcChkYXRhLnRpdGxlKTtcblx0dGhpcy5kZXNjcmlwdGlvbj0gbS5wcm9wKGRhdGEuZGVzY3JpcHRpb24pO1xuXHR0aGlzLnRpbWVyID0gbS5wcm9wKGRhdGEudGltZXIgfHwgNSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBHYW1lTW9kZWwoKTsiLCIndXNlIHN0cmljdCc7XG4vKiBHbG9iYWwgbW9kdWxlICovXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuICAgIF8gPSByZXF1aXJlKCdsb2Rhc2gnKSxcbiAgICBHYW1lTW9kZWwgPSByZXF1aXJlKCcuLy4uL21vZGVscy9nYW1lLW1vZGVsJyk7XG5cbnZhciBBbnN3ZXIgPSBmdW5jdGlvbihkKXtcbiAgICB0aGlzLmltYWdlID0gbS5wcm9wKGQuaW1hZ2UpO1xuICAgIHRoaXMubmFtZSA9IG0ucHJvcChkLm5hbWUpO1xuICAgIHRoaXMuc2VsZWN0ZWQgPSBtLnByb3AoZmFsc2UpO1xuICAgIHRoaXMuY29ycmVjdCA9IG0ucHJvcChkLmNvcnJlY3QpO1xuICAgIFxuICAgIC8vIHZpZXcgbWFya2Vyc1xuICAgIHRoaXMudG9nZ2xlZCA9IG0ucHJvcChmYWxzZSk7XG4gICAgdGhpcy50b2dnbGVSZWplY3RlZCA9IG0ucHJvcChmYWxzZSk7XG59O1xuXG5BbnN3ZXIucHJvdG90eXBlLmdldFNjb3JlID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgc2NvcmUgPSAwO1xuICAgIGlmKHRoaXMuc2VsZWN0ZWQoKSAmJiB0aGlzLmNvcnJlY3QoKSkgc2NvcmUgPSAxO1xuICAgIHJldHVybiBzY29yZTtcbn07XG5cbnZhciBRdWVzdGlvbiA9IGZ1bmN0aW9uKGQpe1xuICAgIHRoaXMudGV4dCA9IG0ucHJvcChkLnF1ZXN0aW9uKTtcbiAgICB0aGlzLmFuc3dlcnMgPSBtLnByb3AoXy5tYXAoZC5hbnN3ZXJzLCBmdW5jdGlvbihhKXtcbiAgICAgICAgcmV0dXJuIG5ldyBBbnN3ZXIoYSk7XG4gICAgfSkpO1xuICAgIHRoaXMubGltaXQgPSBtLnByb3AoXy5maWx0ZXIoZC5hbnN3ZXJzLCB7IGNvcnJlY3QgOiB0cnVlIH0pLmxlbmd0aCk7XG4gICAgdGhpcy5ndWVzc2VzID0gbS5wcm9wKDApO1xufTtcblxuUXVlc3Rpb24ucHJvdG90eXBlLmd1ZXNzTGltaXRSZWFjaGVkID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5ndWVzc2VzKCkgPT09IHRoaXMubGltaXQoKTtcbn07XG5cblF1ZXN0aW9uLnByb3RvdHlwZS5jb3VudEd1ZXNzID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmd1ZXNzZXMoXy5maWx0ZXIodGhpcy5hbnN3ZXJzKCksIGZ1bmN0aW9uKGFucyl7XG4gICAgICAgIHJldHVybiBhbnMuc2VsZWN0ZWQoKTtcbiAgICB9KS5sZW5ndGgpO1xufTtcblxudmFyIFRpbWVyID0gZnVuY3Rpb24odGltZSl7XG4gICAgdGhpcy5pc0FjdGl2ZSA9IG0ucHJvcChmYWxzZSk7XG4gICAgdGhpcy50aW1lID0gbS5wcm9wKHRpbWUgKiAxMDAwKTtcbn07XG4gICAgXG4vKlxuICAgIENvbnN0cnVjdG9yXG4qL1xuXG52YXIgR2FtZVZNID0gZnVuY3Rpb24oKXt9O1xuXG5cbi8qXG4gICAgUHJpdmF0ZSBNZW1iZXJzXG4qL1xuXG4vLyBZb3UgY2FuIGdldCBuZWdhdGl2ZSBzY29yZXMhIVxudmFyIF91cGRhdGVTY29yZSA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGN1cnJlbnRTY29yZSA9IHRoaXMuY3VycmVudFNjb3JlKCksXG4gICAgICAgIHNjb3JlID0gMDtcblxuICAgIF8uZWFjaCh0aGlzLnF1ZXN0aW9uKCkuYW5zd2VycygpLCBmdW5jdGlvbihhbnMpe1xuICAgICAgICBzY29yZSArPSBhbnMuZ2V0U2NvcmUoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuY3VycmVudFNjb3JlKGN1cnJlbnRTY29yZSArIHNjb3JlKTtcbn07XG5cbnZhciBfc2V0Q3VycmVudFF1ZXN0aW9uID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgcSA9IG5ldyBRdWVzdGlvbih0aGlzLnF1ZXN0aW9ucygpW3RoaXMuY3VycmVudFF1ZXN0aW9uKCldKTtcbiAgICB0aGlzLnF1ZXN0aW9uKHEpO1xufTtcblxudmFyIF9uZXh0UXVlc3Rpb24gPSBmdW5jdGlvbigpe1xuICAgIHZhciBjdXJyZW50ID0gdGhpcy5jdXJyZW50UXVlc3Rpb24oKSArIDEsXG4gICAgICAgIGlzRW5kID0gY3VycmVudCA9PT0gdGhpcy50b3RhbFF1ZXN0aW9ucygpO1xuXG4gICAgdGhpcy5nYW1lT3Zlcihpc0VuZCk7XG4gICAgaWYoISBpc0VuZCkge1xuICAgICAgICB0aGlzLnF1ZXN0aW9uU2hvd24oZmFsc2UpO1xuICAgICAgICB0aGlzLmN1cnJlbnRRdWVzdGlvbihjdXJyZW50KTtcbiAgICAgICAgX3NldEN1cnJlbnRRdWVzdGlvbi5jYWxsKHRoaXMpO1xuICAgIH1cbn07XG5cbi8qXG4gICAgUHVibGljIE1lbWJlcnNcbiovXG5HYW1lVk0ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpe1xuICAgIHZhciBxdWVzdGlvbnMgPSBHYW1lTW9kZWwucXVlc3Rpb25zKCk7XG4gICAgdGhpcy5jdXJyZW50UXVlc3Rpb24gPSBtLnByb3AoMCk7XG4gICAgdGhpcy5jdXJyZW50U2NvcmUgPSBtLnByb3AoMCk7XG4gICAgdGhpcy50aW1lciA9IG0ucHJvcChudWxsKTtcbiAgICB0aGlzLnF1ZXN0aW9ucyA9IG0ucHJvcChxdWVzdGlvbnMpO1xuICAgIHRoaXMudG90YWxRdWVzdGlvbnMgPSBtLnByb3AocXVlc3Rpb25zLmxlbmd0aCk7XG4gICAgdGhpcy5nYW1lT3ZlciA9IG0ucHJvcChmYWxzZSk7XG4gICAgdGhpcy5xdWVzdGlvbiA9IG0ucHJvcChuZXcgUXVlc3Rpb24oeyBxdWVzdGlvbiA6IFwiXCIsIGFuc3dlcnMgOiBbXSB9KSk7XG4gICAgXG4gICAgLy8gVmlldyBRdWV1ZXMgXG4gICAgdGhpcy5xdWVzdGlvblNob3duID0gbS5wcm9wKGZhbHNlKTtcbiAgICB0aGlzLmVuZFF1ZXN0aW9uID0gbS5wcm9wKGZhbHNlKTtcbn07XG5cbkdhbWVWTS5wcm90b3R5cGUuc3RhcnRHYW1lID0gZnVuY3Rpb24oKXtcbiAgICBfc2V0Q3VycmVudFF1ZXN0aW9uLmNhbGwodGhpcyk7XG59O1xuXG5HYW1lVk0ucHJvdG90eXBlLnN0b3BRdWVzdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5lbmRRdWVzdGlvbihmYWxzZSk7XG4gICAgX3VwZGF0ZVNjb3JlLmNhbGwodGhpcyk7XG4gICAgdGhpcy5xdWVzdGlvbihuZXcgUXVlc3Rpb24oeyBxdWVzdGlvbiA6IFwiXCIsIGFuc3dlcnMgOiBbXSB9KSk7XG59O1xuXG5HYW1lVk0ucHJvdG90eXBlLm5leHRRdWVzdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgX25leHRRdWVzdGlvbi5jYWxsKHRoaXMpO1xufTtcblxuR2FtZVZNLnByb3RvdHlwZS5zdGFydFF1ZXN0aW9uID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLnRpbWVyKG5ldyBUaW1lcihHYW1lTW9kZWwudGltZXIoKSkpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBHYW1lVk07IiwiJ3VzZSBzdHJpY3QnO1xuLyogR2xvYmFsIG1vZHVsZSAqL1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcbiAgICBHYW1lTW9kZWwgPSByZXF1aXJlKCcuLy4uL21vZGVscy9nYW1lLW1vZGVsJyk7XG5cbnZhciBJbnRyb1ZNID0gZnVuY3Rpb24oKXt9O1xuXG4vKlxuICAgIFB1YmxpYyBNZW1iZXJzXG4qL1xuSW50cm9WTS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy50aXRsZSA9IG0ucHJvcChHYW1lTW9kZWwudGl0bGUoKSk7XG4gICAgdGhpcy5kZXNjcmlwdGlvbiA9IG0ucHJvcChHYW1lTW9kZWwuZGVzY3JpcHRpb24oKSk7XG4gICAgdGhpcy5iZWdpbiA9IG0ucHJvcChmYWxzZSk7XG4gICAgdGhpcy5icmFuZCA9IG0ucHJvcChHYW1lTW9kZWwuYnJhbmRzKClbMF0pO1xuICAgIHRoaXMuYmVnaW4gPSBtLnByb3AoZmFsc2UpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRyb1ZNOyIsIid1c2Ugc3RyaWN0Jztcbi8qIEdsb2JhbCBtb2R1bGUgKi9cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG4gICAgXyAgPSByZXF1aXJlKCdsb2Rhc2gnKSxcbiAgICBHYW1lTW9kZWwgPSByZXF1aXJlKCcuLy4uL21vZGVscy9nYW1lLW1vZGVsJyk7XG5cbnZhciBMb2FkaW5nVk0gPSBmdW5jdGlvbigpe307XG5cbi8qXG4gICAgUHJlbG9hZCBpbWFnZXNcbiovXG52YXIgX3ByZWxvYWQgPSBmdW5jdGlvbigpe1xuICAgIHZhciB0YXJnZXRzID0gdGhpcy50YXJnZXRzKCksXG4gICAgICAgIHRhcmdldENvdW50ID0gdGFyZ2V0cy5sZW5ndGg7XG5cbiAgICB2YXIgX19vbkxvYWQgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgbG9hZGVkID0gdGhpcy50YXJnZXRzTG9hZGVkKCkgKyAxO1xuICAgICAgICB0aGlzLnRhcmdldHNMb2FkZWQobG9hZGVkKTtcbiAgICAgICAgdGhpcy5wcm9ncmVzcyhNYXRoLnJvdW5kKChsb2FkZWQgLyB0YXJnZXRDb3VudCkgKiAxMDApKTtcbiAgICAgICAgdGhpcy5sb2FkZWQodGhpcy5wcm9ncmVzcygpID09PSAxMDApO1xuICAgICAgICBtLnJlZHJhdygpO1xuICAgIH07XG5cbiAgICBmb3IgKHZhciBpID0gdGFyZ2V0Q291bnQgLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1hZ2Uub25sb2FkID0gX19vbkxvYWQuYmluZCh0aGlzKTtcbiAgICAgICAgaW1hZ2Uuc3JjID0gdGFyZ2V0c1tpXTtcbiAgICB9XG59O1xuXG4vKlxuICAgIFB1YmxpYyBNZW1iZXJzXG4qL1xuTG9hZGluZ1ZNLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgcXVlc3Rpb25zID0gR2FtZU1vZGVsLnF1ZXN0aW9ucygpLFxuICAgICAgICBlbnRpdGllcyA9IFtdO1xuXG4gICAgXy5lYWNoKHF1ZXN0aW9ucywgZnVuY3Rpb24ocSl7XG4gICAgICAgIGVudGl0aWVzID0gXy51bmlvbihlbnRpdGllcywgXy5wbHVjayhxLmFuc3dlcnMsICdpbWFnZScpKTtcbiAgICB9KTtcblxuICAgIHRoaXMubG9hZGVkID0gbS5wcm9wKGZhbHNlKTtcbiAgICB0aGlzLnByb2dyZXNzID0gbS5wcm9wKDApO1xuICAgIHRoaXMudGFyZ2V0cyA9IG0ucHJvcChlbnRpdGllcy5jb25jYXQoR2FtZU1vZGVsLmJyYW5kcygpKSk7XG4gICAgdGhpcy50YXJnZXRzTG9hZGVkID0gbS5wcm9wKDApO1xuICAgIF9wcmVsb2FkLmNhbGwodGhpcyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExvYWRpbmdWTTsiLCIvKiBHbG9iYWwgbW9kdWxlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuICAgIEhhbW1lciA9IHJlcXVpcmUoJ2hhbW1lcmpzJyksXG4gICAgVmVsb2NpdHkgPSByZXF1aXJlKCd2ZWxvY2l0eS1hbmltYXRlJyk7XG5cbnZhciBWaWV3ID0gZnVuY3Rpb24oY3RybCwgYW5zd2VyKXtcblxuICAgIHZhciBhbmltSW4gPSBmdW5jdGlvbihlbCwgaXNJbml0aWFsaXplZCwgY29udGV4dCkge1xuICAgICAgICBpZiAoYW5zd2VyLnRvZ2dsZWQoKSkge1xuICAgICAgICAgICAgVmVsb2NpdHkoZWwsICdjYWxsb3V0LnB1bHNlJywgeyBkdXJhdGlvbiA6IDQwMCB9KS50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnRvZ2dsZSgnc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYW5zd2VyLnRvZ2dsZWQoZmFsc2UpO1xuICAgICAgICB9IFxuICAgICAgICBlbHNlIGlmKGFuc3dlci50b2dnbGVSZWplY3RlZCgpKXtcbiAgICAgICAgICAgIFZlbG9jaXR5KGVsLCAnY2FsbG91dC5zaGFrZScsIHsgZHVyYXRpb24gOiA0MDAgfSk7XG4gICAgICAgICAgICBhbnN3ZXIudG9nZ2xlUmVqZWN0ZWQoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYoIWlzSW5pdGlhbGl6ZWQpe1xuICAgICAgICAgICAgdmFyIGhhbW1lcnRpbWUgPSBuZXcgSGFtbWVyKGVsKTtcbiAgICAgICAgICAgIGhhbW1lcnRpbWUub24oJ3RhcCcsIGN0cmwudG9nZ2xlLmJpbmQoY3RybCwgYW5zd2VyKSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIG0oXCJsaS5hbnN3ZXIub3BhcXVlXCIsIHtcbiAgICAgICAgY29uZmlnIDogYW5pbUluLFxuICAgICAgICBzdHlsZSA6IHsgYmFja2dyb3VuZEltYWdlIDogXCJ1cmwoXCIgKyBhbnN3ZXIuaW1hZ2UoKSArIFwiKVwiIH1cbiAgICB9LCBbXG4gICAgICAgIG0oXCJoNC5uYW1lXCIsIGFuc3dlci5uYW1lKCkpXG4gICAgXSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXc7IiwiLyogR2xvYmFsIG1vZHVsZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcbiAgICBhbnN3ZXJWaWV3ID0gcmVxdWlyZSgnLi9hbnN3ZXItdmlldycpLFxuICAgIHRpbWVyVmlldyA9IHJlcXVpcmUoJy4vdGltZXItdmlldycpLFxuICAgIFZlbG9jaXR5ID0gcmVxdWlyZSgndmVsb2NpdHktYW5pbWF0ZScpO1xuXG5cbnZhciByZW5kZXJHYW1lUGFnZSA9IGZ1bmN0aW9uKGN0cmwsIGVsKXtcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9ICdnYW1lJztcbiAgICBWZWxvY2l0eShlbC5jaGlsZHJlblswXSwgeyB0cmFuc2xhdGVZIDogJys9MTcwcHgnIH0sIHsgZHVyYXRpb24gOiA1MDAsIGRlbGF5IDogMzAwLCBlYXNpbmcgOiBbIDI1MCwgMCBdIH0pLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgY3RybC5yZWFkeSgpO1xuICAgIH0pO1xufTtcblxudmFyIHJlbmRlclF1ZXN0aW9uVXAgPSBmdW5jdGlvbihjdHJsLCBlbCl7XG4gICAgdmFyIHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3F1ZXN0aW9uLW51bWJlcicpLFxuICAgIGxpbWl0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbGltaXQnKSxcbiAgICBxdWVzdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2N1cnJlbnQtcXVlc3Rpb24nKTtcblxuICAgIHZhciBzZXF1ZW5jZSA9IFtcbiAgICAgICAgeyBlIDogdGFyZ2V0LCBwIDogeyBsZWZ0IDogJzUwcHgnLCB0b3AgOiAnMjBweCcsIGZvbnRTaXplIDogJzAuOXJlbScgfSB9LFxuICAgICAgICB7IGUgOiBxdWVzdGlvbiwgIHAgOiAndHJhbnNpdGlvbi5zbGlkZVVwSW4nIH0sXG4gICAgICAgIHsgZSA6IGxpbWl0LCBwIDogJ3RyYW5zaXRpb24uYm91bmNlSW4nLCBvIDogeyBjb21wbGV0ZSA6IGN0cmwuc3RhcnRRdWVzdGlvbi5iaW5kKGN0cmwpIH0gfVxuICAgIF07XG5cbiAgICBWZWxvY2l0eS5SdW5TZXF1ZW5jZShzZXF1ZW5jZSk7XG59O1xuXG52YXIgcmVuZGVyQW5zd2Vyc091dCA9IGZ1bmN0aW9uKGN0cmwsIGVsKXtcbiAgICAvLyBWZWxvY2l0eVxuICAgIHZhciB0YXJnZXRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnYW5zd2VyJyksXG4gICAgICAgIGxpbWl0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbGltaXQnKSxcbiAgICAgICAgcXVlc3Rpb25OdW1iZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdxdWVzdGlvbi1udW1iZXInKSxcbiAgICAgICAgcXVlc3Rpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjdXJyZW50LXF1ZXN0aW9uJyk7XG5cbiAgICB2YXIgc2VxdWVuY2UgPSBbXG4gICAgICAgIHsgZSA6IHRhcmdldHMsIHAgOiAndHJhbnNpdGlvbi5ib3VuY2VPdXQnLCBvIDogeyBkdXJhdGlvbiA6IDUwMCB9IH0sXG4gICAgICAgIHsgZSA6IHF1ZXN0aW9uLCBwIDogJ3RyYW5zaXRpb24uc2xpZGVVcE91dCcsIG8gOiB7IGR1cmF0aW9uIDogNTAwIH0gfSxcbiAgICAgICAgeyBlIDogbGltaXQsIHAgOiAnZmFkZU91dCcsIG8gOiB7IGR1cmF0aW9uIDogMjAwIH0sIG8gOiB7IGNvbXBsZXRlIDogY3RybC5hZnRlckVuZFF1ZXN0aW9uLmJpbmQoY3RybCkgfSB9XG4gICAgICAgIFxuICAgIF07XG5cbiAgICBWZWxvY2l0eS5SdW5TZXF1ZW5jZShzZXF1ZW5jZSk7XG59O1xuXG52YXIgcmVuZGVyU3RhcnRRdWVzdGlvbiA9IGZ1bmN0aW9uKGN0cmwsIGVsKXtcbiAgICAvLyBTaG93IHRoZSBxdWVzdGlvbnNcbiAgICBlbC5jaGlsZHJlblswXS5jbGFzc0xpc3QuYWRkKCdiZWdpbicpO1xuXG4gICAgLy8gZ2V0IGFuc3dlcnMgYW5kIHJlbW92ZSB3ZWlyZCBpbml0IHN0eWxlXG4gICAgdmFyIGFuc3dlcnMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdhbnN3ZXJzLWFyZWEnKVswXTtcbiAgICBhbnN3ZXJzLnN0eWxlLm9wYWNpdHkgPSAxO1xuICAgIGFuc3dlcnMuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgXG4gICAgLy8gU2hvdyB0aGUgYW5zd2Vyc1xuICAgIHZhciB1bCA9IGFuc3dlcnMuY2hpbGRyZW5bMF0sXG4gICAgICAgIHF1ZXN0aW9uTnVtYmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncXVlc3Rpb24tbnVtYmVyJyksXG4gICAgICAgIHNlcXVlbmNlID0gW1xuICAgICAgICAgICAgeyBlIDogdWwuY2hpbGRyZW4sIHAgOiAndHJhbnNpdGlvbi5ib3VuY2VJbicsIG8gOiB7IHN0YWdnZXIgOiAnMjAwbXMnLCBjb21wbGV0ZSA6IHJlbmRlclF1ZXN0aW9uVXAuYmluZCh0aGlzLCBjdHJsLCBlbCkgfSB9XG4gICAgICAgIF07XG5cbiAgICBpZihjdHJsLlZNLmN1cnJlbnRRdWVzdGlvbigpID4gMCkgc2VxdWVuY2UudW5zaGlmdCh7IGUgOiBxdWVzdGlvbk51bWJlciwgcCA6ICdyZXZlcnNlJyB9KTtcbiAgICBWZWxvY2l0eS5SdW5TZXF1ZW5jZShzZXF1ZW5jZSk7XG4gICAgY3RybC5WTS5xdWVzdGlvblNob3duKHRydWUpO1xufTtcblxudmFyIFZpZXcgPSBmdW5jdGlvbihjdHJsKXtcbiAgICB2YXIgYW5pbUluID0gZnVuY3Rpb24oZWwsIGlzSW5pdGlhbGl6ZWQsIGNvbnRleHQpIHtcbiAgICAgICAgLy8gRGVjaWRlIHdoYXQgdG8gZG8gXG4gICAgICAgIGlmICghaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgcmVuZGVyR2FtZVBhZ2UoY3RybCwgZWwpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGVuZCBvZiBxdWVzdGlvblxuICAgICAgICBlbHNlIGlmKGN0cmwuVk0uZW5kUXVlc3Rpb24oKSl7XG4gICAgICAgICAgICByZW5kZXJBbnN3ZXJzT3V0KGN0cmwsIGVsKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzaG93IHRoZSBxdWVzdGlvblxuICAgICAgICBlbHNlIGlmKCFjdHJsLlZNLmdhbWVPdmVyKCkgJiYgIWN0cmwuVk0ucXVlc3Rpb25TaG93bigpKXtcbiAgICAgICAgICAgIHJlbmRlclN0YXJ0UXVlc3Rpb24oY3RybCwgZWwpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEVuZCBvZiBnYW1lIFxuICAgICAgICBlbHNlIGlmKGN0cmwuVk0uZ2FtZU92ZXIoKSkge1xuICAgICAgICAgICAgLy8gYWxlcnQoJ3Njb3JlID0gJyArIGN0cmwuVk0uY3VycmVudFNjb3JlKCkpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coY3RybC5WTS5jdXJyZW50U2NvcmUoKSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIG0oJyNnYW1lLXBhZ2UnLCBbXG4gICAgICAgIG0oJy5nYW1lLWhvbGRlcicsIHtcbiAgICAgICAgICAgIGNvbmZpZyA6IGFuaW1JblxuICAgICAgICB9LFtcbiAgICAgICAgICAgIG0oJ2hlYWRlci5nYW1lLWhlYWRlci5vdXQtdG9wLWZ1bGwnLCBbXG4gICAgICAgICAgICAgICAgdGltZXJWaWV3KGN0cmwsIGN0cmwuVk0udGltZXIoKSksXG4gICAgICAgICAgICAgICAgbSgnaDMuaW50cm8nLCAnR2V0IHJlYWR5JyksXG4gICAgICAgICAgICAgICAgbSgnaDMucXVlc3Rpb24tbnVtYmVyJywgXCJxdWVzdGlvbiBcIiArICgrY3RybC5WTS5jdXJyZW50UXVlc3Rpb24oKSArIDEpKSxcbiAgICAgICAgICAgICAgICBtKCdoMy5jdXJyZW50LXF1ZXN0aW9uLm9wYXF1ZScsIGN0cmwuVk0ucXVlc3Rpb24oKS50ZXh0KCkpLFxuICAgICAgICAgICAgICAgIG0oJ2g0LmxpbWl0Lm9wYXF1ZScsIFsnQ2hvb3NlICcsIG0oJ3NwYW4nLCBjdHJsLlZNLnF1ZXN0aW9uKCkubGltaXQoKSldKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCcuYW5zd2Vycy1hcmVhJywgW1xuICAgICAgICAgICAgICAgIG0oXCJ1bFwiLCBbXG4gICAgICAgICAgICAgICAgICAgIGN0cmwuVk0ucXVlc3Rpb24oKS5hbnN3ZXJzKCkubWFwKGZ1bmN0aW9uKGFuc3dlciwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhbnN3ZXJWaWV3KGN0cmwsIGFuc3dlcik7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pXG4gICAgICAgIF0pXG4gICAgXSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXc7IiwiLyogR2xvYmFsIG1vZHVsZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcbiAgICBfID0gcmVxdWlyZSgnbG9kYXNoJyksXG4gICAgSGFtbWVyID0gcmVxdWlyZSgnaGFtbWVyanMnKSxcbiAgICBWZWxvY2l0eSA9IHJlcXVpcmUoJ3ZlbG9jaXR5LWFuaW1hdGUnKTtcblxudmFyIExvYWRpbmcgPSBmdW5jdGlvbihjdHJsKXtcblxuICAgIHZhciBhbmltSW4gPSBmdW5jdGlvbihlbCwgaXNJbml0aWFsaXplZCwgY29udGV4dCkge1xuICAgICAgICB2YXIgc2VxdWVuY2UgPSBbXG4gICAgICAgICAgICB7IGUgOiBlbC5jaGlsZHJlblswXSwgcCA6ICd0cmFuc2l0aW9uLnNsaWRlVXBJbicsIG8gOiB7IGR1cmF0aW9uIDogMzAwLCBkZWxheSA6IDMwMCwgb3BhY2l0eSA6IDAgfSB9LFxuICAgICAgICAgICAgeyBlIDogZWwuY2hpbGRyZW5bMV0sIHAgOiAndHJhbnNpdGlvbi5zbGlkZVVwSW4nLCBvIDogeyBkdXJhdGlvbiA6IDMwMCB9IH0sXG4gICAgICAgICAgICB7IGUgOiBlbC5jaGlsZHJlblsyXSwgcCA6ICd0cmFuc2l0aW9uLmJvdW5jZUluJywgIG8gOiB7IGR1cmF0aW9uIDogMzAwIH0gfSxcbiAgICAgICAgICAgIHsgZSA6IGVsLmNoaWxkcmVuWzNdLCBwIDogeyBvcGFjaXR5IDogMSwgcm90YXRlWiA6ICctMjUnLCByaWdodCA6IC01MCB9LCBvIDogeyBkdXJhdGlvbiA6IDUwMCwgZWFzaW5nIDogWyAyNTAsIDE1IF0gfSB9XG4gICAgICAgIF07XG5cbiAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9ICdpbnRybyc7XG4gICAgICAgICAgICBWZWxvY2l0eS5SdW5TZXF1ZW5jZShzZXF1ZW5jZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBWZWxvY2l0eShlbC5jaGlsZHJlbiwgJ3RyYW5zaXRpb24uZmFkZU91dCcsIHsgc3RhZ2dlciA6ICcxMDBtcycgfSkudGhlbihjdHJsLnN0YXJ0R2FtZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGV2ZW50cyA9IGZ1bmN0aW9uKGVsLCBpc0luaXRpYWxpemVkKXtcbiAgICAgICAgaWYoIWlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgIHZhciBoYW1tZXJ0aW1lID0gbmV3IEhhbW1lcihlbCk7XG4gICAgICAgICAgICBoYW1tZXJ0aW1lLm9uKCd0YXAnLCBjdHJsLm9uQmVnaW4pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBtKCcjaW50cm8tcGFnZScsIFtcbiAgICAgICAgbSgnLmludHJvLWhvbGRlcicsIHtcbiAgICAgICAgICAgIGNvbmZpZyA6IGFuaW1JblxuICAgICAgICB9LFtcbiAgICAgICAgICAgIG0oJ2gyLm9wYXF1ZScsIGN0cmwuVk0udGl0bGUoKSksXG4gICAgICAgICAgICBtKCcuZGVzY3JpcHRpb24ub3BhcXVlJywgY3RybC5WTS5kZXNjcmlwdGlvbigpKSxcbiAgICAgICAgICAgIG0oJ2EuYmVnaW4ub3BhcXVlJywgeyBjb25maWc6IGV2ZW50cyB9LCAnYmVnaW4nKSxcbiAgICAgICAgICAgIG0oJy5icmFuZC5vcGFxdWUub3V0LXJpZ2h0LWZhcicsIHsgc3R5bGUgOiB7IGJhY2tncm91bmRJbWFnZSA6ICd1cmwoezB9KScucmVwbGFjZSgnezB9JywgY3RybC5WTS5icmFuZCgpKSB9IH0pXG4gICAgICAgIF0pXG4gICAgXSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExvYWRpbmc7IiwiLyogR2xvYmFsIG1vZHVsZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcbiAgICBWZWxvY2l0eSA9IHJlcXVpcmUoJ3ZlbG9jaXR5LWFuaW1hdGUnKTtcblxudmFyIExvYWRpbmcgPSBmdW5jdGlvbihjdHJsKXtcblxuICAgIHZhciBhbmltSW4gPSBmdW5jdGlvbihlbCwgaXNJbml0aWFsaXplZCwgY29udGV4dCkge1xuICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgIFZlbG9jaXR5KGVsLCB7IHRyYW5zbGF0ZVggOiAnKz0xMDAlJyB9LCB7IGRlbGF5IDogMjAwLCBkdXJhdGlvbiA6IDMwMCwgZWFzaW5nIDogJ2Vhc2UnIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYoY3RybC5WTS5sb2FkZWQoKSkgVmVsb2NpdHkoZWwsIFwicmV2ZXJzZVwiKS50aGVuKGN0cmwub25sb2FkZWQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBtKCcjbG9hZGluZy1wYWdlJywgW1xuICAgICAgICBtKCcubWVzc2FnZS1ob2xkZXIub3V0LWxlZnQtZnVsbCcsIHtcbiAgICAgICAgICAgIGNvbmZpZyA6IGFuaW1JblxuICAgICAgICB9LFtcbiAgICAgICAgICAgIG0oJ2gzJywgJ0xvYWRpbmcgJyArIGN0cmwuVk0ucHJvZ3Jlc3MoKSArICclJylcbiAgICAgICAgXSlcbiAgICBdKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTG9hZGluZzsiLCIvKiBHbG9iYWwgbW9kdWxlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuICAgIFZlbG9jaXR5ID0gcmVxdWlyZSgndmVsb2NpdHktYW5pbWF0ZScpO1xuXG52YXIgVmlldyA9IGZ1bmN0aW9uKGN0cmwsIHRpbWVyKXtcblxuICAgIHZhciBhbmltSW4gPSBmdW5jdGlvbihlbCwgaXNJbml0aWFsaXplZCwgY29udGV4dCkge1xuICAgICAgICBpZighdGltZXIpIHJldHVybjtcbiAgICAgICAgaWYoIXRpbWVyLmlzQWN0aXZlKCkpe1xuICAgICAgICAgICAgVmVsb2NpdHkoZWwsIHsgd2lkdGggOiAnMTAwJScgfSwgeyBkdXJhdGlvbiA6IHRpbWVyLnRpbWUoKSwgZWFzaW5nIDogJ2xpbmVhcicgfSkudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGN0cmwub25UaW1lKCk7XG4gICAgICAgICAgICAgICAgVmVsb2NpdHkoZWwsIHsgd2lkdGggOiAwIH0sICB7IGR1cmF0aW9uIDogMjAwIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aW1lci5pc0FjdGl2ZSh0cnVlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbShcIi50aW1lclwiLCB7XG4gICAgICAgIGNvbmZpZyA6IGFuaW1JblxuICAgIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3OyJdfQ==
