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
	this.VM.startGame();
};

GameController.prototype.toggle = function(ans){
	ans.selected(!ans.selected());
	ans.toggled(true);
	m.redraw();
};

GameController.prototype.onTime = function(){
    this.VM.endQuestion();
    m.redraw();
};

GameController.prototype.startQuestion = function(){
    this.VM.startQuestion();
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
	score     :0,
	title : "Beamly Comedy Special",
	description : "Can you associate the celebrities with the shows in the time limit? lets find out...",
	timer : 7,
	brands : [
		'http://img-a.zeebox.com/images/z/a5bf62ac-3e5f-46fa-9b59-59c09bc03d3e.png'
	],
	questions :[{
		question : "Which of the following appeared in the 90's sitcom Friends",
		answers  : [
			{ image : 'http://img-a.zeebox.com/images/z/ca511030-f77e-46df-a1a9-10586284a38b.png', name : 'Lisa Kudrow', correct : 1 },
			{ image : 'http://img-a.zeebox.com/images/z/b33cb262-e175-44f4-a58e-42523391fb5d.png', name : 'Matt Le Blanc', correct : 1 },
			{ image : 'http://img-a.zeebox.com/images/z/e77b6617-f543-46cb-b435-37b6b1a442d7.png', name : 'Courtney Cox-Arquette', correct : 1 },
			{ image : 'http://img-a.zeebox.com/images/z/861b18aa-152c-4ae0-9118-ffa05b79bc76.png', name : 'Wayne Knight', correct : 0 },
			{ image : 'http://img-a.zeebox.com/images/z/3a6eead3-90cc-406c-99e1-493923b3e8d0.png', name : 'Matthew Perry', correct : 1 },
			{ image : 'http://img-a.zeebox.com/images/z/40e8037e-12b2-44d3-9f84-71fe3de0bdaf.png', name : 'Michael Richards', correct : 0 },
			{ image : 'http://img-a.zeebox.com/images/z/1b59c445-8f3e-46bd-ad57-c15a73c7a68a.png', name : 'Paul Wasilewski', correct : 0 },
			{ image : 'http://img-a.zeebox.com/images/z/4bc0776e-1cf8-4b12-881b-f7154343dbe4.png', name : 'Jennifer Aniston', correct : 1 },
			{ image : 'http://img-a.zeebox.com/images/z/b3f91a63-e987-4ea7-81ab-586f930610ae.png', name : 'Jason Alexander', correct : 1 }
		]
	},
	{
		question : "What about Seinfeld",
		answers  : [
			{ image : 'http://img-a.zeebox.com/images/z/21d9a055-b1c6-4d4d-a4b6-51319fc65165.png', name : 'David Schwimmer', correct : 0 },
			{ image : 'http://img-a.zeebox.com/images/z/ca511030-f77e-46df-a1a9-10586284a38b.png', name : 'Lisa Kudrow', correct : 0 },
			{ image : 'http://img-a.zeebox.com/images/z/b33cb262-e175-44f4-a58e-42523391fb5d.png', name : 'Matt Le Blanc', correct : 0 },
			{ image : 'http://img-a.zeebox.com/images/z/e77b6617-f543-46cb-b435-37b6b1a442d7.png', name : 'Courtney Cox-Arquette', correct : 0 },
			{ image : 'http://img-a.zeebox.com/images/z/861b18aa-152c-4ae0-9118-ffa05b79bc76.png', name : 'Wayne Knight', correct : 1 },
			{ image : 'http://img-a.zeebox.com/images/z/3a6eead3-90cc-406c-99e1-493923b3e8d0.png', name : 'Matthew Perry', correct : 0 },
			{ image : 'http://img-a.zeebox.com/images/z/40e8037e-12b2-44d3-9f84-71fe3de0bdaf.png', name : 'Michael Richards', correct : 1 },
			{ image : 'http://img-a.zeebox.com/images/z/1b59c445-8f3e-46bd-ad57-c15a73c7a68a.png', name : 'Paul Wasilewski', correct : 0 },
			{ image : 'http://img-a.zeebox.com/images/z/b3f91a63-e987-4ea7-81ab-586f930610ae.png', name : 'Jason Alexander', correct : 1 }
		]
	}],
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
    this.toggled = m.prop(false);
};

var Question = function(d){
    this.text = m.prop(d.question);
    this.answers = m.prop(_.map(d.answers, function(a){
        return new Answer(a);
    }));
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

var _setCurrentQuestion = function(){
    var q = new Question(this.questions()[this.currentQuestion()]);
    this.question(q);
    m.redraw();
};

var _nextQuestion = function(){
    var current = this.currentQuestion() + 1,
        isEnd = current === this.totalQuestions();

    this.gameOver(isEnd);
    if(! isEnd) {
        this.currentQuestion(current);
        _setCurrentQuestion.call();
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
    setTimeout(_setCurrentQuestion.bind(this), 2000);
};

GameVM.prototype.endQuestion = function(){
    this.endQuestion = m.prop(true);
};

GameVM.prototype.startQuestion = function(){
    this.timer(new Timer(GameModel.timer()));
    m.redraw();
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
        if (isInitialized && answer.toggled()) {
            el.classList.toggle('selected');
            Velocity(el, 'callout.pulse', { duration : 400 });
            answer.toggled(false);
        } else if(!isInitialized){
            var hammertime = new Hammer(el);
            hammertime.on('tap', ctrl.toggle.bind(this, answer));
        }
    };

    return m("li.opaque", {
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
        ctrl.VM.startGame();
    });
};

var renderQuestionUp = function(ctrl, el){
    var target = document.getElementsByClassName('question-number'),
        question = document.getElementsByClassName('current-question');

    Velocity(target, {
        left : '50px',
        top : '20px',
        fontSize : '0.9rem'
    }).then(function(){
        Velocity(question, 'transition.slideUpIn').then(ctrl.startQuestion.bind(ctrl));
    });
};

var renderAnswers = function(ctrl, el){
    // Velocity
};

var renderStartQuestion = function(ctrl, el){
    // Show the questions
    el.children[0].className += ' begin';

    // get answers and remove weird init style
    var answers = document.getElementsByClassName('answers-area')[0];
    answers.style.opacity = 1;
    answers.style.display = 'block';
    
    // Show the answers
    var ul = answers.children[0];
    Velocity(ul.children, 'transition.bounceIn', { stagger : '200ms' }).then(function(){
        renderQuestionUp(ctrl, el);
    });
    ctrl.VM.questionShown(true);
};

var View = function(ctrl){
    var animIn = function(el, isInitialized, context) {
        // Decide what to do 
        if (!isInitialized) {
            renderGamePage(ctrl, el);
        } else if(ctrl.VM.endQuestion()){

        }
        else if(!ctrl.VM.gameOver() && !ctrl.VM.questionShown()){
            renderStartQuestion(ctrl, el);
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
                m('h3.current-question.opaque', ctrl.VM.question().text())
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9tYWluLmpzIiwibm9kZV9tb2R1bGVzL3ZlbG9jaXR5LWFuaW1hdGUvdmVsb2NpdHkudWkuanMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVycy9nYW1lLWNvbnRyb2xsZXIuanMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVycy9pbnRyby1jb250cm9sbGVyLmpzIiwic3JjL3NjcmlwdHMvY29udHJvbGxlcnMvbG9hZGluZy1jb250cm9sbGVyLmpzIiwic3JjL3NjcmlwdHMvbGlicy9hcHAuanMiLCJzcmMvc2NyaXB0cy9tb2RlbHMvZ2FtZS1tb2RlbC5qcyIsInNyYy9zY3JpcHRzL21vZGVscy9nYW1lLXZtLmpzIiwic3JjL3NjcmlwdHMvbW9kZWxzL2ludHJvLXZtLmpzIiwic3JjL3NjcmlwdHMvbW9kZWxzL2xvYWRpbmctdm0uanMiLCJzcmMvc2NyaXB0cy92aWV3cy9hbnN3ZXItdmlldy5qcyIsInNyYy9zY3JpcHRzL3ZpZXdzL2dhbWUtdmlldy5qcyIsInNyYy9zY3JpcHRzL3ZpZXdzL2ludHJvLXZpZXcuanMiLCJzcmMvc2NyaXB0cy92aWV3cy9sb2FkaW5nLXZpZXcuanMiLCJzcmMvc2NyaXB0cy92aWV3cy90aW1lci12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6dkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIEFwcCA9IHJlcXVpcmUoJy4vbGlicy9hcHAuanMnKTtcblxud2luZG93LndpZGdldFZlcnNpb24gPSBcInYwLjAuMFwiO1xuXG52YXIgaW5pdEFwcCA9IGZ1bmN0aW9uKHBhcmFtcyl7XG5cdHZhciBpbnN0YW5jZSA9IG5ldyBBcHAoKTtcbn07XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZ1bmN0aW9uKGV2ZW50KXtcbiAgIC8vZG8gd29ya1xuICAgaW5pdEFwcCgpO1xufSk7XG4iLCIvKioqKioqKioqKioqKioqKioqKioqKlxuICAgVmVsb2NpdHkgVUkgUGFja1xuKioqKioqKioqKioqKioqKioqKioqKi9cblxuLyogVmVsb2NpdHlKUy5vcmcgVUkgUGFjayAoNS4wLjQpLiAoQykgMjAxNCBKdWxpYW4gU2hhcGlyby4gTUlUIEBsaWNlbnNlOiBlbi53aWtpcGVkaWEub3JnL3dpa2kvTUlUX0xpY2Vuc2UuIFBvcnRpb25zIGNvcHlyaWdodCBEYW5pZWwgRWRlbiwgQ2hyaXN0aWFuIFB1Y2NpLiAqL1xuXG47KGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgLyogQ29tbW9uSlMgbW9kdWxlLiAqL1xuICAgIGlmICh0eXBlb2YgcmVxdWlyZSA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBleHBvcnRzID09PSBcIm9iamVjdFwiICkge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgICAvKiBBTUQgbW9kdWxlLiAqL1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsgXCJ2ZWxvY2l0eVwiIF0sIGZhY3RvcnkpO1xuICAgIC8qIEJyb3dzZXIgZ2xvYmFscy4gKi9cbiAgICB9IGVsc2Uge1xuICAgICAgICBmYWN0b3J5KCk7XG4gICAgfVxufShmdW5jdGlvbigpIHtcbnJldHVybiBmdW5jdGlvbiAoZ2xvYmFsLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcblxuICAgIC8qKioqKioqKioqKioqXG4gICAgICAgIENoZWNrc1xuICAgICoqKioqKioqKioqKiovXG5cbiAgICBpZiAoIWdsb2JhbC5WZWxvY2l0eSB8fCAhZ2xvYmFsLlZlbG9jaXR5LlV0aWxpdGllcykge1xuICAgICAgICB3aW5kb3cuY29uc29sZSAmJiBjb25zb2xlLmxvZyhcIlZlbG9jaXR5IFVJIFBhY2s6IFZlbG9jaXR5IG11c3QgYmUgbG9hZGVkIGZpcnN0LiBBYm9ydGluZy5cIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgVmVsb2NpdHkgPSBnbG9iYWwuVmVsb2NpdHksXG4gICAgICAgICAgICAkID0gVmVsb2NpdHkuVXRpbGl0aWVzO1xuICAgIH1cblxuICAgIHZhciB2ZWxvY2l0eVZlcnNpb24gPSBWZWxvY2l0eS52ZXJzaW9uLFxuICAgICAgICByZXF1aXJlZFZlcnNpb24gPSB7IG1ham9yOiAxLCBtaW5vcjogMSwgcGF0Y2g6IDAgfTtcblxuICAgIGZ1bmN0aW9uIGdyZWF0ZXJTZW12ZXIgKHByaW1hcnksIHNlY29uZGFyeSkge1xuICAgICAgICB2YXIgdmVyc2lvbkludHMgPSBbXTtcblxuICAgICAgICBpZiAoIXByaW1hcnkgfHwgIXNlY29uZGFyeSkgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgICAgICAkLmVhY2goWyBwcmltYXJ5LCBzZWNvbmRhcnkgXSwgZnVuY3Rpb24oaSwgdmVyc2lvbk9iamVjdCkge1xuICAgICAgICAgICAgdmFyIHZlcnNpb25JbnRzQ29tcG9uZW50cyA9IFtdO1xuXG4gICAgICAgICAgICAkLmVhY2godmVyc2lvbk9iamVjdCwgZnVuY3Rpb24oY29tcG9uZW50LCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHdoaWxlICh2YWx1ZS50b1N0cmluZygpLmxlbmd0aCA8IDUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBcIjBcIiArIHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2ZXJzaW9uSW50c0NvbXBvbmVudHMucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmVyc2lvbkludHMucHVzaCh2ZXJzaW9uSW50c0NvbXBvbmVudHMuam9pbihcIlwiKSlcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIChwYXJzZUZsb2F0KHZlcnNpb25JbnRzWzBdKSA+IHBhcnNlRmxvYXQodmVyc2lvbkludHNbMV0pKTtcbiAgICB9XG5cbiAgICBpZiAoZ3JlYXRlclNlbXZlcihyZXF1aXJlZFZlcnNpb24sIHZlbG9jaXR5VmVyc2lvbikpe1xuICAgICAgICB2YXIgYWJvcnRFcnJvciA9IFwiVmVsb2NpdHkgVUkgUGFjazogWW91IG5lZWQgdG8gdXBkYXRlIFZlbG9jaXR5IChqcXVlcnkudmVsb2NpdHkuanMpIHRvIGEgbmV3ZXIgdmVyc2lvbi4gVmlzaXQgaHR0cDovL2dpdGh1Yi5jb20vanVsaWFuc2hhcGlyby92ZWxvY2l0eS5cIjtcbiAgICAgICAgYWxlcnQoYWJvcnRFcnJvcik7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihhYm9ydEVycm9yKTtcbiAgICB9XG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgRWZmZWN0IFJlZ2lzdHJhdGlvblxuICAgICoqKioqKioqKioqKioqKioqKioqKioqKi9cblxuICAgIC8qIE5vdGU6IFJlZ2lzdGVyVUkgaXMgYSBsZWdhY3kgbmFtZS4gKi9cbiAgICBWZWxvY2l0eS5SZWdpc3RlckVmZmVjdCA9IFZlbG9jaXR5LlJlZ2lzdGVyVUkgPSBmdW5jdGlvbiAoZWZmZWN0TmFtZSwgcHJvcGVydGllcykge1xuICAgICAgICAvKiBBbmltYXRlIHRoZSBleHBhbnNpb24vY29udHJhY3Rpb24gb2YgdGhlIGVsZW1lbnRzJyBwYXJlbnQncyBoZWlnaHQgZm9yIEluL091dCBlZmZlY3RzLiAqL1xuICAgICAgICBmdW5jdGlvbiBhbmltYXRlUGFyZW50SGVpZ2h0IChlbGVtZW50cywgZGlyZWN0aW9uLCB0b3RhbER1cmF0aW9uLCBzdGFnZ2VyKSB7XG4gICAgICAgICAgICB2YXIgdG90YWxIZWlnaHREZWx0YSA9IDAsXG4gICAgICAgICAgICAgICAgcGFyZW50Tm9kZTtcblxuICAgICAgICAgICAgLyogU3VtIHRoZSB0b3RhbCBoZWlnaHQgKGluY2x1ZGluZyBwYWRkaW5nIGFuZCBtYXJnaW4pIG9mIGFsbCB0YXJnZXRlZCBlbGVtZW50cy4gKi9cbiAgICAgICAgICAgICQuZWFjaChlbGVtZW50cy5ub2RlVHlwZSA/IFsgZWxlbWVudHMgXSA6IGVsZW1lbnRzLCBmdW5jdGlvbihpLCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKHN0YWdnZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgLyogSW5jcmVhc2UgdGhlIHRvdGFsRHVyYXRpb24gYnkgdGhlIHN1Y2Nlc3NpdmUgZGVsYXkgYW1vdW50cyBwcm9kdWNlZCBieSB0aGUgc3RhZ2dlciBvcHRpb24uICovXG4gICAgICAgICAgICAgICAgICAgIHRvdGFsRHVyYXRpb24gKz0gaSAqIHN0YWdnZXI7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcGFyZW50Tm9kZSA9IGVsZW1lbnQucGFyZW50Tm9kZTtcblxuICAgICAgICAgICAgICAgICQuZWFjaChbIFwiaGVpZ2h0XCIsIFwicGFkZGluZ1RvcFwiLCBcInBhZGRpbmdCb3R0b21cIiwgXCJtYXJnaW5Ub3BcIiwgXCJtYXJnaW5Cb3R0b21cIl0sIGZ1bmN0aW9uKGksIHByb3BlcnR5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsSGVpZ2h0RGVsdGEgKz0gcGFyc2VGbG9hdChWZWxvY2l0eS5DU1MuZ2V0UHJvcGVydHlWYWx1ZShlbGVtZW50LCBwcm9wZXJ0eSkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qIEFuaW1hdGUgdGhlIHBhcmVudCBlbGVtZW50J3MgaGVpZ2h0IGFkanVzdG1lbnQgKHdpdGggYSB2YXJ5aW5nIGR1cmF0aW9uIG11bHRpcGxpZXIgZm9yIGFlc3RoZXRpYyBiZW5lZml0cykuICovXG4gICAgICAgICAgICBWZWxvY2l0eS5hbmltYXRlKFxuICAgICAgICAgICAgICAgIHBhcmVudE5vZGUsXG4gICAgICAgICAgICAgICAgeyBoZWlnaHQ6IChkaXJlY3Rpb24gPT09IFwiSW5cIiA/IFwiK1wiIDogXCItXCIpICsgXCI9XCIgKyB0b3RhbEhlaWdodERlbHRhIH0sXG4gICAgICAgICAgICAgICAgeyBxdWV1ZTogZmFsc2UsIGVhc2luZzogXCJlYXNlLWluLW91dFwiLCBkdXJhdGlvbjogdG90YWxEdXJhdGlvbiAqIChkaXJlY3Rpb24gPT09IFwiSW5cIiA/IDAuNiA6IDEpIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBSZWdpc3RlciBhIGN1c3RvbSByZWRpcmVjdCBmb3IgZWFjaCBlZmZlY3QuICovXG4gICAgICAgIFZlbG9jaXR5LlJlZGlyZWN0c1tlZmZlY3ROYW1lXSA9IGZ1bmN0aW9uIChlbGVtZW50LCByZWRpcmVjdE9wdGlvbnMsIGVsZW1lbnRzSW5kZXgsIGVsZW1lbnRzU2l6ZSwgZWxlbWVudHMsIHByb21pc2VEYXRhKSB7XG4gICAgICAgICAgICB2YXIgZmluYWxFbGVtZW50ID0gKGVsZW1lbnRzSW5kZXggPT09IGVsZW1lbnRzU2l6ZSAtIDEpO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHByb3BlcnRpZXMuZGVmYXVsdER1cmF0aW9uID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLmRlZmF1bHREdXJhdGlvbiA9IHByb3BlcnRpZXMuZGVmYXVsdER1cmF0aW9uLmNhbGwoZWxlbWVudHMsIGVsZW1lbnRzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcHJvcGVydGllcy5kZWZhdWx0RHVyYXRpb24gPSBwYXJzZUZsb2F0KHByb3BlcnRpZXMuZGVmYXVsdER1cmF0aW9uKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogSXRlcmF0ZSB0aHJvdWdoIGVhY2ggZWZmZWN0J3MgY2FsbCBhcnJheS4gKi9cbiAgICAgICAgICAgIGZvciAodmFyIGNhbGxJbmRleCA9IDA7IGNhbGxJbmRleCA8IHByb3BlcnRpZXMuY2FsbHMubGVuZ3RoOyBjYWxsSW5kZXgrKykge1xuICAgICAgICAgICAgICAgIHZhciBjYWxsID0gcHJvcGVydGllcy5jYWxsc1tjYWxsSW5kZXhdLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU1hcCA9IGNhbGxbMF0sXG4gICAgICAgICAgICAgICAgICAgIHJlZGlyZWN0RHVyYXRpb24gPSAocmVkaXJlY3RPcHRpb25zLmR1cmF0aW9uIHx8IHByb3BlcnRpZXMuZGVmYXVsdER1cmF0aW9uIHx8IDEwMDApLFxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvblBlcmNlbnRhZ2UgPSBjYWxsWzFdLFxuICAgICAgICAgICAgICAgICAgICBjYWxsT3B0aW9ucyA9IGNhbGxbMl0gfHwge30sXG4gICAgICAgICAgICAgICAgICAgIG9wdHMgPSB7fTtcblxuICAgICAgICAgICAgICAgIC8qIEFzc2lnbiB0aGUgd2hpdGVsaXN0ZWQgcGVyLWNhbGwgb3B0aW9ucy4gKi9cbiAgICAgICAgICAgICAgICBvcHRzLmR1cmF0aW9uID0gcmVkaXJlY3REdXJhdGlvbiAqIChkdXJhdGlvblBlcmNlbnRhZ2UgfHwgMSk7XG4gICAgICAgICAgICAgICAgb3B0cy5xdWV1ZSA9IHJlZGlyZWN0T3B0aW9ucy5xdWV1ZSB8fCBcIlwiO1xuICAgICAgICAgICAgICAgIG9wdHMuZWFzaW5nID0gY2FsbE9wdGlvbnMuZWFzaW5nIHx8IFwiZWFzZVwiO1xuICAgICAgICAgICAgICAgIG9wdHMuZGVsYXkgPSBwYXJzZUZsb2F0KGNhbGxPcHRpb25zLmRlbGF5KSB8fCAwO1xuICAgICAgICAgICAgICAgIG9wdHMuX2NhY2hlVmFsdWVzID0gY2FsbE9wdGlvbnMuX2NhY2hlVmFsdWVzIHx8IHRydWU7XG5cbiAgICAgICAgICAgICAgICAvKiBTcGVjaWFsIHByb2Nlc3NpbmcgZm9yIHRoZSBmaXJzdCBlZmZlY3QgY2FsbC4gKi9cbiAgICAgICAgICAgICAgICBpZiAoY2FsbEluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qIElmIGEgZGVsYXkgd2FzIHBhc3NlZCBpbnRvIHRoZSByZWRpcmVjdCwgY29tYmluZSBpdCB3aXRoIHRoZSBmaXJzdCBjYWxsJ3MgZGVsYXkuICovXG4gICAgICAgICAgICAgICAgICAgIG9wdHMuZGVsYXkgKz0gKHBhcnNlRmxvYXQocmVkaXJlY3RPcHRpb25zLmRlbGF5KSB8fCAwKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudHNJbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0cy5iZWdpbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIE9ubHkgdHJpZ2dlciBhIGJlZ2luIGNhbGxiYWNrIG9uIHRoZSBmaXJzdCBlZmZlY3QgY2FsbCB3aXRoIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZSBzZXQuICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVkaXJlY3RPcHRpb25zLmJlZ2luICYmIHJlZGlyZWN0T3B0aW9ucy5iZWdpbi5jYWxsKGVsZW1lbnRzLCBlbGVtZW50cyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGlyZWN0aW9uID0gZWZmZWN0TmFtZS5tYXRjaCgvKElufE91dCkkLyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBNYWtlIFwiaW5cIiB0cmFuc2l0aW9uaW5nIGVsZW1lbnRzIGludmlzaWJsZSBpbW1lZGlhdGVseSBzbyB0aGF0IHRoZXJlJ3Mgbm8gRk9VQyBiZXR3ZWVuIG5vd1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZCB0aGUgZmlyc3QgUkFGIHRpY2suICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKChkaXJlY3Rpb24gJiYgZGlyZWN0aW9uWzBdID09PSBcIkluXCIpICYmIHByb3BlcnR5TWFwLm9wYWNpdHkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkLmVhY2goZWxlbWVudHMubm9kZVR5cGUgPyBbIGVsZW1lbnRzIF0gOiBlbGVtZW50cywgZnVuY3Rpb24oaSwgZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVmVsb2NpdHkuQ1NTLnNldFByb3BlcnR5VmFsdWUoZWxlbWVudCwgXCJvcGFjaXR5XCIsIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBPbmx5IHRyaWdnZXIgYW5pbWF0ZVBhcmVudEhlaWdodCgpIGlmIHdlJ3JlIHVzaW5nIGFuIEluL091dCB0cmFuc2l0aW9uLiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZWRpcmVjdE9wdGlvbnMuYW5pbWF0ZVBhcmVudEhlaWdodCAmJiBkaXJlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZVBhcmVudEhlaWdodChlbGVtZW50cywgZGlyZWN0aW9uWzBdLCByZWRpcmVjdER1cmF0aW9uICsgb3B0cy5kZWxheSwgcmVkaXJlY3RPcHRpb25zLnN0YWdnZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8qIElmIHRoZSB1c2VyIGlzbid0IG92ZXJyaWRpbmcgdGhlIGRpc3BsYXkgb3B0aW9uLCBkZWZhdWx0IHRvIFwiYXV0b1wiIGZvciBcIkluXCItc3VmZml4ZWQgdHJhbnNpdGlvbnMuICovXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWRpcmVjdE9wdGlvbnMuZGlzcGxheSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlZGlyZWN0T3B0aW9ucy5kaXNwbGF5ICE9PSB1bmRlZmluZWQgJiYgcmVkaXJlY3RPcHRpb25zLmRpc3BsYXkgIT09IFwibm9uZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0cy5kaXNwbGF5ID0gcmVkaXJlY3RPcHRpb25zLmRpc3BsYXk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKC9JbiQvLnRlc3QoZWZmZWN0TmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBJbmxpbmUgZWxlbWVudHMgY2Fubm90IGJlIHN1YmplY3RlZCB0byB0cmFuc2Zvcm1zLCBzbyB3ZSBzd2l0Y2ggdGhlbSB0byBpbmxpbmUtYmxvY2suICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRlZmF1bHREaXNwbGF5ID0gVmVsb2NpdHkuQ1NTLlZhbHVlcy5nZXREaXNwbGF5VHlwZShlbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRzLmRpc3BsYXkgPSAoZGVmYXVsdERpc3BsYXkgPT09IFwiaW5saW5lXCIpID8gXCJpbmxpbmUtYmxvY2tcIiA6IGRlZmF1bHREaXNwbGF5O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlZGlyZWN0T3B0aW9ucy52aXNpYmlsaXR5ICYmIHJlZGlyZWN0T3B0aW9ucy52aXNpYmlsaXR5ICE9PSBcImhpZGRlblwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRzLnZpc2liaWxpdHkgPSByZWRpcmVjdE9wdGlvbnMudmlzaWJpbGl0eTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8qIFNwZWNpYWwgcHJvY2Vzc2luZyBmb3IgdGhlIGxhc3QgZWZmZWN0IGNhbGwuICovXG4gICAgICAgICAgICAgICAgaWYgKGNhbGxJbmRleCA9PT0gcHJvcGVydGllcy5jYWxscy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qIEFwcGVuZCBwcm9taXNlIHJlc29sdmluZyBvbnRvIHRoZSB1c2VyJ3MgcmVkaXJlY3QgY2FsbGJhY2suICovXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGluamVjdEZpbmFsQ2FsbGJhY2tzICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgocmVkaXJlY3RPcHRpb25zLmRpc3BsYXkgPT09IHVuZGVmaW5lZCB8fCByZWRpcmVjdE9wdGlvbnMuZGlzcGxheSA9PT0gXCJub25lXCIpICYmIC9PdXQkLy50ZXN0KGVmZmVjdE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJC5lYWNoKGVsZW1lbnRzLm5vZGVUeXBlID8gWyBlbGVtZW50cyBdIDogZWxlbWVudHMsIGZ1bmN0aW9uKGksIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVmVsb2NpdHkuQ1NTLnNldFByb3BlcnR5VmFsdWUoZWxlbWVudCwgXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcmVkaXJlY3RPcHRpb25zLmNvbXBsZXRlICYmIHJlZGlyZWN0T3B0aW9ucy5jb21wbGV0ZS5jYWxsKGVsZW1lbnRzLCBlbGVtZW50cyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9taXNlRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2VEYXRhLnJlc29sdmVyKGVsZW1lbnRzIHx8IGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgb3B0cy5jb21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BlcnRpZXMucmVzZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciByZXNldFByb3BlcnR5IGluIHByb3BlcnRpZXMucmVzZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc2V0VmFsdWUgPSBwcm9wZXJ0aWVzLnJlc2V0W3Jlc2V0UHJvcGVydHldO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIEZvcm1hdCBlYWNoIG5vbi1hcnJheSB2YWx1ZSBpbiB0aGUgcmVzZXQgcHJvcGVydHkgbWFwIHRvIFsgdmFsdWUsIHZhbHVlIF0gc28gdGhhdCBjaGFuZ2VzIGFwcGx5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltbWVkaWF0ZWx5IGFuZCBET00gcXVlcnlpbmcgaXMgYXZvaWRlZCAodmlhIGZvcmNlZmVlZGluZykuICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIE5vdGU6IERvbid0IGZvcmNlZmVlZCBob29rcywgb3RoZXJ3aXNlIHRoZWlyIGhvb2sgcm9vdHMgd2lsbCBiZSBkZWZhdWx0ZWQgdG8gdGhlaXIgbnVsbCB2YWx1ZXMuICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChWZWxvY2l0eS5DU1MuSG9va3MucmVnaXN0ZXJlZFtyZXNldFByb3BlcnR5XSA9PT0gdW5kZWZpbmVkICYmICh0eXBlb2YgcmVzZXRWYWx1ZSA9PT0gXCJzdHJpbmdcIiB8fCB0eXBlb2YgcmVzZXRWYWx1ZSA9PT0gXCJudW1iZXJcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXMucmVzZXRbcmVzZXRQcm9wZXJ0eV0gPSBbIHByb3BlcnRpZXMucmVzZXRbcmVzZXRQcm9wZXJ0eV0sIHByb3BlcnRpZXMucmVzZXRbcmVzZXRQcm9wZXJ0eV0gXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIFNvIHRoYXQgdGhlIHJlc2V0IHZhbHVlcyBhcmUgYXBwbGllZCBpbnN0YW50bHkgdXBvbiB0aGUgbmV4dCByQUYgdGljaywgdXNlIGEgemVybyBkdXJhdGlvbiBhbmQgcGFyYWxsZWwgcXVldWVpbmcuICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc2V0T3B0aW9ucyA9IHsgZHVyYXRpb246IDAsIHF1ZXVlOiBmYWxzZSB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogU2luY2UgdGhlIHJlc2V0IG9wdGlvbiB1c2VzIHVwIHRoZSBjb21wbGV0ZSBjYWxsYmFjaywgd2UgdHJpZ2dlciB0aGUgdXNlcidzIGNvbXBsZXRlIGNhbGxiYWNrIGF0IHRoZSBlbmQgb2Ygb3Vycy4gKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmluYWxFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0T3B0aW9ucy5jb21wbGV0ZSA9IGluamVjdEZpbmFsQ2FsbGJhY2tzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFZlbG9jaXR5LmFuaW1hdGUoZWxlbWVudCwgcHJvcGVydGllcy5yZXNldCwgcmVzZXRPcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIE9ubHkgdHJpZ2dlciB0aGUgdXNlcidzIGNvbXBsZXRlIGNhbGxiYWNrIG9uIHRoZSBsYXN0IGVmZmVjdCBjYWxsIHdpdGggdGhlIGxhc3QgZWxlbWVudCBpbiB0aGUgc2V0LiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChmaW5hbEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmplY3RGaW5hbENhbGxiYWNrcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWRpcmVjdE9wdGlvbnMudmlzaWJpbGl0eSA9PT0gXCJoaWRkZW5cIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0cy52aXNpYmlsaXR5ID0gcmVkaXJlY3RPcHRpb25zLnZpc2liaWxpdHk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBWZWxvY2l0eS5hbmltYXRlKGVsZW1lbnQsIHByb3BlcnR5TWFwLCBvcHRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvKiBSZXR1cm4gdGhlIFZlbG9jaXR5IG9iamVjdCBzbyB0aGF0IFJlZ2lzdGVyVUkgY2FsbHMgY2FuIGJlIGNoYWluZWQuICovXG4gICAgICAgIHJldHVybiBWZWxvY2l0eTtcbiAgICB9O1xuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKlxuICAgICAgIFBhY2thZ2VkIEVmZmVjdHNcbiAgICAqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgICAvKiBFeHRlcm5hbGl6ZSB0aGUgcGFja2FnZWRFZmZlY3RzIGRhdGEgc28gdGhhdCB0aGV5IGNhbiBvcHRpb25hbGx5IGJlIG1vZGlmaWVkIGFuZCByZS1yZWdpc3RlcmVkLiAqL1xuICAgIC8qIFN1cHBvcnQ6IDw9SUU4OiBDYWxsb3V0cyB3aWxsIGhhdmUgbm8gZWZmZWN0LCBhbmQgdHJhbnNpdGlvbnMgd2lsbCBzaW1wbHkgZmFkZSBpbi9vdXQuIElFOS9BbmRyb2lkIDIuMzogTW9zdCBlZmZlY3RzIGFyZSBmdWxseSBzdXBwb3J0ZWQsIHRoZSByZXN0IGZhZGUgaW4vb3V0LiBBbGwgb3RoZXIgYnJvd3NlcnM6IGZ1bGwgc3VwcG9ydC4gKi9cbiAgICBWZWxvY2l0eS5SZWdpc3RlckVmZmVjdC5wYWNrYWdlZEVmZmVjdHMgPVxuICAgICAgICB7XG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJjYWxsb3V0LmJvdW5jZVwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA1NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVk6IC0zMCB9LCAwLjI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVZOiAwIH0sIDAuMTI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVZOiAtMTUgfSwgMC4xMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVk6IDAgfSwgMC4yNSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcImNhbGxvdXQuc2hha2VcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVYOiAtMTEgfSwgMC4xMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVg6IDExIH0sIDAuMTI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVYOiAtMTEgfSwgMC4xMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVg6IDExIH0sIDAuMTI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVYOiAtMTEgfSwgMC4xMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVg6IDExIH0sIDAuMTI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVYOiAtMTEgfSwgMC4xMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVg6IDAgfSwgMC4xMjUgXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJjYWxsb3V0LmZsYXNoXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDExMDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgXCJlYXNlSW5PdXRRdWFkXCIsIDEgXSB9LCAwLjI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIFwiZWFzZUluT3V0UXVhZFwiIF0gfSwgMC4yNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCBcImVhc2VJbk91dFF1YWRcIiBdIH0sIDAuMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgXCJlYXNlSW5PdXRRdWFkXCIgXSB9LCAwLjI1IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwiY2FsbG91dC5wdWxzZVwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MjUsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IHNjYWxlWDogMS4xLCBzY2FsZVk6IDEuMSB9LCAwLjUwLCB7IGVhc2luZzogXCJlYXNlSW5FeHBvXCIgfSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgc2NhbGVYOiAxLCBzY2FsZVk6IDEgfSwgMC41MCBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcImNhbGxvdXQuc3dpbmdcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogOTUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyByb3RhdGVaOiAxNSB9LCAwLjIwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyByb3RhdGVaOiAtMTAgfSwgMC4yMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgcm90YXRlWjogNSB9LCAwLjIwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyByb3RhdGVaOiAtNSB9LCAwLjIwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyByb3RhdGVaOiAwIH0sIDAuMjAgXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJjYWxsb3V0LnRhZGFcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogMTAwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgc2NhbGVYOiAwLjksIHNjYWxlWTogMC45LCByb3RhdGVaOiAtMyB9LCAwLjEwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBzY2FsZVg6IDEuMSwgc2NhbGVZOiAxLjEsIHJvdGF0ZVo6IDMgfSwgMC4xMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgc2NhbGVYOiAxLjEsIHNjYWxlWTogMS4xLCByb3RhdGVaOiAtMyB9LCAwLjEwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgXCJyZXZlcnNlXCIsIDAuMTI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgXCJyZXZlcnNlXCIsIDAuMTI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgXCJyZXZlcnNlXCIsIDAuMTI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgXCJyZXZlcnNlXCIsIDAuMTI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgXCJyZXZlcnNlXCIsIDAuMTI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBzY2FsZVg6IDEsIHNjYWxlWTogMSwgcm90YXRlWjogMCB9LCAwLjIwIF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmZhZGVJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA1MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdIH0gXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uZmFkZU91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA1MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdIH0gXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmZsaXBYSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNzAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgODAwLCA4MDAgXSwgcm90YXRlWTogWyAwLCAtNTUgXSB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmZsaXBYT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDcwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDgwMCwgODAwIF0sIHJvdGF0ZVk6IDU1IH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAsIHJvdGF0ZVk6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uZmxpcFlJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyA4MDAsIDgwMCBdLCByb3RhdGVYOiBbIDAsIC00NSBdIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uZmxpcFlPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgODAwLCA4MDAgXSwgcm90YXRlWDogMjUgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCwgcm90YXRlWDogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uZmxpcEJvdW5jZVhJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA5MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMC43MjUsIDAgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgNDAwLCA0MDAgXSwgcm90YXRlWTogWyAtMTAsIDkwIF0gfSwgMC41MCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogMC44MCwgcm90YXRlWTogMTAgfSwgMC4yNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogMSwgcm90YXRlWTogMCB9LCAwLjI1IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5mbGlwQm91bmNlWE91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMC45LCAxIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDQwMCwgNDAwIF0sIHJvdGF0ZVk6IC0xMCB9LCAwLjUwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiAwLCByb3RhdGVZOiA5MCB9LCAwLjUwIF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwLCByb3RhdGVZOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5mbGlwQm91bmNlWUluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDg1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLjcyNSwgMCBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyA0MDAsIDQwMCBdLCByb3RhdGVYOiBbIC0xMCwgOTAgXSB9LCAwLjUwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiAwLjgwLCByb3RhdGVYOiAxMCB9LCAwLjI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiAxLCByb3RhdGVYOiAwIH0sIDAuMjUgXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmZsaXBCb3VuY2VZT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLjksIDEgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgNDAwLCA0MDAgXSwgcm90YXRlWDogLTE1IH0sIDAuNTAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IDAsIHJvdGF0ZVg6IDkwIH0sIDAuNTAgXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAsIHJvdGF0ZVg6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIE1hZ2ljLmNzcyAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnN3b29wSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyBcIjEwMCVcIiwgXCI1MCVcIiBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIFwiMTAwJVwiLCBcIjEwMCVcIiBdLCBzY2FsZVg6IFsgMSwgMCBdLCBzY2FsZVk6IFsgMSwgMCBdLCB0cmFuc2xhdGVYOiBbIDAsIC03MDAgXSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybU9yaWdpblg6IFwiNTAlXCIsIHRyYW5zZm9ybU9yaWdpblk6IFwiNTAlXCIgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIE1hZ2ljLmNzcyAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnN3b29wT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDg1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgXCI1MCVcIiwgXCIxMDAlXCIgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyBcIjEwMCVcIiwgXCIxMDAlXCIgXSwgc2NhbGVYOiAwLCBzY2FsZVk6IDAsIHRyYW5zbGF0ZVg6IC03MDAsIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1PcmlnaW5YOiBcIjUwJVwiLCB0cmFuc2Zvcm1PcmlnaW5ZOiBcIjUwJVwiLCBzY2FsZVg6IDEsIHNjYWxlWTogMSwgdHJhbnNsYXRlWDogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogTWFnaWMuY3NzICovXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMuIChGYWRlcyBhbmQgc2NhbGVzIG9ubHkuKSAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLndoaXJsSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyBcIjUwJVwiLCBcIjUwJVwiIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgXCI1MCVcIiwgXCI1MCVcIiBdLCBzY2FsZVg6IFsgMSwgMCBdLCBzY2FsZVk6IFsgMSwgMCBdLCByb3RhdGVZOiBbIDAsIDE2MCBdIH0sIDEsIHsgZWFzaW5nOiBcImVhc2VJbk91dFNpbmVcIiB9IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogTWFnaWMuY3NzICovXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMuIChGYWRlcyBhbmQgc2NhbGVzIG9ubHkuKSAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLndoaXJsT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDc1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCBcImVhc2VJbk91dFF1aW50XCIsIDEgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyBcIjUwJVwiLCBcIjUwJVwiIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgXCI1MCVcIiwgXCI1MCVcIiBdLCBzY2FsZVg6IDAsIHNjYWxlWTogMCwgcm90YXRlWTogMTYwIH0sIDEsIHsgZWFzaW5nOiBcInN3aW5nXCIgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyBzY2FsZVg6IDEsIHNjYWxlWTogMSwgcm90YXRlWTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNocmlua0luXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDc1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgXCI1MCVcIiwgXCI1MCVcIiBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIFwiNTAlXCIsIFwiNTAlXCIgXSwgc2NhbGVYOiBbIDEsIDEuNSBdLCBzY2FsZVk6IFsgMSwgMS41IF0sIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zaHJpbmtPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNjAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyBcIjUwJVwiLCBcIjUwJVwiIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgXCI1MCVcIiwgXCI1MCVcIiBdLCBzY2FsZVg6IDEuMywgc2NhbGVZOiAxLjMsIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyBzY2FsZVg6IDEsIHNjYWxlWTogMSB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmV4cGFuZEluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDcwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgXCI1MCVcIiwgXCI1MCVcIiBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIFwiNTAlXCIsIFwiNTAlXCIgXSwgc2NhbGVYOiBbIDEsIDAuNjI1IF0sIHNjYWxlWTogWyAxLCAwLjYyNSBdLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uZXhwYW5kT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDcwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgXCI1MCVcIiwgXCI1MCVcIiBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIFwiNTAlXCIsIFwiNTAlXCIgXSwgc2NhbGVYOiAwLjUsIHNjYWxlWTogMC41LCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgc2NhbGVYOiAxLCBzY2FsZVk6IDEgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uYm91bmNlSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgc2NhbGVYOiBbIDEuMDUsIDAuMyBdLCBzY2FsZVk6IFsgMS4wNSwgMC4zIF0gfSwgMC40MCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgc2NhbGVYOiAwLjksIHNjYWxlWTogMC45LCB0cmFuc2xhdGVaOiAwIH0sIDAuMjAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHNjYWxlWDogMSwgc2NhbGVZOiAxIH0sIDAuNTAgXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmJvdW5jZU91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IHNjYWxlWDogMC45NSwgc2NhbGVZOiAwLjk1IH0sIDAuMzUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHNjYWxlWDogMS4xLCBzY2FsZVk6IDEuMSwgdHJhbnNsYXRlWjogMCB9LCAwLjM1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgc2NhbGVYOiAwLjMsIHNjYWxlWTogMC4zIH0sIDAuMzAgXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgc2NhbGVYOiAxLCBzY2FsZVk6IDEgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uYm91bmNlVXBJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2xhdGVZOiBbIC0zMCwgMTAwMCBdIH0sIDAuNjAsIHsgZWFzaW5nOiBcImVhc2VPdXRDaXJjXCIgfSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWTogMTAgfSwgMC4yMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWTogMCB9LCAwLjIwIF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5ib3VuY2VVcE91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiAxMDAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVZOiAyMCB9LCAwLjIwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIFwiZWFzZUluQ2lyY1wiLCAxIF0sIHRyYW5zbGF0ZVk6IC0xMDAwIH0sIDAuODAgXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNsYXRlWTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5ib3VuY2VEb3duSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNsYXRlWTogWyAzMCwgLTEwMDAgXSB9LCAwLjYwLCB7IGVhc2luZzogXCJlYXNlT3V0Q2lyY1wiIH0gXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVk6IC0xMCB9LCAwLjIwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVZOiAwIH0sIDAuMjAgXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmJvdW5jZURvd25PdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogMTAwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWTogLTIwIH0sIDAuMjAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgXCJlYXNlSW5DaXJjXCIsIDEgXSwgdHJhbnNsYXRlWTogMTAwMCB9LCAwLjgwIF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zbGF0ZVk6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uYm91bmNlTGVmdEluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDc1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zbGF0ZVg6IFsgMzAsIC0xMjUwIF0gfSwgMC42MCwgeyBlYXNpbmc6IFwiZWFzZU91dENpcmNcIiB9IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVYOiAtMTAgfSwgMC4yMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWDogMCB9LCAwLjIwIF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5ib3VuY2VMZWZ0T3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDc1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWDogMzAgfSwgMC4yMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCBcImVhc2VJbkNpcmNcIiwgMSBdLCB0cmFuc2xhdGVYOiAtMTI1MCB9LCAwLjgwIF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zbGF0ZVg6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uYm91bmNlUmlnaHRJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA3NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2xhdGVYOiBbIC0zMCwgMTI1MCBdIH0sIDAuNjAsIHsgZWFzaW5nOiBcImVhc2VPdXRDaXJjXCIgfSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWDogMTAgfSwgMC4yMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWDogMCB9LCAwLjIwIF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5ib3VuY2VSaWdodE91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA3NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVg6IC0zMCB9LCAwLjIwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIFwiZWFzZUluQ2lyY1wiLCAxIF0sIHRyYW5zbGF0ZVg6IDEyNTAgfSwgMC44MCBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2xhdGVYOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVVcEluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDkwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zbGF0ZVk6IFsgMCwgMjAgXSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlVXBPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogOTAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNsYXRlWTogLTIwLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNsYXRlWTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlRG93bkluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDkwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zbGF0ZVk6IFsgMCwgLTIwIF0sIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZURvd25PdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogOTAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNsYXRlWTogMjAsIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2xhdGVZOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVMZWZ0SW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogMTAwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zbGF0ZVg6IFsgMCwgLTIwIF0sIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZUxlZnRPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogMTA1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zbGF0ZVg6IC0yMCwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zbGF0ZVg6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZVJpZ2h0SW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogMTAwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zbGF0ZVg6IFsgMCwgMjAgXSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlUmlnaHRPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogMTA1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zbGF0ZVg6IDIwLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNsYXRlWDogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlVXBCaWdJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2xhdGVZOiBbIDAsIDc1IF0sIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZVVwQmlnT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zbGF0ZVk6IC03NSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zbGF0ZVk6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZURvd25CaWdJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2xhdGVZOiBbIDAsIC03NSBdLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVEb3duQmlnT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zbGF0ZVk6IDc1LCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNsYXRlWTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlTGVmdEJpZ0luXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zbGF0ZVg6IFsgMCwgLTc1IF0sIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZUxlZnRCaWdPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNzUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNsYXRlWDogLTc1LCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNsYXRlWDogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlUmlnaHRCaWdJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2xhdGVYOiBbIDAsIDc1IF0sIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZVJpZ2h0QmlnT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDc1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zbGF0ZVg6IDc1LCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNsYXRlWDogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogTWFnaWMuY3NzICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24ucGVyc3BlY3RpdmVVcEluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDgwMCwgODAwIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgMCwgMCBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIFwiMTAwJVwiLCBcIjEwMCVcIiBdLCByb3RhdGVYOiBbIDAsIC0xODAgXSB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwLCB0cmFuc2Zvcm1PcmlnaW5YOiBcIjUwJVwiLCB0cmFuc2Zvcm1PcmlnaW5ZOiBcIjUwJVwiIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBNYWdpYy5jc3MgKi9cbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24ucGVyc3BlY3RpdmVVcE91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyA4MDAsIDgwMCBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIDAsIDAgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyBcIjEwMCVcIiwgXCIxMDAlXCIgXSwgcm90YXRlWDogLTE4MCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwLCB0cmFuc2Zvcm1PcmlnaW5YOiBcIjUwJVwiLCB0cmFuc2Zvcm1PcmlnaW5ZOiBcIjUwJVwiLCByb3RhdGVYOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBNYWdpYy5jc3MgKi9cbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24ucGVyc3BlY3RpdmVEb3duSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgODAwLCA4MDAgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyAwLCAwIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgMCwgMCBdLCByb3RhdGVYOiBbIDAsIDE4MCBdIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAsIHRyYW5zZm9ybU9yaWdpblg6IFwiNTAlXCIsIHRyYW5zZm9ybU9yaWdpblk6IFwiNTAlXCIgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIE1hZ2ljLmNzcyAqL1xuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5wZXJzcGVjdGl2ZURvd25PdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgODAwLCA4MDAgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyAwLCAwIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgMCwgMCBdLCByb3RhdGVYOiAxODAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCwgdHJhbnNmb3JtT3JpZ2luWDogXCI1MCVcIiwgdHJhbnNmb3JtT3JpZ2luWTogXCI1MCVcIiwgcm90YXRlWDogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogTWFnaWMuY3NzICovXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnBlcnNwZWN0aXZlTGVmdEluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDk1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDIwMDAsIDIwMDAgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyAwLCAwIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgMCwgMCBdLCByb3RhdGVZOiBbIDAsIC0xODAgXSB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwLCB0cmFuc2Zvcm1PcmlnaW5YOiBcIjUwJVwiLCB0cmFuc2Zvcm1PcmlnaW5ZOiBcIjUwJVwiIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBNYWdpYy5jc3MgKi9cbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24ucGVyc3BlY3RpdmVMZWZ0T3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDk1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDIwMDAsIDIwMDAgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyAwLCAwIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgMCwgMCBdLCByb3RhdGVZOiAtMTgwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAsIHRyYW5zZm9ybU9yaWdpblg6IFwiNTAlXCIsIHRyYW5zZm9ybU9yaWdpblk6IFwiNTAlXCIsIHJvdGF0ZVk6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIE1hZ2ljLmNzcyAqL1xuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5wZXJzcGVjdGl2ZVJpZ2h0SW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogOTUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgMjAwMCwgMjAwMCBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIFwiMTAwJVwiLCBcIjEwMCVcIiBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIDAsIDAgXSwgcm90YXRlWTogWyAwLCAxODAgXSB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwLCB0cmFuc2Zvcm1PcmlnaW5YOiBcIjUwJVwiLCB0cmFuc2Zvcm1PcmlnaW5ZOiBcIjUwJVwiIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBNYWdpYy5jc3MgKi9cbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24ucGVyc3BlY3RpdmVSaWdodE91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA5NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyAyMDAwLCAyMDAwIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgXCIxMDAlXCIsIFwiMTAwJVwiIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgMCwgMCBdLCByb3RhdGVZOiAxODAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCwgdHJhbnNmb3JtT3JpZ2luWDogXCI1MCVcIiwgdHJhbnNmb3JtT3JpZ2luWTogXCI1MCVcIiwgcm90YXRlWTogMCB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAvKiBSZWdpc3RlciB0aGUgcGFja2FnZWQgZWZmZWN0cy4gKi9cbiAgICBmb3IgKHZhciBlZmZlY3ROYW1lIGluIFZlbG9jaXR5LlJlZ2lzdGVyRWZmZWN0LnBhY2thZ2VkRWZmZWN0cykge1xuICAgICAgICBWZWxvY2l0eS5SZWdpc3RlckVmZmVjdChlZmZlY3ROYW1lLCBWZWxvY2l0eS5SZWdpc3RlckVmZmVjdC5wYWNrYWdlZEVmZmVjdHNbZWZmZWN0TmFtZV0pO1xuICAgIH1cblxuICAgIC8qKioqKioqKioqKioqKioqKioqKipcbiAgICAgICBTZXF1ZW5jZSBSdW5uaW5nXG4gICAgKioqKioqKioqKioqKioqKioqKioqKi9cblxuICAgIC8qIE5vdGU6IFNlcXVlbmNlIGNhbGxzIG11c3QgdXNlIFZlbG9jaXR5J3Mgc2luZ2xlLW9iamVjdCBhcmd1bWVudHMgc3ludGF4LiAqL1xuICAgIFZlbG9jaXR5LlJ1blNlcXVlbmNlID0gZnVuY3Rpb24gKG9yaWdpbmFsU2VxdWVuY2UpIHtcbiAgICAgICAgdmFyIHNlcXVlbmNlID0gJC5leHRlbmQodHJ1ZSwgW10sIG9yaWdpbmFsU2VxdWVuY2UpO1xuXG4gICAgICAgIGlmIChzZXF1ZW5jZS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAkLmVhY2goc2VxdWVuY2UucmV2ZXJzZSgpLCBmdW5jdGlvbihpLCBjdXJyZW50Q2FsbCkge1xuICAgICAgICAgICAgICAgIHZhciBuZXh0Q2FsbCA9IHNlcXVlbmNlW2kgKyAxXTtcblxuICAgICAgICAgICAgICAgIGlmIChuZXh0Q2FsbCkge1xuICAgICAgICAgICAgICAgICAgICAvKiBQYXJhbGxlbCBzZXF1ZW5jZSBjYWxscyAoaW5kaWNhdGVkIHZpYSBzZXF1ZW5jZVF1ZXVlOmZhbHNlKSBhcmUgdHJpZ2dlcmVkXG4gICAgICAgICAgICAgICAgICAgICAgIGluIHRoZSBwcmV2aW91cyBjYWxsJ3MgYmVnaW4gY2FsbGJhY2suIE90aGVyd2lzZSwgY2hhaW5lZCBjYWxscyBhcmUgbm9ybWFsbHkgdHJpZ2dlcmVkXG4gICAgICAgICAgICAgICAgICAgICAgIGluIHRoZSBwcmV2aW91cyBjYWxsJ3MgY29tcGxldGUgY2FsbGJhY2suICovXG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50Q2FsbE9wdGlvbnMgPSBjdXJyZW50Q2FsbC5vIHx8IGN1cnJlbnRDYWxsLm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0Q2FsbE9wdGlvbnMgPSBuZXh0Q2FsbC5vIHx8IG5leHRDYWxsLm9wdGlvbnM7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWluZyA9IChjdXJyZW50Q2FsbE9wdGlvbnMgJiYgY3VycmVudENhbGxPcHRpb25zLnNlcXVlbmNlUXVldWUgPT09IGZhbHNlKSA/IFwiYmVnaW5cIiA6IFwiY29tcGxldGVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrT3JpZ2luYWwgPSBuZXh0Q2FsbE9wdGlvbnMgJiYgbmV4dENhbGxPcHRpb25zW3RpbWluZ10sXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zID0ge307XG5cbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uc1t0aW1pbmddID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV4dENhbGxFbGVtZW50cyA9IG5leHRDYWxsLmUgfHwgbmV4dENhbGwuZWxlbWVudHM7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBuZXh0Q2FsbEVsZW1lbnRzLm5vZGVUeXBlID8gWyBuZXh0Q2FsbEVsZW1lbnRzIF0gOiBuZXh0Q2FsbEVsZW1lbnRzO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja09yaWdpbmFsICYmIGNhbGxiYWNrT3JpZ2luYWwuY2FsbChlbGVtZW50cywgZWxlbWVudHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgVmVsb2NpdHkoY3VycmVudENhbGwpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRDYWxsLm8pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRDYWxsLm8gPSAkLmV4dGVuZCh7fSwgbmV4dENhbGxPcHRpb25zLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRDYWxsLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgbmV4dENhbGxPcHRpb25zLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzZXF1ZW5jZS5yZXZlcnNlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBWZWxvY2l0eShzZXF1ZW5jZVswXSk7XG4gICAgfTtcbn0oKHdpbmRvdy5qUXVlcnkgfHwgd2luZG93LlplcHRvIHx8IHdpbmRvdyksIHdpbmRvdywgZG9jdW1lbnQpO1xufSkpOyIsIi8qIGdsb2JhbCBtICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRnYW1lVmlld01vZGVsID0gcmVxdWlyZSgnLi8uLi9tb2RlbHMvZ2FtZS12bScpO1xuXG52YXIgR2FtZUNvbnRyb2xsZXIgPSBmdW5jdGlvbigpe1xuXHR0aGlzLlZNID0gbmV3IGdhbWVWaWV3TW9kZWwoKTtcblx0dGhpcy5WTS5pbml0KCk7XG59O1xuLypcblx0UHVibGljIE1lbWJlcnNcbiovXG5cbkdhbWVDb250cm9sbGVyLnByb3RvdHlwZS5yZWFkeSA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMuVk0uc3RhcnRHYW1lKCk7XG59O1xuXG5HYW1lQ29udHJvbGxlci5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24oYW5zKXtcblx0YW5zLnNlbGVjdGVkKCFhbnMuc2VsZWN0ZWQoKSk7XG5cdGFucy50b2dnbGVkKHRydWUpO1xuXHRtLnJlZHJhdygpO1xufTtcblxuR2FtZUNvbnRyb2xsZXIucHJvdG90eXBlLm9uVGltZSA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5WTS5lbmRRdWVzdGlvbigpO1xuICAgIG0ucmVkcmF3KCk7XG59O1xuXG5HYW1lQ29udHJvbGxlci5wcm90b3R5cGUuc3RhcnRRdWVzdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5WTS5zdGFydFF1ZXN0aW9uKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVDb250cm9sbGVyOyIsIi8qIGdsb2JhbCBtICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRpbnRyb1ZpZXdNb2RlbCA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2ludHJvLXZtJyk7XG5cbnZhciBJbnRyb0NvbnRyb2xsZXIgPSBmdW5jdGlvbigpe1xuXHR0aGlzLlZNID0gbmV3IGludHJvVmlld01vZGVsKCk7XG5cdHRoaXMuVk0uaW5pdCgpO1xufTtcblxuLypcblx0UHVibGljIE1lbWJlcnNcbiovXG5JbnRyb0NvbnRyb2xsZXIucHJvdG90eXBlLm9uQmVnaW4gPSBmdW5jdGlvbigpe1xuXHRtLnJlZHJhdygpO1xufTtcblxuSW50cm9Db250cm9sbGVyLnByb3RvdHlwZS5zdGFydEdhbWUgPSBmdW5jdGlvbigpe1xuXHRtLnJvdXRlKFwiL2dhbWVcIik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludHJvQ29udHJvbGxlcjsiLCIvKiBnbG9iYWwgbSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcblx0bG9hZGluZ1ZpZXdNb2RlbCA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2xvYWRpbmctdm0nKTtcblxudmFyIExvYWRpbmdDb250cm9sbGVyID0gZnVuY3Rpb24oKXtcblx0dGhpcy5WTSA9IG5ldyBsb2FkaW5nVmlld01vZGVsKCk7XG5cdHRoaXMuVk0uaW5pdCgpO1xufTtcblxuLypcblx0UHVibGljIE1lbWJlcnNcbiovXG5Mb2FkaW5nQ29udHJvbGxlci5wcm90b3R5cGUub25sb2FkZWQgPSBmdW5jdGlvbigpe1xuXHRtLnJvdXRlKFwiL2ludHJvXCIpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb2FkaW5nQ29udHJvbGxlcjsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRWZWxvY2l0eSA9IHJlcXVpcmUoJ3ZlbG9jaXR5LWFuaW1hdGUnKSxcblx0diA9IHJlcXVpcmUoJ3ZlbG9jaXR5LWFuaW1hdGUvdmVsb2NpdHkudWknKSxcblx0Z2FtZUNvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9jb250cm9sbGVycy9nYW1lLWNvbnRyb2xsZXInKSxcblx0Z2FtZVZpZXcgPSByZXF1aXJlKCcuLi92aWV3cy9nYW1lLXZpZXcnKSxcblx0aW50cm9Db250cm9sbGVyID0gcmVxdWlyZSgnLi4vY29udHJvbGxlcnMvaW50cm8tY29udHJvbGxlcicpLFxuXHRpbnRyb1ZpZXcgPSByZXF1aXJlKCcuLi92aWV3cy9pbnRyby12aWV3JyksXG5cdGxvYWRpbmdDb250cm9sbGVyID0gcmVxdWlyZSgnLi4vY29udHJvbGxlcnMvbG9hZGluZy1jb250cm9sbGVyJyksXG5cdGxvYWRpbmdWaWV3ID0gcmVxdWlyZSgnLi4vdmlld3MvbG9hZGluZy12aWV3Jyk7XG5cbnZhciBhcHBsaWNhdGlvbiA9IGZ1bmN0aW9uKCl7XG5cdC8vaW5pdGlhbGl6ZSB0aGUgYXBwbGljYXRpb25cblx0dmFyIGFwcCA9IHtcblx0XHRsb2FkaW5nIDogeyBjb250cm9sbGVyOiBsb2FkaW5nQ29udHJvbGxlciwgdmlldzogbG9hZGluZ1ZpZXcgfSxcblx0XHRpbnRybyAgIDogeyBjb250cm9sbGVyOiBpbnRyb0NvbnRyb2xsZXIsICAgdmlldzogaW50cm9WaWV3IH0sXG5cdFx0Z2FtZVx0OiB7IGNvbnRyb2xsZXI6IGdhbWVDb250cm9sbGVyLCB2aWV3OiBnYW1lVmlldyB9XG5cdH1cblxuXHRtLnJvdXRlLm1vZGUgPSBcImhhc2hcIjtcblxuXHRtLnJvdXRlKGRvY3VtZW50LmJvZHksIFwiL1wiLCB7XG5cdCAgICBcIlwiXHRcdCA6IGFwcC5sb2FkaW5nLFxuXHQgICAgXCIvaW50cm9cIiA6IGFwcC5pbnRybyxcblx0ICAgIFwiL2dhbWVcIiAgOiBhcHAuZ2FtZVxuXHR9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYXBwbGljYXRpb247IiwiJ3VzZSBzdHJpY3QnO1xuLyogR2xvYmFsIG1vZHVsZSAqL1xudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cbi8qXG5cdFlvdSB3b3VsZCBvYnRhaW4gdGhpcyBieSB4aHJcbiovXG52YXIgZGF0YSA9IHtcblx0c2NvcmUgICAgIDowLFxuXHR0aXRsZSA6IFwiQmVhbWx5IENvbWVkeSBTcGVjaWFsXCIsXG5cdGRlc2NyaXB0aW9uIDogXCJDYW4geW91IGFzc29jaWF0ZSB0aGUgY2VsZWJyaXRpZXMgd2l0aCB0aGUgc2hvd3MgaW4gdGhlIHRpbWUgbGltaXQ/IGxldHMgZmluZCBvdXQuLi5cIixcblx0dGltZXIgOiA3LFxuXHRicmFuZHMgOiBbXG5cdFx0J2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2E1YmY2MmFjLTNlNWYtNDZmYS05YjU5LTU5YzA5YmMwM2QzZS5wbmcnXG5cdF0sXG5cdHF1ZXN0aW9ucyA6W3tcblx0XHRxdWVzdGlvbiA6IFwiV2hpY2ggb2YgdGhlIGZvbGxvd2luZyBhcHBlYXJlZCBpbiB0aGUgOTAncyBzaXRjb20gRnJpZW5kc1wiLFxuXHRcdGFuc3dlcnMgIDogW1xuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9jYTUxMTAzMC1mNzdlLTQ2ZGYtYTFhOS0xMDU4NjI4NGEzOGIucG5nJywgbmFtZSA6ICdMaXNhIEt1ZHJvdycsIGNvcnJlY3QgOiAxIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2IzM2NiMjYyLWUxNzUtNDRmNC1hNThlLTQyNTIzMzkxZmI1ZC5wbmcnLCBuYW1lIDogJ01hdHQgTGUgQmxhbmMnLCBjb3JyZWN0IDogMSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9lNzdiNjYxNy1mNTQzLTQ2Y2ItYjQzNS0zN2I2YjFhNDQyZDcucG5nJywgbmFtZSA6ICdDb3VydG5leSBDb3gtQXJxdWV0dGUnLCBjb3JyZWN0IDogMSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei84NjFiMThhYS0xNTJjLTRhZTAtOTExOC1mZmEwNWI3OWJjNzYucG5nJywgbmFtZSA6ICdXYXluZSBLbmlnaHQnLCBjb3JyZWN0IDogMCB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei8zYTZlZWFkMy05MGNjLTQwNmMtOTllMS00OTM5MjNiM2U4ZDAucG5nJywgbmFtZSA6ICdNYXR0aGV3IFBlcnJ5JywgY29ycmVjdCA6IDEgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovNDBlODAzN2UtMTJiMi00NGQzLTlmODQtNzFmZTNkZTBiZGFmLnBuZycsIG5hbWUgOiAnTWljaGFlbCBSaWNoYXJkcycsIGNvcnJlY3QgOiAwIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzFiNTljNDQ1LThmM2UtNDZiZC1hZDU3LWMxNWE3M2M3YTY4YS5wbmcnLCBuYW1lIDogJ1BhdWwgV2FzaWxld3NraScsIGNvcnJlY3QgOiAwIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzRiYzA3NzZlLTFjZjgtNGIxMi04ODFiLWY3MTU0MzQzZGJlNC5wbmcnLCBuYW1lIDogJ0plbm5pZmVyIEFuaXN0b24nLCBjb3JyZWN0IDogMSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9iM2Y5MWE2My1lOTg3LTRlYTctODFhYi01ODZmOTMwNjEwYWUucG5nJywgbmFtZSA6ICdKYXNvbiBBbGV4YW5kZXInLCBjb3JyZWN0IDogMSB9XG5cdFx0XVxuXHR9LFxuXHR7XG5cdFx0cXVlc3Rpb24gOiBcIldoYXQgYWJvdXQgU2VpbmZlbGRcIixcblx0XHRhbnN3ZXJzICA6IFtcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovMjFkOWEwNTUtYjFjNi00ZDRkLWE0YjYtNTEzMTlmYzY1MTY1LnBuZycsIG5hbWUgOiAnRGF2aWQgU2Nod2ltbWVyJywgY29ycmVjdCA6IDAgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovY2E1MTEwMzAtZjc3ZS00NmRmLWExYTktMTA1ODYyODRhMzhiLnBuZycsIG5hbWUgOiAnTGlzYSBLdWRyb3cnLCBjb3JyZWN0IDogMCB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9iMzNjYjI2Mi1lMTc1LTQ0ZjQtYTU4ZS00MjUyMzM5MWZiNWQucG5nJywgbmFtZSA6ICdNYXR0IExlIEJsYW5jJywgY29ycmVjdCA6IDAgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovZTc3YjY2MTctZjU0My00NmNiLWI0MzUtMzdiNmIxYTQ0MmQ3LnBuZycsIG5hbWUgOiAnQ291cnRuZXkgQ294LUFycXVldHRlJywgY29ycmVjdCA6IDAgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovODYxYjE4YWEtMTUyYy00YWUwLTkxMTgtZmZhMDViNzliYzc2LnBuZycsIG5hbWUgOiAnV2F5bmUgS25pZ2h0JywgY29ycmVjdCA6IDEgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovM2E2ZWVhZDMtOTBjYy00MDZjLTk5ZTEtNDkzOTIzYjNlOGQwLnBuZycsIG5hbWUgOiAnTWF0dGhldyBQZXJyeScsIGNvcnJlY3QgOiAwIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzQwZTgwMzdlLTEyYjItNDRkMy05Zjg0LTcxZmUzZGUwYmRhZi5wbmcnLCBuYW1lIDogJ01pY2hhZWwgUmljaGFyZHMnLCBjb3JyZWN0IDogMSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei8xYjU5YzQ0NS04ZjNlLTQ2YmQtYWQ1Ny1jMTVhNzNjN2E2OGEucG5nJywgbmFtZSA6ICdQYXVsIFdhc2lsZXdza2knLCBjb3JyZWN0IDogMCB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9iM2Y5MWE2My1lOTg3LTRlYTctODFhYi01ODZmOTMwNjEwYWUucG5nJywgbmFtZSA6ICdKYXNvbiBBbGV4YW5kZXInLCBjb3JyZWN0IDogMSB9XG5cdFx0XVxuXHR9XSxcbn07XG5cblxuLypcblx0Q29uc3RydWN0b3JcbiovXG52YXIgR2FtZU1vZGVsID0gZnVuY3Rpb24oKXtcblx0dGhpcy5zY29yZSBcdFx0PSBtLnByb3AoZGF0YS5zY29yZSk7XG5cdHRoaXMucXVlc3Rpb25zXHQ9IG0ucHJvcChkYXRhLnF1ZXN0aW9ucyk7XG5cdHRoaXMuYnJhbmRzICAgICA9IG0ucHJvcChkYXRhLmJyYW5kcyk7XG5cdHRoaXMudGl0bGVcdFx0PSBtLnByb3AoZGF0YS50aXRsZSk7XG5cdHRoaXMuZGVzY3JpcHRpb249IG0ucHJvcChkYXRhLmRlc2NyaXB0aW9uKTtcblx0dGhpcy50aW1lciA9IG0ucHJvcChkYXRhLnRpbWVyIHx8IDUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgR2FtZU1vZGVsKCk7IiwiJ3VzZSBzdHJpY3QnO1xuLyogR2xvYmFsIG1vZHVsZSAqL1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcbiAgICBfID0gcmVxdWlyZSgnbG9kYXNoJyksXG4gICAgR2FtZU1vZGVsID0gcmVxdWlyZSgnLi8uLi9tb2RlbHMvZ2FtZS1tb2RlbCcpO1xuXG52YXIgQW5zd2VyID0gZnVuY3Rpb24oZCl7XG4gICAgdGhpcy5pbWFnZSA9IG0ucHJvcChkLmltYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBtLnByb3AoZC5uYW1lKTtcbiAgICB0aGlzLnNlbGVjdGVkID0gbS5wcm9wKGZhbHNlKTtcbiAgICB0aGlzLmNvcnJlY3QgPSBtLnByb3AoZC5jb3JyZWN0KTtcbiAgICB0aGlzLnRvZ2dsZWQgPSBtLnByb3AoZmFsc2UpO1xufTtcblxudmFyIFF1ZXN0aW9uID0gZnVuY3Rpb24oZCl7XG4gICAgdGhpcy50ZXh0ID0gbS5wcm9wKGQucXVlc3Rpb24pO1xuICAgIHRoaXMuYW5zd2VycyA9IG0ucHJvcChfLm1hcChkLmFuc3dlcnMsIGZ1bmN0aW9uKGEpe1xuICAgICAgICByZXR1cm4gbmV3IEFuc3dlcihhKTtcbiAgICB9KSk7XG59O1xuXG52YXIgVGltZXIgPSBmdW5jdGlvbih0aW1lKXtcbiAgICB0aGlzLmlzQWN0aXZlID0gbS5wcm9wKGZhbHNlKTtcbiAgICB0aGlzLnRpbWUgPSBtLnByb3AodGltZSAqIDEwMDApO1xufTtcblxuLypcbiAgICBDb25zdHJ1Y3RvclxuKi9cblxudmFyIEdhbWVWTSA9IGZ1bmN0aW9uKCl7fTtcblxuXG4vKlxuICAgIFByaXZhdGUgTWVtYmVyc1xuKi9cblxudmFyIF9zZXRDdXJyZW50UXVlc3Rpb24gPSBmdW5jdGlvbigpe1xuICAgIHZhciBxID0gbmV3IFF1ZXN0aW9uKHRoaXMucXVlc3Rpb25zKClbdGhpcy5jdXJyZW50UXVlc3Rpb24oKV0pO1xuICAgIHRoaXMucXVlc3Rpb24ocSk7XG4gICAgbS5yZWRyYXcoKTtcbn07XG5cbnZhciBfbmV4dFF1ZXN0aW9uID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgY3VycmVudCA9IHRoaXMuY3VycmVudFF1ZXN0aW9uKCkgKyAxLFxuICAgICAgICBpc0VuZCA9IGN1cnJlbnQgPT09IHRoaXMudG90YWxRdWVzdGlvbnMoKTtcblxuICAgIHRoaXMuZ2FtZU92ZXIoaXNFbmQpO1xuICAgIGlmKCEgaXNFbmQpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50UXVlc3Rpb24oY3VycmVudCk7XG4gICAgICAgIF9zZXRDdXJyZW50UXVlc3Rpb24uY2FsbCgpO1xuICAgIH1cbn07XG5cbi8qXG4gICAgUHVibGljIE1lbWJlcnNcbiovXG5HYW1lVk0ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpe1xuICAgIHZhciBxdWVzdGlvbnMgPSBHYW1lTW9kZWwucXVlc3Rpb25zKCk7XG4gICAgdGhpcy5jdXJyZW50UXVlc3Rpb24gPSBtLnByb3AoMCk7XG4gICAgdGhpcy5jdXJyZW50U2NvcmUgPSBtLnByb3AoMCk7XG4gICAgdGhpcy50aW1lciA9IG0ucHJvcChudWxsKTtcbiAgICB0aGlzLnF1ZXN0aW9ucyA9IG0ucHJvcChxdWVzdGlvbnMpO1xuICAgIHRoaXMudG90YWxRdWVzdGlvbnMgPSBtLnByb3AocXVlc3Rpb25zLmxlbmd0aCk7XG4gICAgdGhpcy5nYW1lT3ZlciA9IG0ucHJvcChmYWxzZSk7XG4gICAgdGhpcy5xdWVzdGlvbiA9IG0ucHJvcChuZXcgUXVlc3Rpb24oeyBxdWVzdGlvbiA6IFwiXCIsIGFuc3dlcnMgOiBbXSB9KSk7XG4gICAgXG4gICAgLy8gVmlldyBRdWV1ZXMgXG4gICAgdGhpcy5xdWVzdGlvblNob3duID0gbS5wcm9wKGZhbHNlKTtcbiAgICB0aGlzLmVuZFF1ZXN0aW9uID0gbS5wcm9wKGZhbHNlKTtcbn07XG5cbkdhbWVWTS5wcm90b3R5cGUuc3RhcnRHYW1lID0gZnVuY3Rpb24oKXtcbiAgICBzZXRUaW1lb3V0KF9zZXRDdXJyZW50UXVlc3Rpb24uYmluZCh0aGlzKSwgMjAwMCk7XG59O1xuXG5HYW1lVk0ucHJvdG90eXBlLmVuZFF1ZXN0aW9uID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmVuZFF1ZXN0aW9uID0gbS5wcm9wKHRydWUpO1xufTtcblxuR2FtZVZNLnByb3RvdHlwZS5zdGFydFF1ZXN0aW9uID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLnRpbWVyKG5ldyBUaW1lcihHYW1lTW9kZWwudGltZXIoKSkpO1xuICAgIG0ucmVkcmF3KCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVWTTsiLCIndXNlIHN0cmljdCc7XG4vKiBHbG9iYWwgbW9kdWxlICovXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuICAgIEdhbWVNb2RlbCA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2dhbWUtbW9kZWwnKTtcblxudmFyIEludHJvVk0gPSBmdW5jdGlvbigpe307XG5cbi8qXG4gICAgUHVibGljIE1lbWJlcnNcbiovXG5JbnRyb1ZNLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLnRpdGxlID0gbS5wcm9wKEdhbWVNb2RlbC50aXRsZSgpKTtcbiAgICB0aGlzLmRlc2NyaXB0aW9uID0gbS5wcm9wKEdhbWVNb2RlbC5kZXNjcmlwdGlvbigpKTtcbiAgICB0aGlzLmJlZ2luID0gbS5wcm9wKGZhbHNlKTtcbiAgICB0aGlzLmJyYW5kID0gbS5wcm9wKEdhbWVNb2RlbC5icmFuZHMoKVswXSk7XG4gICAgdGhpcy5iZWdpbiA9IG0ucHJvcChmYWxzZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludHJvVk07IiwiJ3VzZSBzdHJpY3QnO1xuLyogR2xvYmFsIG1vZHVsZSAqL1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcbiAgICBfICA9IHJlcXVpcmUoJ2xvZGFzaCcpLFxuICAgIEdhbWVNb2RlbCA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2dhbWUtbW9kZWwnKTtcblxudmFyIExvYWRpbmdWTSA9IGZ1bmN0aW9uKCl7fTtcblxuLypcbiAgICBQcmVsb2FkIGltYWdlc1xuKi9cbnZhciBfcHJlbG9hZCA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHRhcmdldHMgPSB0aGlzLnRhcmdldHMoKSxcbiAgICAgICAgdGFyZ2V0Q291bnQgPSB0YXJnZXRzLmxlbmd0aDtcblxuICAgIHZhciBfX29uTG9hZCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBsb2FkZWQgPSB0aGlzLnRhcmdldHNMb2FkZWQoKSArIDE7XG4gICAgICAgIHRoaXMudGFyZ2V0c0xvYWRlZChsb2FkZWQpO1xuICAgICAgICB0aGlzLnByb2dyZXNzKE1hdGgucm91bmQoKGxvYWRlZCAvIHRhcmdldENvdW50KSAqIDEwMCkpO1xuICAgICAgICB0aGlzLmxvYWRlZCh0aGlzLnByb2dyZXNzKCkgPT09IDEwMCk7XG4gICAgICAgIG0ucmVkcmF3KCk7XG4gICAgfTtcblxuICAgIGZvciAodmFyIGkgPSB0YXJnZXRDb3VudCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIHZhciBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICBpbWFnZS5vbmxvYWQgPSBfX29uTG9hZC5iaW5kKHRoaXMpO1xuICAgICAgICBpbWFnZS5zcmMgPSB0YXJnZXRzW2ldO1xuICAgIH1cbn07XG5cbi8qXG4gICAgUHVibGljIE1lbWJlcnNcbiovXG5Mb2FkaW5nVk0ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpe1xuICAgIHZhciBxdWVzdGlvbnMgPSBHYW1lTW9kZWwucXVlc3Rpb25zKCksXG4gICAgICAgIGVudGl0aWVzID0gW107XG5cbiAgICBfLmVhY2gocXVlc3Rpb25zLCBmdW5jdGlvbihxKXtcbiAgICAgICAgZW50aXRpZXMgPSBfLnVuaW9uKGVudGl0aWVzLCBfLnBsdWNrKHEuYW5zd2VycywgJ2ltYWdlJykpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5sb2FkZWQgPSBtLnByb3AoZmFsc2UpO1xuICAgIHRoaXMucHJvZ3Jlc3MgPSBtLnByb3AoMCk7XG4gICAgdGhpcy50YXJnZXRzID0gbS5wcm9wKGVudGl0aWVzLmNvbmNhdChHYW1lTW9kZWwuYnJhbmRzKCkpKTtcbiAgICB0aGlzLnRhcmdldHNMb2FkZWQgPSBtLnByb3AoMCk7XG4gICAgX3ByZWxvYWQuY2FsbCh0aGlzKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTG9hZGluZ1ZNOyIsIi8qIEdsb2JhbCBtb2R1bGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG4gICAgSGFtbWVyID0gcmVxdWlyZSgnaGFtbWVyanMnKSxcbiAgICBWZWxvY2l0eSA9IHJlcXVpcmUoJ3ZlbG9jaXR5LWFuaW1hdGUnKTtcblxudmFyIFZpZXcgPSBmdW5jdGlvbihjdHJsLCBhbnN3ZXIpe1xuXG4gICAgdmFyIGFuaW1JbiA9IGZ1bmN0aW9uKGVsLCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSB7XG4gICAgICAgIGlmIChpc0luaXRpYWxpemVkICYmIGFuc3dlci50b2dnbGVkKCkpIHtcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC50b2dnbGUoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICBWZWxvY2l0eShlbCwgJ2NhbGxvdXQucHVsc2UnLCB7IGR1cmF0aW9uIDogNDAwIH0pO1xuICAgICAgICAgICAgYW5zd2VyLnRvZ2dsZWQoZmFsc2UpO1xuICAgICAgICB9IGVsc2UgaWYoIWlzSW5pdGlhbGl6ZWQpe1xuICAgICAgICAgICAgdmFyIGhhbW1lcnRpbWUgPSBuZXcgSGFtbWVyKGVsKTtcbiAgICAgICAgICAgIGhhbW1lcnRpbWUub24oJ3RhcCcsIGN0cmwudG9nZ2xlLmJpbmQodGhpcywgYW5zd2VyKSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIG0oXCJsaS5vcGFxdWVcIiwge1xuICAgICAgICBjb25maWcgOiBhbmltSW4sXG4gICAgICAgIHN0eWxlIDogeyBiYWNrZ3JvdW5kSW1hZ2UgOiBcInVybChcIiArIGFuc3dlci5pbWFnZSgpICsgXCIpXCIgfVxuICAgIH0sIFtcbiAgICAgICAgbShcImg0Lm5hbWVcIiwgYW5zd2VyLm5hbWUoKSlcbiAgICBdKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVmlldzsiLCIvKiBHbG9iYWwgbW9kdWxlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuICAgIGFuc3dlclZpZXcgPSByZXF1aXJlKCcuL2Fuc3dlci12aWV3JyksXG4gICAgdGltZXJWaWV3ID0gcmVxdWlyZSgnLi90aW1lci12aWV3JyksXG4gICAgVmVsb2NpdHkgPSByZXF1aXJlKCd2ZWxvY2l0eS1hbmltYXRlJyk7XG5cblxudmFyIHJlbmRlckdhbWVQYWdlID0gZnVuY3Rpb24oY3RybCwgZWwpe1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lID0gJ2dhbWUnO1xuICAgIFZlbG9jaXR5KGVsLmNoaWxkcmVuWzBdLCB7IHRyYW5zbGF0ZVkgOiAnKz0xNzBweCcgfSwgeyBkdXJhdGlvbiA6IDUwMCwgZGVsYXkgOiAzMDAsIGVhc2luZyA6IFsgMjUwLCAwIF0gfSkudGhlbihmdW5jdGlvbigpe1xuICAgICAgICBjdHJsLlZNLnN0YXJ0R2FtZSgpO1xuICAgIH0pO1xufTtcblxudmFyIHJlbmRlclF1ZXN0aW9uVXAgPSBmdW5jdGlvbihjdHJsLCBlbCl7XG4gICAgdmFyIHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3F1ZXN0aW9uLW51bWJlcicpLFxuICAgICAgICBxdWVzdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2N1cnJlbnQtcXVlc3Rpb24nKTtcblxuICAgIFZlbG9jaXR5KHRhcmdldCwge1xuICAgICAgICBsZWZ0IDogJzUwcHgnLFxuICAgICAgICB0b3AgOiAnMjBweCcsXG4gICAgICAgIGZvbnRTaXplIDogJzAuOXJlbSdcbiAgICB9KS50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgIFZlbG9jaXR5KHF1ZXN0aW9uLCAndHJhbnNpdGlvbi5zbGlkZVVwSW4nKS50aGVuKGN0cmwuc3RhcnRRdWVzdGlvbi5iaW5kKGN0cmwpKTtcbiAgICB9KTtcbn07XG5cbnZhciByZW5kZXJBbnN3ZXJzID0gZnVuY3Rpb24oY3RybCwgZWwpe1xuICAgIC8vIFZlbG9jaXR5XG59O1xuXG52YXIgcmVuZGVyU3RhcnRRdWVzdGlvbiA9IGZ1bmN0aW9uKGN0cmwsIGVsKXtcbiAgICAvLyBTaG93IHRoZSBxdWVzdGlvbnNcbiAgICBlbC5jaGlsZHJlblswXS5jbGFzc05hbWUgKz0gJyBiZWdpbic7XG5cbiAgICAvLyBnZXQgYW5zd2VycyBhbmQgcmVtb3ZlIHdlaXJkIGluaXQgc3R5bGVcbiAgICB2YXIgYW5zd2VycyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2Fuc3dlcnMtYXJlYScpWzBdO1xuICAgIGFuc3dlcnMuc3R5bGUub3BhY2l0eSA9IDE7XG4gICAgYW5zd2Vycy5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICBcbiAgICAvLyBTaG93IHRoZSBhbnN3ZXJzXG4gICAgdmFyIHVsID0gYW5zd2Vycy5jaGlsZHJlblswXTtcbiAgICBWZWxvY2l0eSh1bC5jaGlsZHJlbiwgJ3RyYW5zaXRpb24uYm91bmNlSW4nLCB7IHN0YWdnZXIgOiAnMjAwbXMnIH0pLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgcmVuZGVyUXVlc3Rpb25VcChjdHJsLCBlbCk7XG4gICAgfSk7XG4gICAgY3RybC5WTS5xdWVzdGlvblNob3duKHRydWUpO1xufTtcblxudmFyIFZpZXcgPSBmdW5jdGlvbihjdHJsKXtcbiAgICB2YXIgYW5pbUluID0gZnVuY3Rpb24oZWwsIGlzSW5pdGlhbGl6ZWQsIGNvbnRleHQpIHtcbiAgICAgICAgLy8gRGVjaWRlIHdoYXQgdG8gZG8gXG4gICAgICAgIGlmICghaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgcmVuZGVyR2FtZVBhZ2UoY3RybCwgZWwpO1xuICAgICAgICB9IGVsc2UgaWYoY3RybC5WTS5lbmRRdWVzdGlvbigpKXtcblxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYoIWN0cmwuVk0uZ2FtZU92ZXIoKSAmJiAhY3RybC5WTS5xdWVzdGlvblNob3duKCkpe1xuICAgICAgICAgICAgcmVuZGVyU3RhcnRRdWVzdGlvbihjdHJsLCBlbCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIG0oJyNnYW1lLXBhZ2UnLCBbXG4gICAgICAgIG0oJy5nYW1lLWhvbGRlcicsIHtcbiAgICAgICAgICAgIGNvbmZpZyA6IGFuaW1JblxuICAgICAgICB9LFtcbiAgICAgICAgICAgIG0oJ2hlYWRlci5nYW1lLWhlYWRlci5vdXQtdG9wLWZ1bGwnLCBbXG4gICAgICAgICAgICAgICAgdGltZXJWaWV3KGN0cmwsIGN0cmwuVk0udGltZXIoKSksXG4gICAgICAgICAgICAgICAgbSgnaDMuaW50cm8nLCAnR2V0IHJlYWR5JyksXG4gICAgICAgICAgICAgICAgbSgnaDMucXVlc3Rpb24tbnVtYmVyJywgXCJxdWVzdGlvbiBcIiArICgrY3RybC5WTS5jdXJyZW50UXVlc3Rpb24oKSArIDEpKSxcbiAgICAgICAgICAgICAgICBtKCdoMy5jdXJyZW50LXF1ZXN0aW9uLm9wYXF1ZScsIGN0cmwuVk0ucXVlc3Rpb24oKS50ZXh0KCkpXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oJy5hbnN3ZXJzLWFyZWEnLCBbXG4gICAgICAgICAgICAgICAgbShcInVsXCIsIFtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5WTS5xdWVzdGlvbigpLmFuc3dlcnMoKS5tYXAoZnVuY3Rpb24oYW5zd2VyLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFuc3dlclZpZXcoY3RybCwgYW5zd2VyKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgXSlcbiAgICBdKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVmlldzsiLCIvKiBHbG9iYWwgbW9kdWxlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuICAgIF8gPSByZXF1aXJlKCdsb2Rhc2gnKSxcbiAgICBIYW1tZXIgPSByZXF1aXJlKCdoYW1tZXJqcycpLFxuICAgIFZlbG9jaXR5ID0gcmVxdWlyZSgndmVsb2NpdHktYW5pbWF0ZScpO1xuXG52YXIgTG9hZGluZyA9IGZ1bmN0aW9uKGN0cmwpe1xuXG4gICAgdmFyIGFuaW1JbiA9IGZ1bmN0aW9uKGVsLCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSB7XG4gICAgICAgIHZhciBzZXF1ZW5jZSA9IFtcbiAgICAgICAgICAgIHsgZSA6IGVsLmNoaWxkcmVuWzBdLCBwIDogJ3RyYW5zaXRpb24uc2xpZGVVcEluJywgbyA6IHsgZHVyYXRpb24gOiAzMDAsIGRlbGF5IDogMzAwLCBvcGFjaXR5IDogMCB9IH0sXG4gICAgICAgICAgICB7IGUgOiBlbC5jaGlsZHJlblsxXSwgcCA6ICd0cmFuc2l0aW9uLnNsaWRlVXBJbicsIG8gOiB7IGR1cmF0aW9uIDogMzAwIH0gfSxcbiAgICAgICAgICAgIHsgZSA6IGVsLmNoaWxkcmVuWzJdLCBwIDogJ3RyYW5zaXRpb24uYm91bmNlSW4nLCAgbyA6IHsgZHVyYXRpb24gOiAzMDAgfSB9LFxuICAgICAgICAgICAgeyBlIDogZWwuY2hpbGRyZW5bM10sIHAgOiB7IG9wYWNpdHkgOiAxLCByb3RhdGVaIDogJy0yNScsIHJpZ2h0IDogLTUwIH0sIG8gOiB7IGR1cmF0aW9uIDogNTAwLCBlYXNpbmcgOiBbIDI1MCwgMTUgXSB9IH1cbiAgICAgICAgXTtcblxuICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lID0gJ2ludHJvJztcbiAgICAgICAgICAgIFZlbG9jaXR5LlJ1blNlcXVlbmNlKHNlcXVlbmNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIFZlbG9jaXR5KGVsLmNoaWxkcmVuLCAndHJhbnNpdGlvbi5mYWRlT3V0JywgeyBzdGFnZ2VyIDogJzEwMG1zJyB9KS50aGVuKGN0cmwuc3RhcnRHYW1lKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgZXZlbnRzID0gZnVuY3Rpb24oZWwsIGlzSW5pdGlhbGl6ZWQpe1xuICAgICAgICBpZighaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgdmFyIGhhbW1lcnRpbWUgPSBuZXcgSGFtbWVyKGVsKTtcbiAgICAgICAgICAgIGhhbW1lcnRpbWUub24oJ3RhcCcsIGN0cmwub25CZWdpbik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIG0oJyNpbnRyby1wYWdlJywgW1xuICAgICAgICBtKCcuaW50cm8taG9sZGVyJywge1xuICAgICAgICAgICAgY29uZmlnIDogYW5pbUluXG4gICAgICAgIH0sW1xuICAgICAgICAgICAgbSgnaDIub3BhcXVlJywgY3RybC5WTS50aXRsZSgpKSxcbiAgICAgICAgICAgIG0oJy5kZXNjcmlwdGlvbi5vcGFxdWUnLCBjdHJsLlZNLmRlc2NyaXB0aW9uKCkpLFxuICAgICAgICAgICAgbSgnYS5iZWdpbi5vcGFxdWUnLCB7IGNvbmZpZzogZXZlbnRzIH0sICdiZWdpbicpLFxuICAgICAgICAgICAgbSgnLmJyYW5kLm9wYXF1ZS5vdXQtcmlnaHQtZmFyJywgeyBzdHlsZSA6IHsgYmFja2dyb3VuZEltYWdlIDogJ3VybCh7MH0pJy5yZXBsYWNlKCd7MH0nLCBjdHJsLlZNLmJyYW5kKCkpIH0gfSlcbiAgICAgICAgXSlcbiAgICBdKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTG9hZGluZzsiLCIvKiBHbG9iYWwgbW9kdWxlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuICAgIFZlbG9jaXR5ID0gcmVxdWlyZSgndmVsb2NpdHktYW5pbWF0ZScpO1xuXG52YXIgTG9hZGluZyA9IGZ1bmN0aW9uKGN0cmwpe1xuXG4gICAgdmFyIGFuaW1JbiA9IGZ1bmN0aW9uKGVsLCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSB7XG4gICAgICAgIGlmICghaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgVmVsb2NpdHkoZWwsIHsgdHJhbnNsYXRlWCA6ICcrPTEwMCUnIH0sIHsgZGVsYXkgOiAyMDAsIGR1cmF0aW9uIDogMzAwLCBlYXNpbmcgOiAnZWFzZScgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZihjdHJsLlZNLmxvYWRlZCgpKSBWZWxvY2l0eShlbCwgXCJyZXZlcnNlXCIpLnRoZW4oY3RybC5vbmxvYWRlZCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIG0oJyNsb2FkaW5nLXBhZ2UnLCBbXG4gICAgICAgIG0oJy5tZXNzYWdlLWhvbGRlci5vdXQtbGVmdC1mdWxsJywge1xuICAgICAgICAgICAgY29uZmlnIDogYW5pbUluXG4gICAgICAgIH0sW1xuICAgICAgICAgICAgbSgnaDMnLCAnTG9hZGluZyAnICsgY3RybC5WTS5wcm9ncmVzcygpICsgJyUnKVxuICAgICAgICBdKVxuICAgIF0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb2FkaW5nOyIsIi8qIEdsb2JhbCBtb2R1bGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG4gICAgVmVsb2NpdHkgPSByZXF1aXJlKCd2ZWxvY2l0eS1hbmltYXRlJyk7XG5cbnZhciBWaWV3ID0gZnVuY3Rpb24oY3RybCwgdGltZXIpe1xuXG4gICAgdmFyIGFuaW1JbiA9IGZ1bmN0aW9uKGVsLCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSB7XG4gICAgICAgIGlmKCF0aW1lcikgcmV0dXJuO1xuICAgICAgICBpZighdGltZXIuaXNBY3RpdmUoKSl7XG4gICAgICAgICAgICBWZWxvY2l0eShlbCwgeyB3aWR0aCA6ICcxMDAlJyB9LCB7IGR1cmF0aW9uIDogdGltZXIudGltZSgpLCBlYXNpbmcgOiAnbGluZWFyJyB9KS50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgY3RybC5vblRpbWUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGltZXIuaXNBY3RpdmUodHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIG0oXCIudGltZXJcIiwge1xuICAgICAgICBjb25maWcgOiBhbmltSW5cbiAgICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVmlldzsiXX0=
