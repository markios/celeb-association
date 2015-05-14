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

GameController.prototype.onImageShown = function(){
    this.VM.question().imageShown(true);
    this.VM.question().nextQuestionText();
    m.redraw();
};

GameController.prototype.afterEndQuestion = function(){
    this.VM.stopQuestion();
    m.redraw();
    this.VM.nextQuestion();
    m.redraw();
};

/*
	Start the timer off and begin the question
*/
GameController.prototype.startQuestion = function(){
    this.VM.questionShown(true);
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
	return target.replace(/`(.*?)`/g, function (match, text, number) {
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

		if(!target || target.length === 0) return [];

		var keywordMembers = target.match(/`(.*?)`/g),
			numberDelimiteredString = _numberedString(target),
			targetArray = _.without(numberDelimiteredString.split(/{(\d+)}/), "");

		
		for (var i = 0, j = targetArray.length; i < j; i++) {
			var t = +targetArray[i];
			if(t >= 0) targetArray[i] = m('span', keywordMembers[t].replace(/`/g, ''));    this.guesses = m.prop(0);

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
	description : "Can you match the actor to the show in time?",
	timer : 5,
	assets : [
		 { name : 'brand', 	  image : 'http://img-a.zeebox.com/images/z/a5bf62ac-3e5f-46fa-9b59-59c09bc03d3e.png' },
		 { name : 'positive', image : 'http://img-a.zeebox.com/images/z/289e953b-a8b9-4e8b-89d5-1769e1fb168b.png' },
		 { name : 'moderate', image : 'http://img-a.zeebox.com/images/z/fffc4fe7-2e12-43c2-852c-d60c7d4fb5a2.png' },
		 { name : 'negative', image : 'http://img-a.zeebox.com/images/z/75fb3091-574c-4863-bf21-0ea1825c4853.png' },
		 { name : 'trophy',   image : 'http://img-a.zeebox.com/images/z/9ecda2e2-6d09-48dd-a166-32ec232bdb8b.png' }
	],
	questions :[
	{
		question : ["Take a look at this scene from `Community`", "Choose `2 Actors` which appeared in that scene."],
		type : "image",
		image : ["http://img-a.zeebox.com/images/z/5c180fcd-46c4-4162-9979-5e5ce600a6b2.jpg"],
		answers  : [
			{ image : 'http://img-a.zeebox.com/images/z/03833a81-7aa7-4c3b-884f-167277b19c24.png', name : 'Yvette Nicole Brown', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/989bbe49-753e-4234-885d-1929314a371e.png', name : 'Frank Abagnale jr', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/2948182b-fa75-43ff-961f-59e63605ae38.png', name : 'Kumail Nanjiani', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/63c31d8d-2554-4230-a006-1df7766060a7.png', name : 'Chevy Chase', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/cf3f7e17-b850-4a12-8da6-8cd5aad4a5ba.png', name : 'Alomoa Wright', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/fc2630dc-b37e-4203-99c5-0c8370af11ab.png', name : 'Ken Jenkins', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/c7663601-3352-4c11-aad6-475d09684011.png', name : 'Zack Braff', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/5296bcd0-6f6a-41c9-be27-b7a1e0bea458.png', name : 'Joel McHale', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/5d9c9fc8-606e-484a-b4fd-eb0e0bdc4497.png', name : 'Demi Moore', correct : false }
		]
	},
	{
		question : ["Ladies and Gentlemen, `Rob Burgundy`", "Finish the quote. I'm in a `_` cage of `_`"],
		type : "image",
		image : ["http://img-a.zeebox.com/images/z/bb276f11-3f0d-484d-bdba-0a022010ece3.jpg"],
		answers  : [
			{ image : 'http://img-a.zeebox.com/images/z/03833a81-7aa7-4c3b-884f-167277b19c24.png', name : '', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/989bbe49-753e-4234-885d-1929314a371e.png', name : '', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/2948182b-fa75-43ff-961f-59e63605ae38.png', name : '', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/63c31d8d-2554-4230-a006-1df7766060a7.png', name : '', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/cf3f7e17-b850-4a12-8da6-8cd5aad4a5ba.png', name : '', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/fc2630dc-b37e-4203-99c5-0c8370af11ab.png', name : '', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/c7663601-3352-4c11-aad6-475d09684011.png', name : '', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/5296bcd0-6f6a-41c9-be27-b7a1e0bea458.png', name : '', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/5d9c9fc8-606e-484a-b4fd-eb0e0bdc4497.png', name : '', correct : false }
		]
	},
	{
		question : ["`Choose 3` of the following appeared in the 90's sitcom `Friends`"],
		type : 'standard',
		answers  : [
			{ image : 'http://img-a.zeebox.com/images/z/ca511030-f77e-46df-a1a9-10586284a38b.png', name : 'Lisa Kudrow', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/b33cb262-e175-44f4-a58e-42523391fb5d.png', name : 'Matt Le Blanc', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/0e831e8c-8d60-43ea-ab7d-9bbfd4ffb3ad.png', name : 'Donald Glover', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/92e0b45b-404f-4417-8b06-88e1079baed7.png', name : 'Wayne Knight', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/5d9c9fc8-606e-484a-b4fd-eb0e0bdc4497.png', name : 'Demi Moore', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/40e8037e-12b2-44d3-9f84-71fe3de0bdaf.png', name : 'Michael Richards', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/64b80a30-57a6-4928-a805-70bc38641018.png', name : 'Jessica Westfeldt', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/4bc0776e-1cf8-4b12-881b-f7154343dbe4.png', name : 'Jennifer Aniston', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/b3f91a63-e987-4ea7-81ab-586f930610ae.png', name : 'Jason Alexander', correct : false }
		]
	},
	{
		question : ["Going back a little further, `Choose 3` who starred in the cult classic `Seinfeld`?"],
		type : 'standard',
		answers  : [
			{ image : 'http://img-a.zeebox.com/images/z/21d9a055-b1c6-4d4d-a4b6-51319fc65165.png', name : 'David Schwimmer', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/ca511030-f77e-46df-a1a9-10586284a38b.png', name : 'Lisa Kudrow', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/b33cb262-e175-44f4-a58e-42523391fb5d.png', name : 'Matt Le Blanc', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/e77b6617-f543-46cb-b435-37b6b1a442d7.png', name : 'Courtney Cox-Arquette', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/92e0b45b-404f-4417-8b06-88e1079baed7.png', name : 'Wayne Knight', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/3a6eead3-90cc-406c-99e1-493923b3e8d0.png', name : 'Matthew Perry', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/40e8037e-12b2-44d3-9f84-71fe3de0bdaf.png', name : 'Michael Richards', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/1b59c445-8f3e-46bd-ad57-c15a73c7a68a.png', name : 'Paul Wasilewski', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/b3f91a63-e987-4ea7-81ab-586f930610ae.png', name : 'Jason Alexander', correct : true }
		]
	},
	{
		question : ["Now `Scrubs` give me `4`"],
		type : 'standard',
		answers  : [
			{ image : 'http://img-a.zeebox.com/images/z/63c31d8d-2554-4230-a006-1df7766060a7.png', name : 'Chevy Chase', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/fc2630dc-b37e-4203-99c5-0c8370af11ab.png', name : 'Ken Jenkins', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/2948182b-fa75-43ff-961f-59e63605ae38.png', name : 'Kumail Nanjiani', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/ca511030-f77e-46df-a1a9-10586284a38b.png', name : 'Lisa Kudrow', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/cf3f7e17-b850-4a12-8da6-8cd5aad4a5ba.png', name : 'Alomoa Wright', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/ff99cefe-3c00-4785-bd5b-e4a76c66c91b.png', name : 'Sarah Chalke', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/93350291-30e2-4403-afbd-97309b354f59.png', name : 'TJ Miller', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/c7663601-3352-4c11-aad6-475d09684011.png', name : 'Zack Braff', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/f0aa487c-4b2e-4735-b963-c745ee1f7125.png', name : 'Zach Woods', correct : false }
		]
	},
	{
		question : ["Getting a little more modern, `Choose 5` from HBO's `Silicon Valley`"],
		type : 'standard',
		answers  : [
			{ image : 'http://img-a.zeebox.com/images/z/f0aa487c-4b2e-4735-b963-c745ee1f7125.png', name : 'Zach Woods', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/989bbe49-753e-4234-885d-1929314a371e.png', name : 'Frank Abagnale jr', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/a6b28be6-d0f9-4de0-909f-50b021a6288a.png', name : 'Martin Starr', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/2948182b-fa75-43ff-961f-59e63605ae38.png', name : 'Kumail Nanjiani', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/cf3f7e17-b850-4a12-8da6-8cd5aad4a5ba.png', name : 'Alomoa Wright', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/fc2630dc-b37e-4203-99c5-0c8370af11ab.png', name : 'Ken Jenkins', correct : false },
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
	},
	endMessage : "Is this the best you can do?.... Go on, try again or raise the stakes and try out the next level!"
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
	this.endMessage = m.prop(data.endMessage);
	this.timer = m.prop(data.timer || 5);
	this.previousScores = m.prop(_getPreviousScores());
};

/*
	Public Members
*/

GameModel.prototype.saveScore = function(score){
	
	this.score(score);

	// Update previous scores setting the latest score as only one of that score
	var previousScores = this.previousScores(),
		newScore = { date : Date.now(), score : score };
	previousScores = _.without(previousScores, _.findWhere(previousScores, { score : score }));
	previousScores.push(newScore);
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
    this.questionText = d.question;
    this.answers = m.prop(_.map(d.answers, function(a){
        return new Answer(a);
    }));
    this.guesses = m.prop(0);
    this.type = m.prop(d.type);
    this.limit = m.prop(_.filter(d.answers, { correct : true }).length);
    
    // setup
    this.nextQuestionText();
    this.markersForType(d);
};

Question.prototype.markersForType = function(d){
    switch(this.type()){
        case "image" :
            this.imageShown = m.prop(false);
            this.sceneImage = m.prop(d.image[0]);
        break;
    }
};

Question.prototype.nextQuestionText = function(){
    this.questionElement = m.prop(utils.shorthandToMithrilArray(this.questionText.shift()));
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
    return new Question({ question : [], answers : [] });
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
        if(q.image) entities = _.union(entities, q.image);
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
	utils = require('./../libs/utils'),
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

var _calcTopFive = function(previousScores, currentScore){

	// get friendly Time
	_.each(previousScores, function(score){
		score.friendlyTime = utils.relativeTime(score.date);
		score.isCurrent = +score.score === +currentScore;
	});

	if(previousScores.length <= 1) return previousScores;

    previousScores = _.sortBy(previousScores, function(s){
        return -s.score;
    });
    
    return previousScores.slice(0,5);
};

var _getPerformanceAdj = function(){
	var target = '',
		index = _.findIndex(this.scoreBoard(), function(score){
		return score.isCurrent;
	});

	switch(index){
		case 0:
			target = 'trophy';
			break;
		case 1:
		case 2:
			target = 'positive';
			break;
		case 3:
		case 4:
			target = 'moderate';
			break;
		default:
			target = 'negative';
	}

	return target;
};

var _getResultImage = function(){
	return _.findWhere(this.assets(), { name : this.performanceAdj() }).image;
};

/*
    Public Members
*/
ResultVM.prototype.init = function(){
    this.score = m.prop(GameModel.score());
    this.highScore = m.prop(GameModel.highScore());
    this.resultMessages = m.prop(GameModel.resultMessages());
    this.assets = m.prop(GameModel.assets());
    this.endMessage = m.prop(GameModel.endMessage());
    
    // Derivative Data
	this.scoreBoard = m.prop(_calcTopFive(GameModel.previousScores(), this.score()));
    this.message = m.prop(_calcMessage.call(this));
    this.performanceAdj = m.prop(_getPerformanceAdj.call(this));
    this.resultImage = m.prop(_getResultImage.call(this));
};

module.exports = ResultVM;
},{"./../libs/utils":8,"./../models/game-model":9,"lodash":"lodash","mithril":"mithril"}],14:[function(require,module,exports){
/* Global module */
'use strict';

var m = require('mithril'),
    Hammer = require('hammerjs'),
    Velocity = require('velocity-animate');

var View = function(ctrl, answer){

    var animIn = function(el, isInitialized, context) {
        if (answer.toggled()) {
            el.classList.toggle('selected');
            Velocity(el, 'callout.pulse', { duration : 400 })
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
        class : !answer.correct() ? 'js_falsy' : 'js_truthy',
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
    _ = require('lodash'),
    answerView = require('./answer-view'),
    timerView = require('./timer-view'),
    Velocity = require('velocity-animate');


/*
    Helpers
*/

var _getEl = function(marker){
    var el = document.querySelectorAll(marker);
    return el.length > 1 ? el : el[0];
};

var _runSequence = function(seq){
    Velocity.RunSequence(seq);
};

var _getAnimationFor = function(name, overides){
    var anim = {
        "questionNumberUp"   : { e : _getEl('.question-number'), p : { left : '50px', top : '20px', fontSize : '0.9rem' } },
        "questionNumberDown" : { e : _getEl('.question-number'), p : 'reverse' },
        "questionShow"       : { e : _getEl('.current-question'),  p : 'transition.slideUpIn' },
        "questionHide"       : { e : _getEl('.current-question'),  p : 'transition.slideUpOut' },
        "limitShow"          : { e : _getEl('.limit'), p : 'transition.bounceIn' },
        "limitHide"          : { e : _getEl('.limit'), p : 'transition.bounceOut' },
        "imageQuestionShow"  : { e : _getEl('.question-mask > .image-holder'), p : 'transition.shrinkIn' },
        "imageQuestionHide"  : { e : _getEl('.question-mask > .image-holder'), p : 'transition.shrinkOut' },
        "answersShow"        : { e : _getEl('.answer'), p : 'transition.bounceIn', o : { stagger : 200 } },
        "answersHide"        : { e : _getEl('.answer'), p : 'transition.bounceOut', o : { duration : 500 } },
        "falseAnswersFade"   : { e : _getEl('.js_falsy'), p : { opacity : 0.3 }, o : { duration : 500 } },
        "trueAnswersBuzz"    : { e : _getEl('.js_truthy'), p : 'callout.pulse', o : { duration : 300, stagger : 200 } },
    };

    var target = anim[name];
    if(overides ) {
        target.o = target.o || {};
        _.extend(target.o, overides);
    } 
    return target;
};

var _renderStandard = function(ctrl, el){
    var sequence = [
        _getAnimationFor('answersShow'),
        _getAnimationFor('questionNumberUp'),
        _getAnimationFor('questionShow'),
        _getAnimationFor('limitShow', { complete : ctrl.startQuestion.bind(ctrl) })
    ];
    if(ctrl.VM.currentQuestion() > 0) sequence.unshift(_getAnimationFor('questionNumberDown'));
    _runSequence(sequence);
};

var _renderImageQuestion = function(ctrl, el){
    var sequence = null;
    if(!ctrl.VM.question().imageShown()){
        sequence = [
          _getAnimationFor('questionNumberUp'),
          _getAnimationFor('questionShow'),
          _getAnimationFor('imageQuestionShow'),
          _getAnimationFor('imageQuestionHide', { delay : 2000 }),
          _getAnimationFor('questionHide', { complete : ctrl.onImageShown.bind(ctrl) })
        ];
        if(ctrl.VM.currentQuestion() > 0) sequence.unshift(_getAnimationFor('questionNumberDown'));
    } else {
        sequence = [
          _getAnimationFor('questionShow'),
          _getAnimationFor('answersShow'),
          _getAnimationFor('limitShow', { complete : ctrl.startQuestion.bind(ctrl) })
        ];
    }
    _runSequence(sequence);
};

/*
    Render Entry Members
*/

var renderGamePage = function(ctrl, el){
    document.body.className = 'game';
    Velocity(_getEl('.game-header'), { translateY : '+=170px' }, { duration : 500, delay : 300, easing : [ 250, 0 ] }).then(function(){
        ctrl.ready();
    });
};


var renderOut = function(ctrl, el){
    Velocity(el.children[0], 'reverse').then(ctrl.endGame.bind(ctrl));
};


var renderAnswersOut = function(ctrl, el){
    // Velocity
    _runSequence([
        _getAnimationFor('falseAnswersFade'),
        _getAnimationFor('trueAnswersBuzz'),
        _getAnimationFor('answersHide', { delay : 1500 }),
        _getAnimationFor('questionHide', { duration : 500 }),
        _getAnimationFor('limitHide', { duration : 200 , complete : ctrl.afterEndQuestion.bind(ctrl) })
    ]);
};

var renderQuestionForType = function(ctrl, el){
    // Show the questions
    _getEl('.game-header').classList.add('begin');

    // get answers and remove weird init style
    var answers = _getEl('.question-mask');
    answers.style.opacity = 1;
    answers.style.display = 'block';

    switch(ctrl.VM.question().type()){
        case "standard" :
            _renderStandard(ctrl, el);
        break;
        case "image" :
            _renderImageQuestion(ctrl, el);
        break;
    }
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
            renderQuestionForType(ctrl, el);
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
            m('.question-mask', [
                m('.image-holder.opaque', { style : { backgroundImage : 'url(' + (ctrl.VM.question().type() === 'image' ? ctrl.VM.question().sceneImage() : '') + ')' } } )
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
},{"./answer-view":14,"./timer-view":19,"lodash":"lodash","mithril":"mithril","velocity-animate":"velocity-animate"}],16:[function(require,module,exports){
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

    var renderScoreboardIn = function(){
        var result = document.getElementsByClassName('results')[0],
            scoresArea = document.getElementsByClassName('scores')[0],
            scoreTitle = scoresArea.children[0],
            moveOn = document.getElementsByClassName('move-on')[0],
            scores = scoresArea.children[1];

        var sequence = [
            { e : result.children, p : 'transition.expandOut', o : { delay : 5000 } },
            { e : scoreTitle, p : 'transition.fadeIn' },
            { e : scores.children, p : 'transition.slideLeftBigIn', o : { stagger : 200 } },
            { e : moveOn, p : 'transition.fadeIn' }
        ];
        Velocity.RunSequence(sequence);
    };

    var renderReplay = function(){
        var a = document.getElementsByClassName('btn');
        Velocity(a, 'fadeIn', { stagger : 200, complete : renderScoreboardIn.bind(this) });
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
            m('.scores', [
                m('h3.opaque', 'Your Scores'),
                m('ol.my-scores', [
                    ctrl.VM.scoreBoard().map(function(s, i) {
                        var className = '';
                        className +=  (i === 0) ? 'first' : '';
                        className +=  s.isCurrent ? ' current' : '';

                        return m('li.opaque', [
                            m('.score-item', { class : className }, [
                                s.score + ' points ',
                                m('span', s.friendlyTime)
                            ])
                        ]);
                    })
                ])
            ]),
            m('p.move-on.opaque', ['You scored ', m('span', ctrl.VM.score() + 'pts'), ', ' + ctrl.VM.endMessage()]),
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
            Velocity(el, { width : '100%' }, { delay : 1000, duration : timer.time(), easing : 'linear' }).then(function(){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9tYWluLmpzIiwibm9kZV9tb2R1bGVzL3ZlbG9jaXR5LWFuaW1hdGUvdmVsb2NpdHkudWkuanMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVycy9nYW1lLWNvbnRyb2xsZXIuanMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVycy9pbnRyby1jb250cm9sbGVyLmpzIiwic3JjL3NjcmlwdHMvY29udHJvbGxlcnMvbG9hZGluZy1jb250cm9sbGVyLmpzIiwic3JjL3NjcmlwdHMvY29udHJvbGxlcnMvcmVzdWx0LWNvbnRyb2xsZXIuanMiLCJzcmMvc2NyaXB0cy9saWJzL2FwcC5qcyIsInNyYy9zY3JpcHRzL2xpYnMvdXRpbHMuanMiLCJzcmMvc2NyaXB0cy9tb2RlbHMvZ2FtZS1tb2RlbC5qcyIsInNyYy9zY3JpcHRzL21vZGVscy9nYW1lLXZtLmpzIiwic3JjL3NjcmlwdHMvbW9kZWxzL2ludHJvLXZtLmpzIiwic3JjL3NjcmlwdHMvbW9kZWxzL2xvYWRpbmctdm0uanMiLCJzcmMvc2NyaXB0cy9tb2RlbHMvcmVzdWx0LXZtLmpzIiwic3JjL3NjcmlwdHMvdmlld3MvYW5zd2VyLXZpZXcuanMiLCJzcmMvc2NyaXB0cy92aWV3cy9nYW1lLXZpZXcuanMiLCJzcmMvc2NyaXB0cy92aWV3cy9pbnRyby12aWV3LmpzIiwic3JjL3NjcmlwdHMvdmlld3MvbG9hZGluZy12aWV3LmpzIiwic3JjL3NjcmlwdHMvdmlld3MvcmVzdWx0LXZpZXcuanMiLCJzcmMvc2NyaXB0cy92aWV3cy90aW1lci12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6dkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQXBwID0gcmVxdWlyZSgnLi9saWJzL2FwcC5qcycpO1xuXG53aW5kb3cud2lkZ2V0VmVyc2lvbiA9IFwidjAuMC4wXCI7XG5cbnZhciBpbml0QXBwID0gZnVuY3Rpb24ocGFyYW1zKXtcblx0dmFyIGluc3RhbmNlID0gbmV3IEFwcCgpO1xufTtcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZnVuY3Rpb24oZXZlbnQpe1xuICAgLy9kbyB3b3JrXG4gICBpbml0QXBwKCk7XG59KTtcbiIsIi8qKioqKioqKioqKioqKioqKioqKioqXG4gICBWZWxvY2l0eSBVSSBQYWNrXG4qKioqKioqKioqKioqKioqKioqKioqL1xuXG4vKiBWZWxvY2l0eUpTLm9yZyBVSSBQYWNrICg1LjAuNCkuIChDKSAyMDE0IEp1bGlhbiBTaGFwaXJvLiBNSVQgQGxpY2Vuc2U6IGVuLndpa2lwZWRpYS5vcmcvd2lraS9NSVRfTGljZW5zZS4gUG9ydGlvbnMgY29weXJpZ2h0IERhbmllbCBFZGVuLCBDaHJpc3RpYW4gUHVjY2kuICovXG5cbjsoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICAvKiBDb21tb25KUyBtb2R1bGUuICovXG4gICAgaWYgKHR5cGVvZiByZXF1aXJlID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIGV4cG9ydHMgPT09IFwib2JqZWN0XCIgKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICAgIC8qIEFNRCBtb2R1bGUuICovXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyBcInZlbG9jaXR5XCIgXSwgZmFjdG9yeSk7XG4gICAgLyogQnJvd3NlciBnbG9iYWxzLiAqL1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZhY3RvcnkoKTtcbiAgICB9XG59KGZ1bmN0aW9uKCkge1xucmV0dXJuIGZ1bmN0aW9uIChnbG9iYWwsIHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCkge1xuXG4gICAgLyoqKioqKioqKioqKipcbiAgICAgICAgQ2hlY2tzXG4gICAgKioqKioqKioqKioqKi9cblxuICAgIGlmICghZ2xvYmFsLlZlbG9jaXR5IHx8ICFnbG9iYWwuVmVsb2NpdHkuVXRpbGl0aWVzKSB7XG4gICAgICAgIHdpbmRvdy5jb25zb2xlICYmIGNvbnNvbGUubG9nKFwiVmVsb2NpdHkgVUkgUGFjazogVmVsb2NpdHkgbXVzdCBiZSBsb2FkZWQgZmlyc3QuIEFib3J0aW5nLlwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBWZWxvY2l0eSA9IGdsb2JhbC5WZWxvY2l0eSxcbiAgICAgICAgICAgICQgPSBWZWxvY2l0eS5VdGlsaXRpZXM7XG4gICAgfVxuXG4gICAgdmFyIHZlbG9jaXR5VmVyc2lvbiA9IFZlbG9jaXR5LnZlcnNpb24sXG4gICAgICAgIHJlcXVpcmVkVmVyc2lvbiA9IHsgbWFqb3I6IDEsIG1pbm9yOiAxLCBwYXRjaDogMCB9O1xuXG4gICAgZnVuY3Rpb24gZ3JlYXRlclNlbXZlciAocHJpbWFyeSwgc2Vjb25kYXJ5KSB7XG4gICAgICAgIHZhciB2ZXJzaW9uSW50cyA9IFtdO1xuXG4gICAgICAgIGlmICghcHJpbWFyeSB8fCAhc2Vjb25kYXJ5KSB7IHJldHVybiBmYWxzZTsgfVxuXG4gICAgICAgICQuZWFjaChbIHByaW1hcnksIHNlY29uZGFyeSBdLCBmdW5jdGlvbihpLCB2ZXJzaW9uT2JqZWN0KSB7XG4gICAgICAgICAgICB2YXIgdmVyc2lvbkludHNDb21wb25lbnRzID0gW107XG5cbiAgICAgICAgICAgICQuZWFjaCh2ZXJzaW9uT2JqZWN0LCBmdW5jdGlvbihjb21wb25lbnQsIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKHZhbHVlLnRvU3RyaW5nKCkubGVuZ3RoIDwgNSkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IFwiMFwiICsgdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZlcnNpb25JbnRzQ29tcG9uZW50cy5wdXNoKHZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2ZXJzaW9uSW50cy5wdXNoKHZlcnNpb25JbnRzQ29tcG9uZW50cy5qb2luKFwiXCIpKVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gKHBhcnNlRmxvYXQodmVyc2lvbkludHNbMF0pID4gcGFyc2VGbG9hdCh2ZXJzaW9uSW50c1sxXSkpO1xuICAgIH1cblxuICAgIGlmIChncmVhdGVyU2VtdmVyKHJlcXVpcmVkVmVyc2lvbiwgdmVsb2NpdHlWZXJzaW9uKSl7XG4gICAgICAgIHZhciBhYm9ydEVycm9yID0gXCJWZWxvY2l0eSBVSSBQYWNrOiBZb3UgbmVlZCB0byB1cGRhdGUgVmVsb2NpdHkgKGpxdWVyeS52ZWxvY2l0eS5qcykgdG8gYSBuZXdlciB2ZXJzaW9uLiBWaXNpdCBodHRwOi8vZ2l0aHViLmNvbS9qdWxpYW5zaGFwaXJvL3ZlbG9jaXR5LlwiO1xuICAgICAgICBhbGVydChhYm9ydEVycm9yKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGFib3J0RXJyb3IpO1xuICAgIH1cblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICBFZmZlY3QgUmVnaXN0cmF0aW9uXG4gICAgKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gICAgLyogTm90ZTogUmVnaXN0ZXJVSSBpcyBhIGxlZ2FjeSBuYW1lLiAqL1xuICAgIFZlbG9jaXR5LlJlZ2lzdGVyRWZmZWN0ID0gVmVsb2NpdHkuUmVnaXN0ZXJVSSA9IGZ1bmN0aW9uIChlZmZlY3ROYW1lLCBwcm9wZXJ0aWVzKSB7XG4gICAgICAgIC8qIEFuaW1hdGUgdGhlIGV4cGFuc2lvbi9jb250cmFjdGlvbiBvZiB0aGUgZWxlbWVudHMnIHBhcmVudCdzIGhlaWdodCBmb3IgSW4vT3V0IGVmZmVjdHMuICovXG4gICAgICAgIGZ1bmN0aW9uIGFuaW1hdGVQYXJlbnRIZWlnaHQgKGVsZW1lbnRzLCBkaXJlY3Rpb24sIHRvdGFsRHVyYXRpb24sIHN0YWdnZXIpIHtcbiAgICAgICAgICAgIHZhciB0b3RhbEhlaWdodERlbHRhID0gMCxcbiAgICAgICAgICAgICAgICBwYXJlbnROb2RlO1xuXG4gICAgICAgICAgICAvKiBTdW0gdGhlIHRvdGFsIGhlaWdodCAoaW5jbHVkaW5nIHBhZGRpbmcgYW5kIG1hcmdpbikgb2YgYWxsIHRhcmdldGVkIGVsZW1lbnRzLiAqL1xuICAgICAgICAgICAgJC5lYWNoKGVsZW1lbnRzLm5vZGVUeXBlID8gWyBlbGVtZW50cyBdIDogZWxlbWVudHMsIGZ1bmN0aW9uKGksIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RhZ2dlcikge1xuICAgICAgICAgICAgICAgICAgICAvKiBJbmNyZWFzZSB0aGUgdG90YWxEdXJhdGlvbiBieSB0aGUgc3VjY2Vzc2l2ZSBkZWxheSBhbW91bnRzIHByb2R1Y2VkIGJ5IHRoZSBzdGFnZ2VyIG9wdGlvbi4gKi9cbiAgICAgICAgICAgICAgICAgICAgdG90YWxEdXJhdGlvbiArPSBpICogc3RhZ2dlcjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBwYXJlbnROb2RlID0gZWxlbWVudC5wYXJlbnROb2RlO1xuXG4gICAgICAgICAgICAgICAgJC5lYWNoKFsgXCJoZWlnaHRcIiwgXCJwYWRkaW5nVG9wXCIsIFwicGFkZGluZ0JvdHRvbVwiLCBcIm1hcmdpblRvcFwiLCBcIm1hcmdpbkJvdHRvbVwiXSwgZnVuY3Rpb24oaSwgcHJvcGVydHkpIHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxIZWlnaHREZWx0YSArPSBwYXJzZUZsb2F0KFZlbG9jaXR5LkNTUy5nZXRQcm9wZXJ0eVZhbHVlKGVsZW1lbnQsIHByb3BlcnR5KSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLyogQW5pbWF0ZSB0aGUgcGFyZW50IGVsZW1lbnQncyBoZWlnaHQgYWRqdXN0bWVudCAod2l0aCBhIHZhcnlpbmcgZHVyYXRpb24gbXVsdGlwbGllciBmb3IgYWVzdGhldGljIGJlbmVmaXRzKS4gKi9cbiAgICAgICAgICAgIFZlbG9jaXR5LmFuaW1hdGUoXG4gICAgICAgICAgICAgICAgcGFyZW50Tm9kZSxcbiAgICAgICAgICAgICAgICB7IGhlaWdodDogKGRpcmVjdGlvbiA9PT0gXCJJblwiID8gXCIrXCIgOiBcIi1cIikgKyBcIj1cIiArIHRvdGFsSGVpZ2h0RGVsdGEgfSxcbiAgICAgICAgICAgICAgICB7IHF1ZXVlOiBmYWxzZSwgZWFzaW5nOiBcImVhc2UtaW4tb3V0XCIsIGR1cmF0aW9uOiB0b3RhbER1cmF0aW9uICogKGRpcmVjdGlvbiA9PT0gXCJJblwiID8gMC42IDogMSkgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIFJlZ2lzdGVyIGEgY3VzdG9tIHJlZGlyZWN0IGZvciBlYWNoIGVmZmVjdC4gKi9cbiAgICAgICAgVmVsb2NpdHkuUmVkaXJlY3RzW2VmZmVjdE5hbWVdID0gZnVuY3Rpb24gKGVsZW1lbnQsIHJlZGlyZWN0T3B0aW9ucywgZWxlbWVudHNJbmRleCwgZWxlbWVudHNTaXplLCBlbGVtZW50cywgcHJvbWlzZURhdGEpIHtcbiAgICAgICAgICAgIHZhciBmaW5hbEVsZW1lbnQgPSAoZWxlbWVudHNJbmRleCA9PT0gZWxlbWVudHNTaXplIC0gMSk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvcGVydGllcy5kZWZhdWx0RHVyYXRpb24gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHByb3BlcnRpZXMuZGVmYXVsdER1cmF0aW9uID0gcHJvcGVydGllcy5kZWZhdWx0RHVyYXRpb24uY2FsbChlbGVtZW50cywgZWxlbWVudHMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLmRlZmF1bHREdXJhdGlvbiA9IHBhcnNlRmxvYXQocHJvcGVydGllcy5kZWZhdWx0RHVyYXRpb24pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBJdGVyYXRlIHRocm91Z2ggZWFjaCBlZmZlY3QncyBjYWxsIGFycmF5LiAqL1xuICAgICAgICAgICAgZm9yICh2YXIgY2FsbEluZGV4ID0gMDsgY2FsbEluZGV4IDwgcHJvcGVydGllcy5jYWxscy5sZW5ndGg7IGNhbGxJbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNhbGwgPSBwcm9wZXJ0aWVzLmNhbGxzW2NhbGxJbmRleF0sXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TWFwID0gY2FsbFswXSxcbiAgICAgICAgICAgICAgICAgICAgcmVkaXJlY3REdXJhdGlvbiA9IChyZWRpcmVjdE9wdGlvbnMuZHVyYXRpb24gfHwgcHJvcGVydGllcy5kZWZhdWx0RHVyYXRpb24gfHwgMTAwMCksXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uUGVyY2VudGFnZSA9IGNhbGxbMV0sXG4gICAgICAgICAgICAgICAgICAgIGNhbGxPcHRpb25zID0gY2FsbFsyXSB8fCB7fSxcbiAgICAgICAgICAgICAgICAgICAgb3B0cyA9IHt9O1xuXG4gICAgICAgICAgICAgICAgLyogQXNzaWduIHRoZSB3aGl0ZWxpc3RlZCBwZXItY2FsbCBvcHRpb25zLiAqL1xuICAgICAgICAgICAgICAgIG9wdHMuZHVyYXRpb24gPSByZWRpcmVjdER1cmF0aW9uICogKGR1cmF0aW9uUGVyY2VudGFnZSB8fCAxKTtcbiAgICAgICAgICAgICAgICBvcHRzLnF1ZXVlID0gcmVkaXJlY3RPcHRpb25zLnF1ZXVlIHx8IFwiXCI7XG4gICAgICAgICAgICAgICAgb3B0cy5lYXNpbmcgPSBjYWxsT3B0aW9ucy5lYXNpbmcgfHwgXCJlYXNlXCI7XG4gICAgICAgICAgICAgICAgb3B0cy5kZWxheSA9IHBhcnNlRmxvYXQoY2FsbE9wdGlvbnMuZGVsYXkpIHx8IDA7XG4gICAgICAgICAgICAgICAgb3B0cy5fY2FjaGVWYWx1ZXMgPSBjYWxsT3B0aW9ucy5fY2FjaGVWYWx1ZXMgfHwgdHJ1ZTtcblxuICAgICAgICAgICAgICAgIC8qIFNwZWNpYWwgcHJvY2Vzc2luZyBmb3IgdGhlIGZpcnN0IGVmZmVjdCBjYWxsLiAqL1xuICAgICAgICAgICAgICAgIGlmIChjYWxsSW5kZXggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLyogSWYgYSBkZWxheSB3YXMgcGFzc2VkIGludG8gdGhlIHJlZGlyZWN0LCBjb21iaW5lIGl0IHdpdGggdGhlIGZpcnN0IGNhbGwncyBkZWxheS4gKi9cbiAgICAgICAgICAgICAgICAgICAgb3B0cy5kZWxheSArPSAocGFyc2VGbG9hdChyZWRpcmVjdE9wdGlvbnMuZGVsYXkpIHx8IDApO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50c0luZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRzLmJlZ2luID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogT25seSB0cmlnZ2VyIGEgYmVnaW4gY2FsbGJhY2sgb24gdGhlIGZpcnN0IGVmZmVjdCBjYWxsIHdpdGggdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlIHNldC4gKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWRpcmVjdE9wdGlvbnMuYmVnaW4gJiYgcmVkaXJlY3RPcHRpb25zLmJlZ2luLmNhbGwoZWxlbWVudHMsIGVsZW1lbnRzKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkaXJlY3Rpb24gPSBlZmZlY3ROYW1lLm1hdGNoKC8oSW58T3V0KSQvKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIE1ha2UgXCJpblwiIHRyYW5zaXRpb25pbmcgZWxlbWVudHMgaW52aXNpYmxlIGltbWVkaWF0ZWx5IHNvIHRoYXQgdGhlcmUncyBubyBGT1VDIGJldHdlZW4gbm93XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5kIHRoZSBmaXJzdCBSQUYgdGljay4gKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoKGRpcmVjdGlvbiAmJiBkaXJlY3Rpb25bMF0gPT09IFwiSW5cIikgJiYgcHJvcGVydHlNYXAub3BhY2l0eSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQuZWFjaChlbGVtZW50cy5ub2RlVHlwZSA/IFsgZWxlbWVudHMgXSA6IGVsZW1lbnRzLCBmdW5jdGlvbihpLCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBWZWxvY2l0eS5DU1Muc2V0UHJvcGVydHlWYWx1ZShlbGVtZW50LCBcIm9wYWNpdHlcIiwgMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIE9ubHkgdHJpZ2dlciBhbmltYXRlUGFyZW50SGVpZ2h0KCkgaWYgd2UncmUgdXNpbmcgYW4gSW4vT3V0IHRyYW5zaXRpb24uICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlZGlyZWN0T3B0aW9ucy5hbmltYXRlUGFyZW50SGVpZ2h0ICYmIGRpcmVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlUGFyZW50SGVpZ2h0KGVsZW1lbnRzLCBkaXJlY3Rpb25bMF0sIHJlZGlyZWN0RHVyYXRpb24gKyBvcHRzLmRlbGF5LCByZWRpcmVjdE9wdGlvbnMuc3RhZ2dlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLyogSWYgdGhlIHVzZXIgaXNuJ3Qgb3ZlcnJpZGluZyB0aGUgZGlzcGxheSBvcHRpb24sIGRlZmF1bHQgdG8gXCJhdXRvXCIgZm9yIFwiSW5cIi1zdWZmaXhlZCB0cmFuc2l0aW9ucy4gKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlZGlyZWN0T3B0aW9ucy5kaXNwbGF5ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVkaXJlY3RPcHRpb25zLmRpc3BsYXkgIT09IHVuZGVmaW5lZCAmJiByZWRpcmVjdE9wdGlvbnMuZGlzcGxheSAhPT0gXCJub25lXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRzLmRpc3BsYXkgPSByZWRpcmVjdE9wdGlvbnMuZGlzcGxheTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoL0luJC8udGVzdChlZmZlY3ROYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIElubGluZSBlbGVtZW50cyBjYW5ub3QgYmUgc3ViamVjdGVkIHRvIHRyYW5zZm9ybXMsIHNvIHdlIHN3aXRjaCB0aGVtIHRvIGlubGluZS1ibG9jay4gKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGVmYXVsdERpc3BsYXkgPSBWZWxvY2l0eS5DU1MuVmFsdWVzLmdldERpc3BsYXlUeXBlKGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdHMuZGlzcGxheSA9IChkZWZhdWx0RGlzcGxheSA9PT0gXCJpbmxpbmVcIikgPyBcImlubGluZS1ibG9ja1wiIDogZGVmYXVsdERpc3BsYXk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAocmVkaXJlY3RPcHRpb25zLnZpc2liaWxpdHkgJiYgcmVkaXJlY3RPcHRpb25zLnZpc2liaWxpdHkgIT09IFwiaGlkZGVuXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdHMudmlzaWJpbGl0eSA9IHJlZGlyZWN0T3B0aW9ucy52aXNpYmlsaXR5O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLyogU3BlY2lhbCBwcm9jZXNzaW5nIGZvciB0aGUgbGFzdCBlZmZlY3QgY2FsbC4gKi9cbiAgICAgICAgICAgICAgICBpZiAoY2FsbEluZGV4ID09PSBwcm9wZXJ0aWVzLmNhbGxzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgLyogQXBwZW5kIHByb21pc2UgcmVzb2x2aW5nIG9udG8gdGhlIHVzZXIncyByZWRpcmVjdCBjYWxsYmFjay4gKi9cbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gaW5qZWN0RmluYWxDYWxsYmFja3MgKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKChyZWRpcmVjdE9wdGlvbnMuZGlzcGxheSA9PT0gdW5kZWZpbmVkIHx8IHJlZGlyZWN0T3B0aW9ucy5kaXNwbGF5ID09PSBcIm5vbmVcIikgJiYgL091dCQvLnRlc3QoZWZmZWN0TmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkLmVhY2goZWxlbWVudHMubm9kZVR5cGUgPyBbIGVsZW1lbnRzIF0gOiBlbGVtZW50cywgZnVuY3Rpb24oaSwgZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBWZWxvY2l0eS5DU1Muc2V0UHJvcGVydHlWYWx1ZShlbGVtZW50LCBcImRpc3BsYXlcIiwgXCJub25lXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZWRpcmVjdE9wdGlvbnMuY29tcGxldGUgJiYgcmVkaXJlY3RPcHRpb25zLmNvbXBsZXRlLmNhbGwoZWxlbWVudHMsIGVsZW1lbnRzKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb21pc2VEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvbWlzZURhdGEucmVzb2x2ZXIoZWxlbWVudHMgfHwgZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBvcHRzLmNvbXBsZXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvcGVydGllcy5yZXNldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHJlc2V0UHJvcGVydHkgaW4gcHJvcGVydGllcy5yZXNldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzZXRWYWx1ZSA9IHByb3BlcnRpZXMucmVzZXRbcmVzZXRQcm9wZXJ0eV07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogRm9ybWF0IGVhY2ggbm9uLWFycmF5IHZhbHVlIGluIHRoZSByZXNldCBwcm9wZXJ0eSBtYXAgdG8gWyB2YWx1ZSwgdmFsdWUgXSBzbyB0aGF0IGNoYW5nZXMgYXBwbHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1tZWRpYXRlbHkgYW5kIERPTSBxdWVyeWluZyBpcyBhdm9pZGVkICh2aWEgZm9yY2VmZWVkaW5nKS4gKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogTm90ZTogRG9uJ3QgZm9yY2VmZWVkIGhvb2tzLCBvdGhlcndpc2UgdGhlaXIgaG9vayByb290cyB3aWxsIGJlIGRlZmF1bHRlZCB0byB0aGVpciBudWxsIHZhbHVlcy4gKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFZlbG9jaXR5LkNTUy5Ib29rcy5yZWdpc3RlcmVkW3Jlc2V0UHJvcGVydHldID09PSB1bmRlZmluZWQgJiYgKHR5cGVvZiByZXNldFZhbHVlID09PSBcInN0cmluZ1wiIHx8IHR5cGVvZiByZXNldFZhbHVlID09PSBcIm51bWJlclwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllcy5yZXNldFtyZXNldFByb3BlcnR5XSA9IFsgcHJvcGVydGllcy5yZXNldFtyZXNldFByb3BlcnR5XSwgcHJvcGVydGllcy5yZXNldFtyZXNldFByb3BlcnR5XSBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogU28gdGhhdCB0aGUgcmVzZXQgdmFsdWVzIGFyZSBhcHBsaWVkIGluc3RhbnRseSB1cG9uIHRoZSBuZXh0IHJBRiB0aWNrLCB1c2UgYSB6ZXJvIGR1cmF0aW9uIGFuZCBwYXJhbGxlbCBxdWV1ZWluZy4gKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzZXRPcHRpb25zID0geyBkdXJhdGlvbjogMCwgcXVldWU6IGZhbHNlIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBTaW5jZSB0aGUgcmVzZXQgb3B0aW9uIHVzZXMgdXAgdGhlIGNvbXBsZXRlIGNhbGxiYWNrLCB3ZSB0cmlnZ2VyIHRoZSB1c2VyJ3MgY29tcGxldGUgY2FsbGJhY2sgYXQgdGhlIGVuZCBvZiBvdXJzLiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaW5hbEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXRPcHRpb25zLmNvbXBsZXRlID0gaW5qZWN0RmluYWxDYWxsYmFja3M7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVmVsb2NpdHkuYW5pbWF0ZShlbGVtZW50LCBwcm9wZXJ0aWVzLnJlc2V0LCByZXNldE9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLyogT25seSB0cmlnZ2VyIHRoZSB1c2VyJ3MgY29tcGxldGUgY2FsbGJhY2sgb24gdGhlIGxhc3QgZWZmZWN0IGNhbGwgd2l0aCB0aGUgbGFzdCBlbGVtZW50IGluIHRoZSBzZXQuICovXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGZpbmFsRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdEZpbmFsQ2FsbGJhY2tzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlZGlyZWN0T3B0aW9ucy52aXNpYmlsaXR5ID09PSBcImhpZGRlblwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRzLnZpc2liaWxpdHkgPSByZWRpcmVjdE9wdGlvbnMudmlzaWJpbGl0eTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIFZlbG9jaXR5LmFuaW1hdGUoZWxlbWVudCwgcHJvcGVydHlNYXAsIG9wdHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8qIFJldHVybiB0aGUgVmVsb2NpdHkgb2JqZWN0IHNvIHRoYXQgUmVnaXN0ZXJVSSBjYWxscyBjYW4gYmUgY2hhaW5lZC4gKi9cbiAgICAgICAgcmV0dXJuIFZlbG9jaXR5O1xuICAgIH07XG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgUGFja2FnZWQgRWZmZWN0c1xuICAgICoqKioqKioqKioqKioqKioqKioqKi9cblxuICAgIC8qIEV4dGVybmFsaXplIHRoZSBwYWNrYWdlZEVmZmVjdHMgZGF0YSBzbyB0aGF0IHRoZXkgY2FuIG9wdGlvbmFsbHkgYmUgbW9kaWZpZWQgYW5kIHJlLXJlZ2lzdGVyZWQuICovXG4gICAgLyogU3VwcG9ydDogPD1JRTg6IENhbGxvdXRzIHdpbGwgaGF2ZSBubyBlZmZlY3QsIGFuZCB0cmFuc2l0aW9ucyB3aWxsIHNpbXBseSBmYWRlIGluL291dC4gSUU5L0FuZHJvaWQgMi4zOiBNb3N0IGVmZmVjdHMgYXJlIGZ1bGx5IHN1cHBvcnRlZCwgdGhlIHJlc3QgZmFkZSBpbi9vdXQuIEFsbCBvdGhlciBicm93c2VyczogZnVsbCBzdXBwb3J0LiAqL1xuICAgIFZlbG9jaXR5LlJlZ2lzdGVyRWZmZWN0LnBhY2thZ2VkRWZmZWN0cyA9XG4gICAgICAgIHtcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcImNhbGxvdXQuYm91bmNlXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDU1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWTogLTMwIH0sIDAuMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVk6IDAgfSwgMC4xMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVk6IC0xNSB9LCAwLjEyNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWTogMCB9LCAwLjI1IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwiY2FsbG91dC5zaGFrZVwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVg6IC0xMSB9LCAwLjEyNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWDogMTEgfSwgMC4xMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVg6IC0xMSB9LCAwLjEyNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWDogMTEgfSwgMC4xMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVg6IC0xMSB9LCAwLjEyNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWDogMTEgfSwgMC4xMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVg6IC0xMSB9LCAwLjEyNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWDogMCB9LCAwLjEyNSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcImNhbGxvdXQuZmxhc2hcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogMTEwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCBcImVhc2VJbk91dFF1YWRcIiwgMSBdIH0sIDAuMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgXCJlYXNlSW5PdXRRdWFkXCIgXSB9LCAwLjI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIFwiZWFzZUluT3V0UXVhZFwiIF0gfSwgMC4yNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCBcImVhc2VJbk91dFF1YWRcIiBdIH0sIDAuMjUgXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJjYWxsb3V0LnB1bHNlXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgyNSxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgc2NhbGVYOiAxLjEsIHNjYWxlWTogMS4xIH0sIDAuNTAsIHsgZWFzaW5nOiBcImVhc2VJbkV4cG9cIiB9IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBzY2FsZVg6IDEsIHNjYWxlWTogMSB9LCAwLjUwIF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwiY2FsbG91dC5zd2luZ1wiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA5NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IHJvdGF0ZVo6IDE1IH0sIDAuMjAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHJvdGF0ZVo6IC0xMCB9LCAwLjIwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyByb3RhdGVaOiA1IH0sIDAuMjAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHJvdGF0ZVo6IC01IH0sIDAuMjAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHJvdGF0ZVo6IDAgfSwgMC4yMCBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcImNhbGxvdXQudGFkYVwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiAxMDAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBzY2FsZVg6IDAuOSwgc2NhbGVZOiAwLjksIHJvdGF0ZVo6IC0zIH0sIDAuMTAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHNjYWxlWDogMS4xLCBzY2FsZVk6IDEuMSwgcm90YXRlWjogMyB9LCAwLjEwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBzY2FsZVg6IDEuMSwgc2NhbGVZOiAxLjEsIHJvdGF0ZVo6IC0zIH0sIDAuMTAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyBcInJldmVyc2VcIiwgMC4xMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyBcInJldmVyc2VcIiwgMC4xMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyBcInJldmVyc2VcIiwgMC4xMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyBcInJldmVyc2VcIiwgMC4xMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyBcInJldmVyc2VcIiwgMC4xMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHNjYWxlWDogMSwgc2NhbGVZOiAxLCByb3RhdGVaOiAwIH0sIDAuMjAgXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uZmFkZUluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDUwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0gfSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5mYWRlT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDUwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0gfSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uZmxpcFhJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA3MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyA4MDAsIDgwMCBdLCByb3RhdGVZOiBbIDAsIC01NSBdIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uZmxpcFhPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNzAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgODAwLCA4MDAgXSwgcm90YXRlWTogNTUgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCwgcm90YXRlWTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5mbGlwWUluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDgwMCwgODAwIF0sIHJvdGF0ZVg6IFsgMCwgLTQ1IF0gfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5mbGlwWU91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyA4MDAsIDgwMCBdLCByb3RhdGVYOiAyNSB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwLCByb3RhdGVYOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5mbGlwQm91bmNlWEluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDkwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLjcyNSwgMCBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyA0MDAsIDQwMCBdLCByb3RhdGVZOiBbIC0xMCwgOTAgXSB9LCAwLjUwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiAwLjgwLCByb3RhdGVZOiAxMCB9LCAwLjI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiAxLCByb3RhdGVZOiAwIH0sIDAuMjUgXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmZsaXBCb3VuY2VYT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLjksIDEgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgNDAwLCA0MDAgXSwgcm90YXRlWTogLTEwIH0sIDAuNTAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IDAsIHJvdGF0ZVk6IDkwIH0sIDAuNTAgXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAsIHJvdGF0ZVk6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmZsaXBCb3VuY2VZSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAuNzI1LCAwIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDQwMCwgNDAwIF0sIHJvdGF0ZVg6IFsgLTEwLCA5MCBdIH0sIDAuNTAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IDAuODAsIHJvdGF0ZVg6IDEwIH0sIDAuMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IDEsIHJvdGF0ZVg6IDAgfSwgMC4yNSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uZmxpcEJvdW5jZVlPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAuOSwgMSBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyA0MDAsIDQwMCBdLCByb3RhdGVYOiAtMTUgfSwgMC41MCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogMCwgcm90YXRlWDogOTAgfSwgMC41MCBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCwgcm90YXRlWDogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogTWFnaWMuY3NzICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc3dvb3BJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIFwiMTAwJVwiLCBcIjUwJVwiIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgXCIxMDAlXCIsIFwiMTAwJVwiIF0sIHNjYWxlWDogWyAxLCAwIF0sIHNjYWxlWTogWyAxLCAwIF0sIHRyYW5zbGF0ZVg6IFsgMCwgLTcwMCBdLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtT3JpZ2luWDogXCI1MCVcIiwgdHJhbnNmb3JtT3JpZ2luWTogXCI1MCVcIiB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogTWFnaWMuY3NzICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc3dvb3BPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyBcIjUwJVwiLCBcIjEwMCVcIiBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIFwiMTAwJVwiLCBcIjEwMCVcIiBdLCBzY2FsZVg6IDAsIHNjYWxlWTogMCwgdHJhbnNsYXRlWDogLTcwMCwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybU9yaWdpblg6IFwiNTAlXCIsIHRyYW5zZm9ybU9yaWdpblk6IFwiNTAlXCIsIHNjYWxlWDogMSwgc2NhbGVZOiAxLCB0cmFuc2xhdGVYOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBNYWdpYy5jc3MgKi9cbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMy4gKEZhZGVzIGFuZCBzY2FsZXMgb25seS4pICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24ud2hpcmxJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIFwiNTAlXCIsIFwiNTAlXCIgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyBcIjUwJVwiLCBcIjUwJVwiIF0sIHNjYWxlWDogWyAxLCAwIF0sIHNjYWxlWTogWyAxLCAwIF0sIHJvdGF0ZVk6IFsgMCwgMTYwIF0gfSwgMSwgeyBlYXNpbmc6IFwiZWFzZUluT3V0U2luZVwiIH0gXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBNYWdpYy5jc3MgKi9cbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMy4gKEZhZGVzIGFuZCBzY2FsZXMgb25seS4pICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24ud2hpcmxPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNzUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIFwiZWFzZUluT3V0UXVpbnRcIiwgMSBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIFwiNTAlXCIsIFwiNTAlXCIgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyBcIjUwJVwiLCBcIjUwJVwiIF0sIHNjYWxlWDogMCwgc2NhbGVZOiAwLCByb3RhdGVZOiAxNjAgfSwgMSwgeyBlYXNpbmc6IFwic3dpbmdcIiB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHNjYWxlWDogMSwgc2NhbGVZOiAxLCByb3RhdGVZOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2hyaW5rSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNzUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyBcIjUwJVwiLCBcIjUwJVwiIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgXCI1MCVcIiwgXCI1MCVcIiBdLCBzY2FsZVg6IFsgMSwgMS41IF0sIHNjYWxlWTogWyAxLCAxLjUgXSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNocmlua091dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA2MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIFwiNTAlXCIsIFwiNTAlXCIgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyBcIjUwJVwiLCBcIjUwJVwiIF0sIHNjYWxlWDogMS4zLCBzY2FsZVk6IDEuMywgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHNjYWxlWDogMSwgc2NhbGVZOiAxIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uZXhwYW5kSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNzAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyBcIjUwJVwiLCBcIjUwJVwiIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgXCI1MCVcIiwgXCI1MCVcIiBdLCBzY2FsZVg6IFsgMSwgMC42MjUgXSwgc2NhbGVZOiBbIDEsIDAuNjI1IF0sIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5leHBhbmRPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNzAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyBcIjUwJVwiLCBcIjUwJVwiIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgXCI1MCVcIiwgXCI1MCVcIiBdLCBzY2FsZVg6IDAuNSwgc2NhbGVZOiAwLjUsIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyBzY2FsZVg6IDEsIHNjYWxlWTogMSB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5ib3VuY2VJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCBzY2FsZVg6IFsgMS4wNSwgMC4zIF0sIHNjYWxlWTogWyAxLjA1LCAwLjMgXSB9LCAwLjQwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBzY2FsZVg6IDAuOSwgc2NhbGVZOiAwLjksIHRyYW5zbGF0ZVo6IDAgfSwgMC4yMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgc2NhbGVYOiAxLCBzY2FsZVk6IDEgfSwgMC41MCBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uYm91bmNlT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgc2NhbGVYOiAwLjk1LCBzY2FsZVk6IDAuOTUgfSwgMC4zNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgc2NhbGVYOiAxLjEsIHNjYWxlWTogMS4xLCB0cmFuc2xhdGVaOiAwIH0sIDAuMzUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCBzY2FsZVg6IDAuMywgc2NhbGVZOiAwLjMgfSwgMC4zMCBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyBzY2FsZVg6IDEsIHNjYWxlWTogMSB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5ib3VuY2VVcEluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zbGF0ZVk6IFsgLTMwLCAxMDAwIF0gfSwgMC42MCwgeyBlYXNpbmc6IFwiZWFzZU91dENpcmNcIiB9IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVZOiAxMCB9LCAwLjIwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVZOiAwIH0sIDAuMjAgXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmJvdW5jZVVwT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDEwMDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVk6IDIwIH0sIDAuMjAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgXCJlYXNlSW5DaXJjXCIsIDEgXSwgdHJhbnNsYXRlWTogLTEwMDAgfSwgMC44MCBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2xhdGVZOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmJvdW5jZURvd25JblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2xhdGVZOiBbIDMwLCAtMTAwMCBdIH0sIDAuNjAsIHsgZWFzaW5nOiBcImVhc2VPdXRDaXJjXCIgfSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWTogLTEwIH0sIDAuMjAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVk6IDAgfSwgMC4yMCBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uYm91bmNlRG93bk91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiAxMDAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVZOiAtMjAgfSwgMC4yMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCBcImVhc2VJbkNpcmNcIiwgMSBdLCB0cmFuc2xhdGVZOiAxMDAwIH0sIDAuODAgXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNsYXRlWTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5ib3VuY2VMZWZ0SW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNzUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNsYXRlWDogWyAzMCwgLTEyNTAgXSB9LCAwLjYwLCB7IGVhc2luZzogXCJlYXNlT3V0Q2lyY1wiIH0gXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVg6IC0xMCB9LCAwLjIwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVYOiAwIH0sIDAuMjAgXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmJvdW5jZUxlZnRPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNzUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVYOiAzMCB9LCAwLjIwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIFwiZWFzZUluQ2lyY1wiLCAxIF0sIHRyYW5zbGF0ZVg6IC0xMjUwIH0sIDAuODAgXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNsYXRlWDogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5ib3VuY2VSaWdodEluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDc1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zbGF0ZVg6IFsgLTMwLCAxMjUwIF0gfSwgMC42MCwgeyBlYXNpbmc6IFwiZWFzZU91dENpcmNcIiB9IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVYOiAxMCB9LCAwLjIwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVYOiAwIH0sIDAuMjAgXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmJvdW5jZVJpZ2h0T3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDc1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWDogLTMwIH0sIDAuMjAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgXCJlYXNlSW5DaXJjXCIsIDEgXSwgdHJhbnNsYXRlWDogMTI1MCB9LCAwLjgwIF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zbGF0ZVg6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZVVwSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogOTAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNsYXRlWTogWyAwLCAyMCBdLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVVcE91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA5MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2xhdGVZOiAtMjAsIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2xhdGVZOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVEb3duSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogOTAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNsYXRlWTogWyAwLCAtMjAgXSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlRG93bk91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA5MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2xhdGVZOiAyMCwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zbGF0ZVk6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZUxlZnRJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiAxMDAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNsYXRlWDogWyAwLCAtMjAgXSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlTGVmdE91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiAxMDUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNsYXRlWDogLTIwLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNsYXRlWDogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlUmlnaHRJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiAxMDAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNsYXRlWDogWyAwLCAyMCBdLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVSaWdodE91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiAxMDUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNsYXRlWDogMjAsIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2xhdGVYOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVVcEJpZ0luXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDg1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zbGF0ZVk6IFsgMCwgNzUgXSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlVXBCaWdPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNsYXRlWTogLTc1LCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNsYXRlWTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlRG93bkJpZ0luXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDg1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zbGF0ZVk6IFsgMCwgLTc1IF0sIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZURvd25CaWdPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNsYXRlWTogNzUsIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2xhdGVZOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVMZWZ0QmlnSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNsYXRlWDogWyAwLCAtNzUgXSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlTGVmdEJpZ091dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA3NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2xhdGVYOiAtNzUsIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2xhdGVYOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVSaWdodEJpZ0luXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zbGF0ZVg6IFsgMCwgNzUgXSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlUmlnaHRCaWdPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNzUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNsYXRlWDogNzUsIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2xhdGVYOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBNYWdpYy5jc3MgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5wZXJzcGVjdGl2ZVVwSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgODAwLCA4MDAgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyAwLCAwIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgXCIxMDAlXCIsIFwiMTAwJVwiIF0sIHJvdGF0ZVg6IFsgMCwgLTE4MCBdIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAsIHRyYW5zZm9ybU9yaWdpblg6IFwiNTAlXCIsIHRyYW5zZm9ybU9yaWdpblk6IFwiNTAlXCIgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIE1hZ2ljLmNzcyAqL1xuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5wZXJzcGVjdGl2ZVVwT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDg1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDgwMCwgODAwIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgMCwgMCBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIFwiMTAwJVwiLCBcIjEwMCVcIiBdLCByb3RhdGVYOiAtMTgwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAsIHRyYW5zZm9ybU9yaWdpblg6IFwiNTAlXCIsIHRyYW5zZm9ybU9yaWdpblk6IFwiNTAlXCIsIHJvdGF0ZVg6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIE1hZ2ljLmNzcyAqL1xuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5wZXJzcGVjdGl2ZURvd25JblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyA4MDAsIDgwMCBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIDAsIDAgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyAwLCAwIF0sIHJvdGF0ZVg6IFsgMCwgMTgwIF0gfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCwgdHJhbnNmb3JtT3JpZ2luWDogXCI1MCVcIiwgdHJhbnNmb3JtT3JpZ2luWTogXCI1MCVcIiB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogTWFnaWMuY3NzICovXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnBlcnNwZWN0aXZlRG93bk91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyA4MDAsIDgwMCBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIDAsIDAgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyAwLCAwIF0sIHJvdGF0ZVg6IDE4MCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwLCB0cmFuc2Zvcm1PcmlnaW5YOiBcIjUwJVwiLCB0cmFuc2Zvcm1PcmlnaW5ZOiBcIjUwJVwiLCByb3RhdGVYOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBNYWdpYy5jc3MgKi9cbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24ucGVyc3BlY3RpdmVMZWZ0SW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogOTUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgMjAwMCwgMjAwMCBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIDAsIDAgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyAwLCAwIF0sIHJvdGF0ZVk6IFsgMCwgLTE4MCBdIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAsIHRyYW5zZm9ybU9yaWdpblg6IFwiNTAlXCIsIHRyYW5zZm9ybU9yaWdpblk6IFwiNTAlXCIgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIE1hZ2ljLmNzcyAqL1xuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5wZXJzcGVjdGl2ZUxlZnRPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogOTUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgMjAwMCwgMjAwMCBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIDAsIDAgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyAwLCAwIF0sIHJvdGF0ZVk6IC0xODAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCwgdHJhbnNmb3JtT3JpZ2luWDogXCI1MCVcIiwgdHJhbnNmb3JtT3JpZ2luWTogXCI1MCVcIiwgcm90YXRlWTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogTWFnaWMuY3NzICovXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnBlcnNwZWN0aXZlUmlnaHRJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA5NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyAyMDAwLCAyMDAwIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgXCIxMDAlXCIsIFwiMTAwJVwiIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgMCwgMCBdLCByb3RhdGVZOiBbIDAsIDE4MCBdIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAsIHRyYW5zZm9ybU9yaWdpblg6IFwiNTAlXCIsIHRyYW5zZm9ybU9yaWdpblk6IFwiNTAlXCIgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIE1hZ2ljLmNzcyAqL1xuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5wZXJzcGVjdGl2ZVJpZ2h0T3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDk1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDIwMDAsIDIwMDAgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyBcIjEwMCVcIiwgXCIxMDAlXCIgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyAwLCAwIF0sIHJvdGF0ZVk6IDE4MCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwLCB0cmFuc2Zvcm1PcmlnaW5YOiBcIjUwJVwiLCB0cmFuc2Zvcm1PcmlnaW5ZOiBcIjUwJVwiLCByb3RhdGVZOiAwIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgIC8qIFJlZ2lzdGVyIHRoZSBwYWNrYWdlZCBlZmZlY3RzLiAqL1xuICAgIGZvciAodmFyIGVmZmVjdE5hbWUgaW4gVmVsb2NpdHkuUmVnaXN0ZXJFZmZlY3QucGFja2FnZWRFZmZlY3RzKSB7XG4gICAgICAgIFZlbG9jaXR5LlJlZ2lzdGVyRWZmZWN0KGVmZmVjdE5hbWUsIFZlbG9jaXR5LlJlZ2lzdGVyRWZmZWN0LnBhY2thZ2VkRWZmZWN0c1tlZmZlY3ROYW1lXSk7XG4gICAgfVxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKlxuICAgICAgIFNlcXVlbmNlIFJ1bm5pbmdcbiAgICAqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gICAgLyogTm90ZTogU2VxdWVuY2UgY2FsbHMgbXVzdCB1c2UgVmVsb2NpdHkncyBzaW5nbGUtb2JqZWN0IGFyZ3VtZW50cyBzeW50YXguICovXG4gICAgVmVsb2NpdHkuUnVuU2VxdWVuY2UgPSBmdW5jdGlvbiAob3JpZ2luYWxTZXF1ZW5jZSkge1xuICAgICAgICB2YXIgc2VxdWVuY2UgPSAkLmV4dGVuZCh0cnVlLCBbXSwgb3JpZ2luYWxTZXF1ZW5jZSk7XG5cbiAgICAgICAgaWYgKHNlcXVlbmNlLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICQuZWFjaChzZXF1ZW5jZS5yZXZlcnNlKCksIGZ1bmN0aW9uKGksIGN1cnJlbnRDYWxsKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5leHRDYWxsID0gc2VxdWVuY2VbaSArIDFdO1xuXG4gICAgICAgICAgICAgICAgaWYgKG5leHRDYWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qIFBhcmFsbGVsIHNlcXVlbmNlIGNhbGxzIChpbmRpY2F0ZWQgdmlhIHNlcXVlbmNlUXVldWU6ZmFsc2UpIGFyZSB0cmlnZ2VyZWRcbiAgICAgICAgICAgICAgICAgICAgICAgaW4gdGhlIHByZXZpb3VzIGNhbGwncyBiZWdpbiBjYWxsYmFjay4gT3RoZXJ3aXNlLCBjaGFpbmVkIGNhbGxzIGFyZSBub3JtYWxseSB0cmlnZ2VyZWRcbiAgICAgICAgICAgICAgICAgICAgICAgaW4gdGhlIHByZXZpb3VzIGNhbGwncyBjb21wbGV0ZSBjYWxsYmFjay4gKi9cbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRDYWxsT3B0aW9ucyA9IGN1cnJlbnRDYWxsLm8gfHwgY3VycmVudENhbGwub3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRDYWxsT3B0aW9ucyA9IG5leHRDYWxsLm8gfHwgbmV4dENhbGwub3B0aW9ucztcblxuICAgICAgICAgICAgICAgICAgICB2YXIgdGltaW5nID0gKGN1cnJlbnRDYWxsT3B0aW9ucyAmJiBjdXJyZW50Q2FsbE9wdGlvbnMuc2VxdWVuY2VRdWV1ZSA9PT0gZmFsc2UpID8gXCJiZWdpblwiIDogXCJjb21wbGV0ZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tPcmlnaW5hbCA9IG5leHRDYWxsT3B0aW9ucyAmJiBuZXh0Q2FsbE9wdGlvbnNbdGltaW5nXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB7fTtcblxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zW3RpbWluZ10gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXh0Q2FsbEVsZW1lbnRzID0gbmV4dENhbGwuZSB8fCBuZXh0Q2FsbC5lbGVtZW50cztcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IG5leHRDYWxsRWxlbWVudHMubm9kZVR5cGUgPyBbIG5leHRDYWxsRWxlbWVudHMgXSA6IG5leHRDYWxsRWxlbWVudHM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrT3JpZ2luYWwgJiYgY2FsbGJhY2tPcmlnaW5hbC5jYWxsKGVsZW1lbnRzLCBlbGVtZW50cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBWZWxvY2l0eShjdXJyZW50Q2FsbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dENhbGwubykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dENhbGwubyA9ICQuZXh0ZW5kKHt9LCBuZXh0Q2FsbE9wdGlvbnMsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dENhbGwub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBuZXh0Q2FsbE9wdGlvbnMsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNlcXVlbmNlLnJldmVyc2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIFZlbG9jaXR5KHNlcXVlbmNlWzBdKTtcbiAgICB9O1xufSgod2luZG93LmpRdWVyeSB8fCB3aW5kb3cuWmVwdG8gfHwgd2luZG93KSwgd2luZG93LCBkb2N1bWVudCk7XG59KSk7IiwiLyogZ2xvYmFsIG0gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG5cdGdhbWVWaWV3TW9kZWwgPSByZXF1aXJlKCcuLy4uL21vZGVscy9nYW1lLXZtJyk7XG5cbnZhciBHYW1lQ29udHJvbGxlciA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMuVk0gPSBuZXcgZ2FtZVZpZXdNb2RlbCgpO1xuXHR0aGlzLlZNLmluaXQoKTtcbn07XG5cbi8qXG5cdFB1YmxpYyBNZW1iZXJzXG4qL1xuXG5HYW1lQ29udHJvbGxlci5wcm90b3R5cGUucmVhZHkgPSBmdW5jdGlvbigpe1xuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5WTS5zdGFydEdhbWUoKTtcblx0XHRtLnJlZHJhdygpO1xuXHR9LmJpbmQodGhpcyksIDEwMDApO1xufTtcblxuR2FtZUNvbnRyb2xsZXIucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uKGFucyl7XG5cdGlmKHRoaXMuVk0ubG9ja2VkKCkpIHJldHVybjtcblxuXHR2YXIgYW5zd2VySXNTZWxlY3RlZCA9IGFucy5zZWxlY3RlZCgpO1xuXHRpZih0aGlzLlZNLnF1ZXN0aW9uKCkuZ3Vlc3NMaW1pdFJlYWNoZWQoKSAmJiAhYW5zd2VySXNTZWxlY3RlZCl7XG5cdFx0YW5zLnRvZ2dsZVJlamVjdGVkKHRydWUpO1xuXHR9IGVsc2Uge1xuXHRcdGFucy5zZWxlY3RlZCghYW5zLnNlbGVjdGVkKCkpO1xuXHRcdGFucy50b2dnbGVkKHRydWUpO1xuXHRcdC8vIGNvdW50IHRoZSBndWVzc2VzIGFnYWluXG5cdFx0dGhpcy5WTS5xdWVzdGlvbigpLmNvdW50R3Vlc3MoKTtcblx0fVxuXHRtLnJlZHJhdygpO1xufTtcblxuR2FtZUNvbnRyb2xsZXIucHJvdG90eXBlLm9uVGltZSA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5WTS5sb2NrZWQodHJ1ZSk7XG4gICAgdGhpcy5WTS5lbmRRdWVzdGlvbih0cnVlKTtcbiAgICBtLnJlZHJhdygpO1xufTtcblxuR2FtZUNvbnRyb2xsZXIucHJvdG90eXBlLm9uSW1hZ2VTaG93biA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5WTS5xdWVzdGlvbigpLmltYWdlU2hvd24odHJ1ZSk7XG4gICAgdGhpcy5WTS5xdWVzdGlvbigpLm5leHRRdWVzdGlvblRleHQoKTtcbiAgICBtLnJlZHJhdygpO1xufTtcblxuR2FtZUNvbnRyb2xsZXIucHJvdG90eXBlLmFmdGVyRW5kUXVlc3Rpb24gPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuVk0uc3RvcFF1ZXN0aW9uKCk7XG4gICAgbS5yZWRyYXcoKTtcbiAgICB0aGlzLlZNLm5leHRRdWVzdGlvbigpO1xuICAgIG0ucmVkcmF3KCk7XG59O1xuXG4vKlxuXHRTdGFydCB0aGUgdGltZXIgb2ZmIGFuZCBiZWdpbiB0aGUgcXVlc3Rpb25cbiovXG5HYW1lQ29udHJvbGxlci5wcm90b3R5cGUuc3RhcnRRdWVzdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5WTS5xdWVzdGlvblNob3duKHRydWUpO1xuICAgIHRoaXMuVk0uc3RhcnRRdWVzdGlvbigpO1xuICAgIG0ucmVkcmF3KCk7XG59O1xuXG5HYW1lQ29udHJvbGxlci5wcm90b3R5cGUuZW5kR2FtZSA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMuVk0udXBkYXRlU2NvcmUoKTtcblx0bS5yb3V0ZShcIi9yZXN1bHRcIik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVDb250cm9sbGVyOyIsIi8qIGdsb2JhbCBtICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRpbnRyb1ZpZXdNb2RlbCA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2ludHJvLXZtJyk7XG5cbnZhciBJbnRyb0NvbnRyb2xsZXIgPSBmdW5jdGlvbigpe1xuXHR0aGlzLlZNID0gbmV3IGludHJvVmlld01vZGVsKCk7XG5cdHRoaXMuVk0uaW5pdCgpO1xufTtcblxuLypcblx0UHVibGljIE1lbWJlcnNcbiovXG5JbnRyb0NvbnRyb2xsZXIucHJvdG90eXBlLm9uQmVnaW4gPSBmdW5jdGlvbigpe1xuXHRtLnJlZHJhdygpO1xufTtcblxuSW50cm9Db250cm9sbGVyLnByb3RvdHlwZS5zdGFydEdhbWUgPSBmdW5jdGlvbigpe1xuXHRtLnJvdXRlKFwiL2dhbWVcIik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludHJvQ29udHJvbGxlcjsiLCIvKiBnbG9iYWwgbSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcblx0bG9hZGluZ1ZpZXdNb2RlbCA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2xvYWRpbmctdm0nKTtcblxudmFyIExvYWRpbmdDb250cm9sbGVyID0gZnVuY3Rpb24oKXtcblx0dGhpcy5WTSA9IG5ldyBsb2FkaW5nVmlld01vZGVsKCk7XG5cdHRoaXMuVk0uaW5pdCgpO1xufTtcblxuLypcblx0UHVibGljIE1lbWJlcnNcbiovXG5Mb2FkaW5nQ29udHJvbGxlci5wcm90b3R5cGUub25sb2FkZWQgPSBmdW5jdGlvbigpe1xuXHRtLnJvdXRlKFwiL2ludHJvXCIpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb2FkaW5nQ29udHJvbGxlcjsiLCIvKiBnbG9iYWwgbSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcblx0cmVzdWx0Vmlld01vZGVsID0gcmVxdWlyZSgnLi8uLi9tb2RlbHMvcmVzdWx0LXZtJyk7XG5cbnZhciBSZXN1bHRDb250cm9sbGVyID0gZnVuY3Rpb24oKXtcblx0dGhpcy5WTSA9IG5ldyByZXN1bHRWaWV3TW9kZWwoKTtcblx0dGhpcy5WTS5pbml0KCk7XG59O1xuXG4vKlxuXHRQdWJsaWMgTWVtYmVyc1xuKi9cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlc3VsdENvbnRyb2xsZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcblx0VmVsb2NpdHkgPSByZXF1aXJlKCd2ZWxvY2l0eS1hbmltYXRlJyksXG5cdHYgPSByZXF1aXJlKCd2ZWxvY2l0eS1hbmltYXRlL3ZlbG9jaXR5LnVpJyksXG5cdGdhbWVDb250cm9sbGVyID0gcmVxdWlyZSgnLi4vY29udHJvbGxlcnMvZ2FtZS1jb250cm9sbGVyJyksXG5cdGdhbWVWaWV3ID0gcmVxdWlyZSgnLi4vdmlld3MvZ2FtZS12aWV3JyksXG5cdHJlc3VsdENvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9jb250cm9sbGVycy9yZXN1bHQtY29udHJvbGxlcicpLFxuXHRyZXN1bHRWaWV3ID0gcmVxdWlyZSgnLi4vdmlld3MvcmVzdWx0LXZpZXcnKSxcblx0aW50cm9Db250cm9sbGVyID0gcmVxdWlyZSgnLi4vY29udHJvbGxlcnMvaW50cm8tY29udHJvbGxlcicpLFxuXHRpbnRyb1ZpZXcgPSByZXF1aXJlKCcuLi92aWV3cy9pbnRyby12aWV3JyksXG5cdGxvYWRpbmdDb250cm9sbGVyID0gcmVxdWlyZSgnLi4vY29udHJvbGxlcnMvbG9hZGluZy1jb250cm9sbGVyJyksXG5cdGxvYWRpbmdWaWV3ID0gcmVxdWlyZSgnLi4vdmlld3MvbG9hZGluZy12aWV3Jyk7XG5cbnZhciBhcHBsaWNhdGlvbiA9IGZ1bmN0aW9uKCl7XG5cdC8vaW5pdGlhbGl6ZSB0aGUgYXBwbGljYXRpb25cblx0dmFyIGFwcCA9IHtcblx0XHRsb2FkaW5nIDogeyBjb250cm9sbGVyOiBsb2FkaW5nQ29udHJvbGxlciwgdmlldzogbG9hZGluZ1ZpZXcgfSxcblx0XHRpbnRybyAgIDogeyBjb250cm9sbGVyOiBpbnRyb0NvbnRyb2xsZXIsICAgdmlldzogaW50cm9WaWV3IH0sXG5cdFx0Z2FtZVx0OiB7IGNvbnRyb2xsZXI6IGdhbWVDb250cm9sbGVyLCB2aWV3OiBnYW1lVmlldyB9LFxuXHRcdHJlc3VsdCAgOiB7IGNvbnRyb2xsZXI6IHJlc3VsdENvbnRyb2xsZXIsIHZpZXc6IHJlc3VsdFZpZXcgfSxcblx0fVxuXG5cdG0ucm91dGUubW9kZSA9IFwiaGFzaFwiO1xuXG5cdG0ucm91dGUoZG9jdW1lbnQuYm9keSwgXCIvXCIsIHtcblx0ICAgIFwiXCJcdFx0IDogYXBwLmxvYWRpbmcsXG5cdCAgICBcIi9pbnRyb1wiIDogYXBwLmludHJvLFxuXHQgICAgXCIvZ2FtZVwiICA6IGFwcC5nYW1lLFxuXHQgICAgXCIvcmVzdWx0XCI6IGFwcC5yZXN1bHRcblx0fSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFwcGxpY2F0aW9uOyIsIid1c2Ugc3RyaWN0Jztcbi8qIEdsb2JhbCBtb2R1bGUgKi9cblxudmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKSxcblx0bSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG52YXIgX251bWJlcmVkU3RyaW5nID0gZnVuY3Rpb24odGFyZ2V0KXtcblx0dmFyIGluZGV4ID0gMDtcblx0cmV0dXJuIHRhcmdldC5yZXBsYWNlKC9gKC4qPylgL2csIGZ1bmN0aW9uIChtYXRjaCwgdGV4dCwgbnVtYmVyKSB7XG4gICAgICAgIHZhciByZXMgPSAneycgKyBpbmRleCArICd9JztcbiAgICAgICAgaW5kZXgrK1xuICAgICAgICByZXR1cm4gcmVzO1xuICBcdH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cblx0cmVsYXRpdmVUaW1lIDogZnVuY3Rpb24ocHJldmlvdXMpe1xuXHRcdHZhciBtc1Blck1pbnV0ZSA9IDYwICogMTAwMDtcblx0ICAgIHZhciBtc1BlckhvdXIgPSBtc1Blck1pbnV0ZSAqIDYwO1xuXHQgICAgdmFyIG1zUGVyRGF5ID0gbXNQZXJIb3VyICogMjQ7XG5cdCAgICB2YXIgbXNQZXJNb250aCA9IG1zUGVyRGF5ICogMzA7XG5cdCAgICB2YXIgbXNQZXJZZWFyID0gbXNQZXJEYXkgKiAzNjU7XG5cblx0ICAgIHZhciBlbGFwc2VkID0gRGF0ZS5ub3coKSAtIHByZXZpb3VzO1xuXG5cdCAgICBpZiAoZWxhcHNlZCA8IG1zUGVyTWludXRlKSB7XG5cdCAgICAgICAgIHJldHVybiBNYXRoLnJvdW5kKGVsYXBzZWQvMTAwMCkgKyAnIHNlY29uZHMgYWdvJztcblx0ICAgIH1cblx0ICAgIGVsc2UgaWYgKGVsYXBzZWQgPCBtc1BlckhvdXIpIHtcblx0ICAgICAgICAgcmV0dXJuIE1hdGgucm91bmQoZWxhcHNlZC9tc1Blck1pbnV0ZSkgKyAnIG1pbnV0ZXMgYWdvJztcblx0ICAgIH1cblx0ICAgIGVsc2UgaWYgKGVsYXBzZWQgPCBtc1BlckRheSApIHtcblx0ICAgICAgICAgcmV0dXJuIE1hdGgucm91bmQoZWxhcHNlZC9tc1BlckhvdXIgKSArICcgaG91cnMgYWdvJztcblx0ICAgIH1cblx0ICAgIGVsc2UgaWYgKGVsYXBzZWQgPCBtc1Blck1vbnRoKSB7XG5cdCAgICAgICAgcmV0dXJuIE1hdGgucm91bmQoZWxhcHNlZC9tc1BlckRheSkgKyAnIGRheXMgYWdvJztcblx0ICAgIH1cblx0ICAgIGVsc2UgaWYgKGVsYXBzZWQgPCBtc1BlclllYXIpIHtcblx0ICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChlbGFwc2VkL21zUGVyTW9udGgpICsgJyBtb250aHMgYWdvJztcblx0ICAgIH1cblx0ICAgIGVsc2Uge1xuXHQgICAgICAgIHJldHVybiBNYXRoLnJvdW5kKGVsYXBzZWQvbXNQZXJZZWFyICkgKyAnIHllYXJzIGFnbyc7XG5cdCAgICB9XG5cdH0sXG5cblx0Lypcblx0XHRSZXBsYWNlcyBzdHJpbmcgd2l0aCBcIl9ib2xkXyBub3JtYWxcIiB0ZXh0IHRvIG1pdGhyaWwgQXJyYXlcblx0Ki9cblx0c2hvcnRoYW5kVG9NaXRocmlsQXJyYXkgOiBmdW5jdGlvbih0YXJnZXQpe1xuXG5cdFx0aWYoIXRhcmdldCB8fCB0YXJnZXQubGVuZ3RoID09PSAwKSByZXR1cm4gW107XG5cblx0XHR2YXIga2V5d29yZE1lbWJlcnMgPSB0YXJnZXQubWF0Y2goL2AoLio/KWAvZyksXG5cdFx0XHRudW1iZXJEZWxpbWl0ZXJlZFN0cmluZyA9IF9udW1iZXJlZFN0cmluZyh0YXJnZXQpLFxuXHRcdFx0dGFyZ2V0QXJyYXkgPSBfLndpdGhvdXQobnVtYmVyRGVsaW1pdGVyZWRTdHJpbmcuc3BsaXQoL3soXFxkKyl9LyksIFwiXCIpO1xuXG5cdFx0XG5cdFx0Zm9yICh2YXIgaSA9IDAsIGogPSB0YXJnZXRBcnJheS5sZW5ndGg7IGkgPCBqOyBpKyspIHtcblx0XHRcdHZhciB0ID0gK3RhcmdldEFycmF5W2ldO1xuXHRcdFx0aWYodCA+PSAwKSB0YXJnZXRBcnJheVtpXSA9IG0oJ3NwYW4nLCBrZXl3b3JkTWVtYmVyc1t0XS5yZXBsYWNlKC9gL2csICcnKSk7ICAgIHRoaXMuZ3Vlc3NlcyA9IG0ucHJvcCgwKTtcblxuXHRcdH07XG5cblx0XHRyZXR1cm4gdGFyZ2V0QXJyYXk7XG5cblx0fVxuXG59OyIsIid1c2Ugc3RyaWN0Jztcbi8qIEdsb2JhbCBtb2R1bGUgKi9cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5cbnZhciBDT05TVF9LRVkgPSAnc2hvdy1zdGFyLWJldGEnO1xuXG4vKlxuXHRZb3Ugd291bGQgb2J0YWluIHRoaXMgYnkgeGhyXG4qL1xudmFyIGRhdGEgPSB7XG5cdHRpdGxlIDogXCJTaG93IFN0YXJcIixcblx0ZGVzY3JpcHRpb24gOiBcIkNhbiB5b3UgbWF0Y2ggdGhlIGFjdG9yIHRvIHRoZSBzaG93IGluIHRpbWU/XCIsXG5cdHRpbWVyIDogNSxcblx0YXNzZXRzIDogW1xuXHRcdCB7IG5hbWUgOiAnYnJhbmQnLCBcdCAgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovYTViZjYyYWMtM2U1Zi00NmZhLTliNTktNTljMDliYzAzZDNlLnBuZycgfSxcblx0XHQgeyBuYW1lIDogJ3Bvc2l0aXZlJywgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovMjg5ZTk1M2ItYThiOS00ZThiLTg5ZDUtMTc2OWUxZmIxNjhiLnBuZycgfSxcblx0XHQgeyBuYW1lIDogJ21vZGVyYXRlJywgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovZmZmYzRmZTctMmUxMi00M2MyLTg1MmMtZDYwYzdkNGZiNWEyLnBuZycgfSxcblx0XHQgeyBuYW1lIDogJ25lZ2F0aXZlJywgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovNzVmYjMwOTEtNTc0Yy00ODYzLWJmMjEtMGVhMTgyNWM0ODUzLnBuZycgfSxcblx0XHQgeyBuYW1lIDogJ3Ryb3BoeScsICAgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovOWVjZGEyZTItNmQwOS00OGRkLWExNjYtMzJlYzIzMmJkYjhiLnBuZycgfVxuXHRdLFxuXHRxdWVzdGlvbnMgOltcblx0e1xuXHRcdHF1ZXN0aW9uIDogW1wiVGFrZSBhIGxvb2sgYXQgdGhpcyBzY2VuZSBmcm9tIGBDb21tdW5pdHlgXCIsIFwiQ2hvb3NlIGAyIEFjdG9yc2Agd2hpY2ggYXBwZWFyZWQgaW4gdGhhdCBzY2VuZS5cIl0sXG5cdFx0dHlwZSA6IFwiaW1hZ2VcIixcblx0XHRpbWFnZSA6IFtcImh0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzVjMTgwZmNkLTQ2YzQtNDE2Mi05OTc5LTVlNWNlNjAwYTZiMi5qcGdcIl0sXG5cdFx0YW5zd2VycyAgOiBbXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzAzODMzYTgxLTdhYTctNGMzYi04ODRmLTE2NzI3N2IxOWMyNC5wbmcnLCBuYW1lIDogJ1l2ZXR0ZSBOaWNvbGUgQnJvd24nLCBjb3JyZWN0IDogdHJ1ZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei85ODliYmU0OS03NTNlLTQyMzQtODg1ZC0xOTI5MzE0YTM3MWUucG5nJywgbmFtZSA6ICdGcmFuayBBYmFnbmFsZSBqcicsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei8yOTQ4MTgyYi1mYTc1LTQzZmYtOTYxZi01OWU2MzYwNWFlMzgucG5nJywgbmFtZSA6ICdLdW1haWwgTmFuamlhbmknLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovNjNjMzFkOGQtMjU1NC00MjMwLWEwMDYtMWRmNzc2NjA2MGE3LnBuZycsIG5hbWUgOiAnQ2hldnkgQ2hhc2UnLCBjb3JyZWN0IDogdHJ1ZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9jZjNmN2UxNy1iODUwLTRhMTItOGRhNi04Y2Q1YWFkNGE1YmEucG5nJywgbmFtZSA6ICdBbG9tb2EgV3JpZ2h0JywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2ZjMjYzMGRjLWIzN2UtNDIwMy05OWM1LTBjODM3MGFmMTFhYi5wbmcnLCBuYW1lIDogJ0tlbiBKZW5raW5zJywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2M3NjYzNjAxLTMzNTItNGMxMS1hYWQ2LTQ3NWQwOTY4NDAxMS5wbmcnLCBuYW1lIDogJ1phY2sgQnJhZmYnLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovNTI5NmJjZDAtNmY2YS00MWM5LWJlMjctYjdhMWUwYmVhNDU4LnBuZycsIG5hbWUgOiAnSm9lbCBNY0hhbGUnLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovNWQ5YzlmYzgtNjA2ZS00ODRhLWI0ZmQtZWIwZTBiZGM0NDk3LnBuZycsIG5hbWUgOiAnRGVtaSBNb29yZScsIGNvcnJlY3QgOiBmYWxzZSB9XG5cdFx0XVxuXHR9LFxuXHR7XG5cdFx0cXVlc3Rpb24gOiBbXCJMYWRpZXMgYW5kIEdlbnRsZW1lbiwgYFJvYiBCdXJndW5keWBcIiwgXCJGaW5pc2ggdGhlIHF1b3RlLiBJJ20gaW4gYSBgX2AgY2FnZSBvZiBgX2BcIl0sXG5cdFx0dHlwZSA6IFwiaW1hZ2VcIixcblx0XHRpbWFnZSA6IFtcImh0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2JiMjc2ZjExLTNmMGQtNDg0ZC1iZGJhLTBhMDIyMDEwZWNlMy5qcGdcIl0sXG5cdFx0YW5zd2VycyAgOiBbXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzAzODMzYTgxLTdhYTctNGMzYi04ODRmLTE2NzI3N2IxOWMyNC5wbmcnLCBuYW1lIDogJycsIGNvcnJlY3QgOiB0cnVlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96Lzk4OWJiZTQ5LTc1M2UtNDIzNC04ODVkLTE5MjkzMTRhMzcxZS5wbmcnLCBuYW1lIDogJycsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei8yOTQ4MTgyYi1mYTc1LTQzZmYtOTYxZi01OWU2MzYwNWFlMzgucG5nJywgbmFtZSA6ICcnLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovNjNjMzFkOGQtMjU1NC00MjMwLWEwMDYtMWRmNzc2NjA2MGE3LnBuZycsIG5hbWUgOiAnJywgY29ycmVjdCA6IHRydWUgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovY2YzZjdlMTctYjg1MC00YTEyLThkYTYtOGNkNWFhZDRhNWJhLnBuZycsIG5hbWUgOiAnJywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2ZjMjYzMGRjLWIzN2UtNDIwMy05OWM1LTBjODM3MGFmMTFhYi5wbmcnLCBuYW1lIDogJycsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9jNzY2MzYwMS0zMzUyLTRjMTEtYWFkNi00NzVkMDk2ODQwMTEucG5nJywgbmFtZSA6ICcnLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovNTI5NmJjZDAtNmY2YS00MWM5LWJlMjctYjdhMWUwYmVhNDU4LnBuZycsIG5hbWUgOiAnJywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzVkOWM5ZmM4LTYwNmUtNDg0YS1iNGZkLWViMGUwYmRjNDQ5Ny5wbmcnLCBuYW1lIDogJycsIGNvcnJlY3QgOiBmYWxzZSB9XG5cdFx0XVxuXHR9LFxuXHR7XG5cdFx0cXVlc3Rpb24gOiBbXCJgQ2hvb3NlIDNgIG9mIHRoZSBmb2xsb3dpbmcgYXBwZWFyZWQgaW4gdGhlIDkwJ3Mgc2l0Y29tIGBGcmllbmRzYFwiXSxcblx0XHR0eXBlIDogJ3N0YW5kYXJkJyxcblx0XHRhbnN3ZXJzICA6IFtcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovY2E1MTEwMzAtZjc3ZS00NmRmLWExYTktMTA1ODYyODRhMzhiLnBuZycsIG5hbWUgOiAnTGlzYSBLdWRyb3cnLCBjb3JyZWN0IDogdHJ1ZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9iMzNjYjI2Mi1lMTc1LTQ0ZjQtYTU4ZS00MjUyMzM5MWZiNWQucG5nJywgbmFtZSA6ICdNYXR0IExlIEJsYW5jJywgY29ycmVjdCA6IHRydWUgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovMGU4MzFlOGMtOGQ2MC00M2VhLWFiN2QtOWJiZmQ0ZmZiM2FkLnBuZycsIG5hbWUgOiAnRG9uYWxkIEdsb3ZlcicsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei85MmUwYjQ1Yi00MDRmLTQ0MTctOGIwNi04OGUxMDc5YmFlZDcucG5nJywgbmFtZSA6ICdXYXluZSBLbmlnaHQnLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovNWQ5YzlmYzgtNjA2ZS00ODRhLWI0ZmQtZWIwZTBiZGM0NDk3LnBuZycsIG5hbWUgOiAnRGVtaSBNb29yZScsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei80MGU4MDM3ZS0xMmIyLTQ0ZDMtOWY4NC03MWZlM2RlMGJkYWYucG5nJywgbmFtZSA6ICdNaWNoYWVsIFJpY2hhcmRzJywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzY0YjgwYTMwLTU3YTYtNDkyOC1hODA1LTcwYmMzODY0MTAxOC5wbmcnLCBuYW1lIDogJ0plc3NpY2EgV2VzdGZlbGR0JywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzRiYzA3NzZlLTFjZjgtNGIxMi04ODFiLWY3MTU0MzQzZGJlNC5wbmcnLCBuYW1lIDogJ0plbm5pZmVyIEFuaXN0b24nLCBjb3JyZWN0IDogdHJ1ZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9iM2Y5MWE2My1lOTg3LTRlYTctODFhYi01ODZmOTMwNjEwYWUucG5nJywgbmFtZSA6ICdKYXNvbiBBbGV4YW5kZXInLCBjb3JyZWN0IDogZmFsc2UgfVxuXHRcdF1cblx0fSxcblx0e1xuXHRcdHF1ZXN0aW9uIDogW1wiR29pbmcgYmFjayBhIGxpdHRsZSBmdXJ0aGVyLCBgQ2hvb3NlIDNgIHdobyBzdGFycmVkIGluIHRoZSBjdWx0IGNsYXNzaWMgYFNlaW5mZWxkYD9cIl0sXG5cdFx0dHlwZSA6ICdzdGFuZGFyZCcsXG5cdFx0YW5zd2VycyAgOiBbXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzIxZDlhMDU1LWIxYzYtNGQ0ZC1hNGI2LTUxMzE5ZmM2NTE2NS5wbmcnLCBuYW1lIDogJ0RhdmlkIFNjaHdpbW1lcicsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9jYTUxMTAzMC1mNzdlLTQ2ZGYtYTFhOS0xMDU4NjI4NGEzOGIucG5nJywgbmFtZSA6ICdMaXNhIEt1ZHJvdycsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9iMzNjYjI2Mi1lMTc1LTQ0ZjQtYTU4ZS00MjUyMzM5MWZiNWQucG5nJywgbmFtZSA6ICdNYXR0IExlIEJsYW5jJywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2U3N2I2NjE3LWY1NDMtNDZjYi1iNDM1LTM3YjZiMWE0NDJkNy5wbmcnLCBuYW1lIDogJ0NvdXJ0bmV5IENveC1BcnF1ZXR0ZScsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei85MmUwYjQ1Yi00MDRmLTQ0MTctOGIwNi04OGUxMDc5YmFlZDcucG5nJywgbmFtZSA6ICdXYXluZSBLbmlnaHQnLCBjb3JyZWN0IDogdHJ1ZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei8zYTZlZWFkMy05MGNjLTQwNmMtOTllMS00OTM5MjNiM2U4ZDAucG5nJywgbmFtZSA6ICdNYXR0aGV3IFBlcnJ5JywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzQwZTgwMzdlLTEyYjItNDRkMy05Zjg0LTcxZmUzZGUwYmRhZi5wbmcnLCBuYW1lIDogJ01pY2hhZWwgUmljaGFyZHMnLCBjb3JyZWN0IDogdHJ1ZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei8xYjU5YzQ0NS04ZjNlLTQ2YmQtYWQ1Ny1jMTVhNzNjN2E2OGEucG5nJywgbmFtZSA6ICdQYXVsIFdhc2lsZXdza2knLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovYjNmOTFhNjMtZTk4Ny00ZWE3LTgxYWItNTg2ZjkzMDYxMGFlLnBuZycsIG5hbWUgOiAnSmFzb24gQWxleGFuZGVyJywgY29ycmVjdCA6IHRydWUgfVxuXHRcdF1cblx0fSxcblx0e1xuXHRcdHF1ZXN0aW9uIDogW1wiTm93IGBTY3J1YnNgIGdpdmUgbWUgYDRgXCJdLFxuXHRcdHR5cGUgOiAnc3RhbmRhcmQnLFxuXHRcdGFuc3dlcnMgIDogW1xuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei82M2MzMWQ4ZC0yNTU0LTQyMzAtYTAwNi0xZGY3NzY2MDYwYTcucG5nJywgbmFtZSA6ICdDaGV2eSBDaGFzZScsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9mYzI2MzBkYy1iMzdlLTQyMDMtOTljNS0wYzgzNzBhZjExYWIucG5nJywgbmFtZSA6ICdLZW4gSmVua2lucycsIGNvcnJlY3QgOiB0cnVlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzI5NDgxODJiLWZhNzUtNDNmZi05NjFmLTU5ZTYzNjA1YWUzOC5wbmcnLCBuYW1lIDogJ0t1bWFpbCBOYW5qaWFuaScsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9jYTUxMTAzMC1mNzdlLTQ2ZGYtYTFhOS0xMDU4NjI4NGEzOGIucG5nJywgbmFtZSA6ICdMaXNhIEt1ZHJvdycsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9jZjNmN2UxNy1iODUwLTRhMTItOGRhNi04Y2Q1YWFkNGE1YmEucG5nJywgbmFtZSA6ICdBbG9tb2EgV3JpZ2h0JywgY29ycmVjdCA6IHRydWUgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovZmY5OWNlZmUtM2MwMC00Nzg1LWJkNWItZTRhNzZjNjZjOTFiLnBuZycsIG5hbWUgOiAnU2FyYWggQ2hhbGtlJywgY29ycmVjdCA6IHRydWUgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovOTMzNTAyOTEtMzBlMi00NDAzLWFmYmQtOTczMDliMzU0ZjU5LnBuZycsIG5hbWUgOiAnVEogTWlsbGVyJywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2M3NjYzNjAxLTMzNTItNGMxMS1hYWQ2LTQ3NWQwOTY4NDAxMS5wbmcnLCBuYW1lIDogJ1phY2sgQnJhZmYnLCBjb3JyZWN0IDogdHJ1ZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9mMGFhNDg3Yy00YjJlLTQ3MzUtYjk2My1jNzQ1ZWUxZjcxMjUucG5nJywgbmFtZSA6ICdaYWNoIFdvb2RzJywgY29ycmVjdCA6IGZhbHNlIH1cblx0XHRdXG5cdH0sXG5cdHtcblx0XHRxdWVzdGlvbiA6IFtcIkdldHRpbmcgYSBsaXR0bGUgbW9yZSBtb2Rlcm4sIGBDaG9vc2UgNWAgZnJvbSBIQk8ncyBgU2lsaWNvbiBWYWxsZXlgXCJdLFxuXHRcdHR5cGUgOiAnc3RhbmRhcmQnLFxuXHRcdGFuc3dlcnMgIDogW1xuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9mMGFhNDg3Yy00YjJlLTQ3MzUtYjk2My1jNzQ1ZWUxZjcxMjUucG5nJywgbmFtZSA6ICdaYWNoIFdvb2RzJywgY29ycmVjdCA6IHRydWUgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovOTg5YmJlNDktNzUzZS00MjM0LTg4NWQtMTkyOTMxNGEzNzFlLnBuZycsIG5hbWUgOiAnRnJhbmsgQWJhZ25hbGUganInLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovYTZiMjhiZTYtZDBmOS00ZGUwLTkwOWYtNTBiMDIxYTYyODhhLnBuZycsIG5hbWUgOiAnTWFydGluIFN0YXJyJywgY29ycmVjdCA6IHRydWUgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovMjk0ODE4MmItZmE3NS00M2ZmLTk2MWYtNTllNjM2MDVhZTM4LnBuZycsIG5hbWUgOiAnS3VtYWlsIE5hbmppYW5pJywgY29ycmVjdCA6IHRydWUgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovY2YzZjdlMTctYjg1MC00YTEyLThkYTYtOGNkNWFhZDRhNWJhLnBuZycsIG5hbWUgOiAnQWxvbW9hIFdyaWdodCcsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9mYzI2MzBkYy1iMzdlLTQyMDMtOTljNS0wYzgzNzBhZjExYWIucG5nJywgbmFtZSA6ICdLZW4gSmVua2lucycsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9jNzY2MzYwMS0zMzUyLTRjMTEtYWFkNi00NzVkMDk2ODQwMTEucG5nJywgbmFtZSA6ICdaYWNrIEJyYWZmJywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzkzMzUwMjkxLTMwZTItNDQwMy1hZmJkLTk3MzA5YjM1NGY1OS5wbmcnLCBuYW1lIDogJ1RKIE1pbGxlcicsIGNvcnJlY3QgOiB0cnVlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzAzMzc2MDA0LWVkMWMtNDA2MS1hNTQxLTgwYjE4ZTY2YTQ1ZC5wbmcnLCBuYW1lIDogJ1Rob21hcyBNaWRkbGVkaXRjaCcsIGNvcnJlY3QgOiB0cnVlIH1cblx0XHRdXG5cdH1cblx0XSxcblx0cmVzdWx0TWVzc2FnZXMgOiB7XG5cdFx0MjAgIDogXCJPaCBvaOKApi50aGluayB5b3UgbmVlZCB0byBzcGVuZCBzb21lIHRpbWUgb24gdGhlIGNvdWNoIHRoaXMgd2Vla2VuZCwgaG9uaW5nIGluIG9uIHlvdXIgVFYgc2tpbGxzIVwiLFxuXHRcdDQwICA6IFwiUHJldHR5IGdvb2QsIGFsdGhvdWdoIHRoZSBwcmVzc3VyZSBtdXN0IGhhdmUgZ290IHRoZSBiZXN0IG9mIHlvdeKAplRyeSBhZ2FpbiFcIixcblx0XHQ2MCAgOiBcIkdyZWF0IGVmZm9ydCEgWW914oCZcmUgbmVhcmx5IGFtYXppbmfigKZuZWFybHnigKYud2h5IGRvbuKAmXQgeW91IGFzayB0aGUgSG9tZSBPZiBDb21lZHkgVFYgUm9vbSBmb3Igc29tZSBoZWxwPyBDbGljayBoZXJlIG9yIHRyeSB5b3VyIGx1Y2sgYWdhaW4gYW5kIHBsYXkgYWdhaW4hXCIsXG5cdFx0ODAgIDogXCJBbWF6aW5nIFN0dWZmIC0geW91IGFyZSBhdCB0aGUgdG9wIG9mIHRoZSBsZWFkZXJib2FyZCEgTmVhciBwZXJmZWN0ISBCZSBwZXJmZWN04oCmUGxheSBhZ2FpbiFcIixcblx0XHQxMDAgOiBcIkdlbml1c+KApi4ueW91IGtub3cgeW91ciBUVi4gTGV04oCZcyBzZWUgaG93IHlvdSBnbyBvbiBMZXZlbCAyXCJcblx0fSxcblx0ZW5kTWVzc2FnZSA6IFwiSXMgdGhpcyB0aGUgYmVzdCB5b3UgY2FuIGRvPy4uLi4gR28gb24sIHRyeSBhZ2FpbiBvciByYWlzZSB0aGUgc3Rha2VzIGFuZCB0cnkgb3V0IHRoZSBuZXh0IGxldmVsIVwiXG59O1xuXG5cbnZhciBfZ2V0TWF4U2NvcmUgPSBmdW5jdGlvbigpe1xuXHR2YXIgc2NvcmUgPSAwO1xuXHRfLmVhY2goZGF0YS5xdWVzdGlvbnMsIGZ1bmN0aW9uKHEpe1xuXHRcdHNjb3JlICs9IF8uZmlsdGVyKHEuYW5zd2VycywgeyBjb3JyZWN0IDogdHJ1ZSB9KS5sZW5ndGg7XG5cdH0pO1xuXHRyZXR1cm4gc2NvcmU7XG59O1xuXG52YXIgX2hhc0xvY2FsU3RvcmFnZSA9IGZ1bmN0aW9uKCl7XG5cdHZhciBtb2QgPSAneHgnO1xuXHR0cnkge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShtb2QsIG1vZCk7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKG1vZCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufTtcblxudmFyIF90cnlQYXJzZSA9IGZ1bmN0aW9uKHRhcmdldCl7XG5cdHZhciByZXN1bHQgPSBbXTtcblx0dHJ5IHtcblx0XHRyZXR1cm4gSlNPTi5wYXJzZSh0YXJnZXQpIHx8IHJlc3VsdDtcblx0fSBjYXRjaChlKSB7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxufTtcblxudmFyIF9nZXRQcmV2aW91c1Njb3JlcyA9IGZ1bmN0aW9uKCl7XG5cdGlmKCFfaGFzTG9jYWxTdG9yYWdlKCkpIHJldHVybiBbXTtcblx0cmV0dXJuIF90cnlQYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShDT05TVF9LRVkpKTtcbn07XG5cbi8qXG5cdENvbnN0cnVjdG9yXG4qL1xudmFyIEdhbWVNb2RlbCA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMuc2NvcmUgXHRcdD0gbS5wcm9wKDApO1xuXHR0aGlzLmhpZ2hTY29yZSAgPSBtLnByb3AoX2dldE1heFNjb3JlKCkpO1xuXHR0aGlzLnF1ZXN0aW9uc1x0PSBtLnByb3AoZGF0YS5xdWVzdGlvbnMpO1xuXHR0aGlzLmFzc2V0cyAgICAgPSBtLnByb3AoZGF0YS5hc3NldHMpO1xuXHR0aGlzLnRpdGxlXHRcdD0gbS5wcm9wKGRhdGEudGl0bGUpO1xuXHR0aGlzLnJlc3VsdE1lc3NhZ2VzID0gbS5wcm9wKGRhdGEucmVzdWx0TWVzc2FnZXMpO1xuXHR0aGlzLmRlc2NyaXB0aW9uID0gbS5wcm9wKGRhdGEuZGVzY3JpcHRpb24pO1xuXHR0aGlzLmVuZE1lc3NhZ2UgPSBtLnByb3AoZGF0YS5lbmRNZXNzYWdlKTtcblx0dGhpcy50aW1lciA9IG0ucHJvcChkYXRhLnRpbWVyIHx8IDUpO1xuXHR0aGlzLnByZXZpb3VzU2NvcmVzID0gbS5wcm9wKF9nZXRQcmV2aW91c1Njb3JlcygpKTtcbn07XG5cbi8qXG5cdFB1YmxpYyBNZW1iZXJzXG4qL1xuXG5HYW1lTW9kZWwucHJvdG90eXBlLnNhdmVTY29yZSA9IGZ1bmN0aW9uKHNjb3JlKXtcblx0XG5cdHRoaXMuc2NvcmUoc2NvcmUpO1xuXG5cdC8vIFVwZGF0ZSBwcmV2aW91cyBzY29yZXMgc2V0dGluZyB0aGUgbGF0ZXN0IHNjb3JlIGFzIG9ubHkgb25lIG9mIHRoYXQgc2NvcmVcblx0dmFyIHByZXZpb3VzU2NvcmVzID0gdGhpcy5wcmV2aW91c1Njb3JlcygpLFxuXHRcdG5ld1Njb3JlID0geyBkYXRlIDogRGF0ZS5ub3coKSwgc2NvcmUgOiBzY29yZSB9O1xuXHRwcmV2aW91c1Njb3JlcyA9IF8ud2l0aG91dChwcmV2aW91c1Njb3JlcywgXy5maW5kV2hlcmUocHJldmlvdXNTY29yZXMsIHsgc2NvcmUgOiBzY29yZSB9KSk7XG5cdHByZXZpb3VzU2NvcmVzLnB1c2gobmV3U2NvcmUpO1xuXHR0aGlzLnByZXZpb3VzU2NvcmVzKHByZXZpb3VzU2NvcmVzKTtcblxuXHQvLyBzYXZlIGluIGxvY2FsIHN0b3JhZ2Ugd2hlcmUgYXZhaWxhYmxlXG5cdGlmKCEgX2hhc0xvY2FsU3RvcmFnZSgpKSByZXR1cm47XG5cdGxvY2FsU3RvcmFnZS5zZXRJdGVtKENPTlNUX0tFWSwgSlNPTi5zdHJpbmdpZnkodGhpcy5wcmV2aW91c1Njb3JlcygpKSk7XG59O1xuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgR2FtZU1vZGVsKCk7XG5cblxuXG4iLCIndXNlIHN0cmljdCc7XG4vKiBHbG9iYWwgbW9kdWxlICovXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuICAgIF8gPSByZXF1aXJlKCdsb2Rhc2gnKSxcbiAgICB1dGlscyA9IHJlcXVpcmUoJy4vLi4vbGlicy91dGlscycpLFxuICAgIEdhbWVNb2RlbCA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2dhbWUtbW9kZWwnKTtcblxudmFyIEFuc3dlciA9IGZ1bmN0aW9uKGQpe1xuICAgIHRoaXMuaW1hZ2UgPSBtLnByb3AoZC5pbWFnZSk7XG4gICAgdGhpcy5uYW1lID0gbS5wcm9wKGQubmFtZSk7XG4gICAgdGhpcy5zZWxlY3RlZCA9IG0ucHJvcChmYWxzZSk7XG4gICAgdGhpcy5jb3JyZWN0ID0gbS5wcm9wKGQuY29ycmVjdCk7XG4gICAgXG4gICAgLy8gdmlldyBtYXJrZXJzXG4gICAgdGhpcy50b2dnbGVkID0gbS5wcm9wKGZhbHNlKTtcbiAgICB0aGlzLnRvZ2dsZVJlamVjdGVkID0gbS5wcm9wKGZhbHNlKTtcbn07XG5cbkFuc3dlci5wcm90b3R5cGUuZ2V0U2NvcmUgPSBmdW5jdGlvbigpe1xuICAgIHZhciBzY29yZSA9IDA7XG4gICAgaWYodGhpcy5zZWxlY3RlZCgpICYmIHRoaXMuY29ycmVjdCgpKSBzY29yZSA9IDE7XG4gICAgcmV0dXJuIHNjb3JlO1xufTtcblxudmFyIFF1ZXN0aW9uID0gZnVuY3Rpb24oZCl7XG4gICAgdGhpcy50ZXh0ID0gbS5wcm9wKGQucXVlc3Rpb24pO1xuICAgIHRoaXMucXVlc3Rpb25UZXh0ID0gZC5xdWVzdGlvbjtcbiAgICB0aGlzLmFuc3dlcnMgPSBtLnByb3AoXy5tYXAoZC5hbnN3ZXJzLCBmdW5jdGlvbihhKXtcbiAgICAgICAgcmV0dXJuIG5ldyBBbnN3ZXIoYSk7XG4gICAgfSkpO1xuICAgIHRoaXMuZ3Vlc3NlcyA9IG0ucHJvcCgwKTtcbiAgICB0aGlzLnR5cGUgPSBtLnByb3AoZC50eXBlKTtcbiAgICB0aGlzLmxpbWl0ID0gbS5wcm9wKF8uZmlsdGVyKGQuYW5zd2VycywgeyBjb3JyZWN0IDogdHJ1ZSB9KS5sZW5ndGgpO1xuICAgIFxuICAgIC8vIHNldHVwXG4gICAgdGhpcy5uZXh0UXVlc3Rpb25UZXh0KCk7XG4gICAgdGhpcy5tYXJrZXJzRm9yVHlwZShkKTtcbn07XG5cblF1ZXN0aW9uLnByb3RvdHlwZS5tYXJrZXJzRm9yVHlwZSA9IGZ1bmN0aW9uKGQpe1xuICAgIHN3aXRjaCh0aGlzLnR5cGUoKSl7XG4gICAgICAgIGNhc2UgXCJpbWFnZVwiIDpcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VTaG93biA9IG0ucHJvcChmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLnNjZW5lSW1hZ2UgPSBtLnByb3AoZC5pbWFnZVswXSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbn07XG5cblF1ZXN0aW9uLnByb3RvdHlwZS5uZXh0UXVlc3Rpb25UZXh0ID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLnF1ZXN0aW9uRWxlbWVudCA9IG0ucHJvcCh1dGlscy5zaG9ydGhhbmRUb01pdGhyaWxBcnJheSh0aGlzLnF1ZXN0aW9uVGV4dC5zaGlmdCgpKSk7XG59O1xuXG5RdWVzdGlvbi5wcm90b3R5cGUuZ3Vlc3NMaW1pdFJlYWNoZWQgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLmd1ZXNzZXMoKSA9PT0gdGhpcy5saW1pdCgpO1xufTtcblxuUXVlc3Rpb24ucHJvdG90eXBlLmNvdW50R3Vlc3MgPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuZ3Vlc3NlcyhfLmZpbHRlcih0aGlzLmFuc3dlcnMoKSwgZnVuY3Rpb24oYW5zKXtcbiAgICAgICAgcmV0dXJuIGFucy5zZWxlY3RlZCgpO1xuICAgIH0pLmxlbmd0aCk7XG59O1xuXG52YXIgVGltZXIgPSBmdW5jdGlvbih0aW1lKXtcbiAgICB0aGlzLmlzQWN0aXZlID0gbS5wcm9wKGZhbHNlKTtcbiAgICB0aGlzLnRpbWUgPSBtLnByb3AodGltZSAqIDEwMDApO1xufTtcbiAgICBcbi8qXG4gICAgQ29uc3RydWN0b3JcbiovXG5cbnZhciBHYW1lVk0gPSBmdW5jdGlvbigpe307XG5cblxuLypcbiAgICBQcml2YXRlIE1lbWJlcnNcbiovXG5cbnZhciBfY2xlYXJRdWVzdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIG5ldyBRdWVzdGlvbih7IHF1ZXN0aW9uIDogW10sIGFuc3dlcnMgOiBbXSB9KTtcbn07XG5cbi8vIFlvdSBjYW4gZ2V0IG5lZ2F0aXZlIHNjb3JlcyEhXG52YXIgX3VwZGF0ZVNjb3JlID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgY3VycmVudFNjb3JlID0gdGhpcy5jdXJyZW50U2NvcmUoKSxcbiAgICAgICAgc2NvcmUgPSAwO1xuXG4gICAgXy5lYWNoKHRoaXMucXVlc3Rpb24oKS5hbnN3ZXJzKCksIGZ1bmN0aW9uKGFucyl7XG4gICAgICAgIHNjb3JlICs9IGFucy5nZXRTY29yZSgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5jdXJyZW50U2NvcmUoY3VycmVudFNjb3JlICsgc2NvcmUpO1xufTtcblxudmFyIF9zZXRDdXJyZW50UXVlc3Rpb24gPSBmdW5jdGlvbigpe1xuICAgIHZhciBxID0gbmV3IFF1ZXN0aW9uKHRoaXMucXVlc3Rpb25zKClbdGhpcy5jdXJyZW50UXVlc3Rpb24oKV0pO1xuICAgIHRoaXMucXVlc3Rpb24ocSk7XG59O1xuXG52YXIgX25leHRRdWVzdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGN1cnJlbnQgPSB0aGlzLmN1cnJlbnRRdWVzdGlvbigpICsgMSxcbiAgICAgICAgaXNFbmQgPSBjdXJyZW50ID09PSB0aGlzLnRvdGFsUXVlc3Rpb25zKCk7XG5cbiAgICB0aGlzLmdhbWVPdmVyKGlzRW5kKTtcbiAgICBpZighIGlzRW5kKSB7XG4gICAgICAgIHRoaXMucXVlc3Rpb25TaG93bihmYWxzZSk7XG4gICAgICAgIHRoaXMuY3VycmVudFF1ZXN0aW9uKGN1cnJlbnQpO1xuICAgICAgICBfc2V0Q3VycmVudFF1ZXN0aW9uLmNhbGwodGhpcyk7XG4gICAgfVxufTtcblxuXG5cbi8qXG4gICAgUHVibGljIE1lbWJlcnNcbiovXG5HYW1lVk0ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpe1xuICAgIHZhciBxdWVzdGlvbnMgPSBHYW1lTW9kZWwucXVlc3Rpb25zKCk7XG4gICAgdGhpcy5jdXJyZW50UXVlc3Rpb24gPSBtLnByb3AoMCk7XG4gICAgdGhpcy5jdXJyZW50U2NvcmUgPSBtLnByb3AoMCk7XG4gICAgdGhpcy50aW1lciA9IG0ucHJvcChudWxsKTtcbiAgICB0aGlzLnF1ZXN0aW9ucyA9IG0ucHJvcChxdWVzdGlvbnMpO1xuICAgIHRoaXMudG90YWxRdWVzdGlvbnMgPSBtLnByb3AocXVlc3Rpb25zLmxlbmd0aCk7XG4gICAgdGhpcy5nYW1lT3ZlciA9IG0ucHJvcChmYWxzZSk7XG4gICAgdGhpcy5xdWVzdGlvbiA9IG0ucHJvcChfY2xlYXJRdWVzdGlvbigpKTtcbiAgICBcbiAgICAvLyBWaWV3IFF1ZXVlcyBcbiAgICB0aGlzLmxvY2tlZCA9IG0ucHJvcCh0cnVlKTtcbiAgICB0aGlzLnF1ZXN0aW9uU2hvd24gPSBtLnByb3AoZmFsc2UpO1xuICAgIHRoaXMuZW5kUXVlc3Rpb24gPSBtLnByb3AoZmFsc2UpO1xufTtcblxuR2FtZVZNLnByb3RvdHlwZS5zdGFydEdhbWUgPSBmdW5jdGlvbigpe1xuICAgIF9zZXRDdXJyZW50UXVlc3Rpb24uY2FsbCh0aGlzKTtcbn07XG5cbkdhbWVWTS5wcm90b3R5cGUuc3RvcFF1ZXN0aW9uID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmVuZFF1ZXN0aW9uKGZhbHNlKTtcbiAgICBfdXBkYXRlU2NvcmUuY2FsbCh0aGlzKTtcbiAgICB0aGlzLnF1ZXN0aW9uKF9jbGVhclF1ZXN0aW9uKCkpO1xufTtcblxuR2FtZVZNLnByb3RvdHlwZS5uZXh0UXVlc3Rpb24gPSBmdW5jdGlvbigpe1xuICAgIF9uZXh0UXVlc3Rpb24uY2FsbCh0aGlzKTtcbn07XG5cbkdhbWVWTS5wcm90b3R5cGUudXBkYXRlU2NvcmUgPSBmdW5jdGlvbigpe1xuICAgIEdhbWVNb2RlbC5zYXZlU2NvcmUodGhpcy5jdXJyZW50U2NvcmUoKSk7XG59O1xuXG5HYW1lVk0ucHJvdG90eXBlLnN0YXJ0UXVlc3Rpb24gPSBmdW5jdGlvbigpe1xuICAgIHRoaXMudGltZXIobmV3IFRpbWVyKEdhbWVNb2RlbC50aW1lcigpKSk7XG4gICAgdGhpcy5sb2NrZWQoZmFsc2UpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBHYW1lVk07IiwiJ3VzZSBzdHJpY3QnO1xuLyogR2xvYmFsIG1vZHVsZSAqL1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcblx0XyA9IHJlcXVpcmUoJ2xvZGFzaCcpLFxuICAgIEdhbWVNb2RlbCA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2dhbWUtbW9kZWwnKTtcblxudmFyIEludHJvVk0gPSBmdW5jdGlvbigpe307XG5cbi8qXG4gICAgUHVibGljIE1lbWJlcnNcbiovXG5JbnRyb1ZNLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLnRpdGxlID0gbS5wcm9wKEdhbWVNb2RlbC50aXRsZSgpKTtcbiAgICB0aGlzLmRlc2NyaXB0aW9uID0gbS5wcm9wKEdhbWVNb2RlbC5kZXNjcmlwdGlvbigpKTtcbiAgICB0aGlzLmJlZ2luID0gbS5wcm9wKGZhbHNlKTtcbiAgICB0aGlzLmJyYW5kID0gbS5wcm9wKF8uZmluZFdoZXJlKEdhbWVNb2RlbC5hc3NldHMoKSwgeyBuYW1lIDogJ2JyYW5kJyB9KS5pbWFnZSk7XG4gICAgdGhpcy5iZWdpbiA9IG0ucHJvcChmYWxzZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludHJvVk07IiwiJ3VzZSBzdHJpY3QnO1xuLyogR2xvYmFsIG1vZHVsZSAqL1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcbiAgICBfICA9IHJlcXVpcmUoJ2xvZGFzaCcpLFxuICAgIEdhbWVNb2RlbCA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2dhbWUtbW9kZWwnKTtcblxudmFyIExvYWRpbmdWTSA9IGZ1bmN0aW9uKCl7fTtcblxuLypcbiAgICBQcmVsb2FkIGltYWdlc1xuKi9cbnZhciBfcHJlbG9hZCA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHRhcmdldHMgPSB0aGlzLnRhcmdldHMoKSxcbiAgICAgICAgdGFyZ2V0Q291bnQgPSB0YXJnZXRzLmxlbmd0aDtcblxuICAgIHZhciBfX29uTG9hZCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBsb2FkZWQgPSB0aGlzLnRhcmdldHNMb2FkZWQoKSArIDE7XG4gICAgICAgIHRoaXMudGFyZ2V0c0xvYWRlZChsb2FkZWQpO1xuICAgICAgICB0aGlzLnByb2dyZXNzKE1hdGgucm91bmQoKGxvYWRlZCAvIHRhcmdldENvdW50KSAqIDEwMCkpO1xuICAgICAgICB0aGlzLmxvYWRlZCh0aGlzLnByb2dyZXNzKCkgPT09IDEwMCk7XG4gICAgICAgIG0ucmVkcmF3KCk7XG4gICAgfTtcblxuICAgIGZvciAodmFyIGkgPSB0YXJnZXRDb3VudCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIHZhciBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICBpbWFnZS5vbmxvYWQgPSBfX29uTG9hZC5iaW5kKHRoaXMpO1xuICAgICAgICBpbWFnZS5zcmMgPSB0YXJnZXRzW2ldO1xuICAgIH1cbn07XG5cbi8qXG4gICAgUHVibGljIE1lbWJlcnNcbiovXG5Mb2FkaW5nVk0ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpe1xuICAgIHZhciBxdWVzdGlvbnMgPSBHYW1lTW9kZWwucXVlc3Rpb25zKCksXG4gICAgICAgIGFzc2V0cyA9IEdhbWVNb2RlbC5hc3NldHMoKSxcbiAgICAgICAgZW50aXRpZXMgPSBbXTtcblxuICAgIF8uZWFjaChxdWVzdGlvbnMsIGZ1bmN0aW9uKHEpe1xuICAgICAgICBlbnRpdGllcyA9IF8udW5pb24oZW50aXRpZXMsIF8ucGx1Y2socS5hbnN3ZXJzLCAnaW1hZ2UnKSk7XG4gICAgICAgIGlmKHEuaW1hZ2UpIGVudGl0aWVzID0gXy51bmlvbihlbnRpdGllcywgcS5pbWFnZSk7XG4gICAgfSk7XG4gICAgZW50aXRpZXMgPSBfLnVuaW9uKGVudGl0aWVzLCBfLnBsdWNrKGFzc2V0cywgJ2ltYWdlJykpO1xuXG4gICAgdGhpcy5sb2FkZWQgPSBtLnByb3AoZmFsc2UpO1xuICAgIHRoaXMucHJvZ3Jlc3MgPSBtLnByb3AoMCk7XG4gICAgdGhpcy50YXJnZXRzID0gbS5wcm9wKGVudGl0aWVzKTtcbiAgICB0aGlzLnRhcmdldHNMb2FkZWQgPSBtLnByb3AoMCk7XG4gICAgX3ByZWxvYWQuY2FsbCh0aGlzKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTG9hZGluZ1ZNOyIsIid1c2Ugc3RyaWN0Jztcbi8qIEdsb2JhbCBtb2R1bGUgKi9cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG5cdF8gPSByZXF1aXJlKCdsb2Rhc2gnKSxcblx0dXRpbHMgPSByZXF1aXJlKCcuLy4uL2xpYnMvdXRpbHMnKSxcbiAgICBHYW1lTW9kZWwgPSByZXF1aXJlKCcuLy4uL21vZGVscy9nYW1lLW1vZGVsJyk7XG5cbnZhciBSZXN1bHRWTSA9IGZ1bmN0aW9uKCl7fTtcblxuLypcblx0UHJpdmF0ZSBNZW1lYmVyc1xuKi9cblxudmFyIF9jYWxjTWVzc2FnZSA9IGZ1bmN0aW9uKCl7XG5cdHZhciBtZXNzYWdlcyA9IHRoaXMucmVzdWx0TWVzc2FnZXMoKSxcblx0XHRwZXJjZW50YWdlID0gTWF0aC5yb3VuZCgodGhpcy5zY29yZSgpIC8gdGhpcy5oaWdoU2NvcmUoKSkgKiAxMDApLFxuXHRcdHJlc3VsdCA9IG1lc3NhZ2VzWzIwXTtcblxuXHRmb3IodmFyIHJlcyBpbiBtZXNzYWdlcykge1xuXHRcdGlmKHBlcmNlbnRhZ2UgPj0gcmVzKSByZXN1bHQgPSBtZXNzYWdlc1tyZXNdO1xuXHRcdGVsc2UgYnJlYWs7XG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxudmFyIF9jYWxjVG9wRml2ZSA9IGZ1bmN0aW9uKHByZXZpb3VzU2NvcmVzLCBjdXJyZW50U2NvcmUpe1xuXG5cdC8vIGdldCBmcmllbmRseSBUaW1lXG5cdF8uZWFjaChwcmV2aW91c1Njb3JlcywgZnVuY3Rpb24oc2NvcmUpe1xuXHRcdHNjb3JlLmZyaWVuZGx5VGltZSA9IHV0aWxzLnJlbGF0aXZlVGltZShzY29yZS5kYXRlKTtcblx0XHRzY29yZS5pc0N1cnJlbnQgPSArc2NvcmUuc2NvcmUgPT09ICtjdXJyZW50U2NvcmU7XG5cdH0pO1xuXG5cdGlmKHByZXZpb3VzU2NvcmVzLmxlbmd0aCA8PSAxKSByZXR1cm4gcHJldmlvdXNTY29yZXM7XG5cbiAgICBwcmV2aW91c1Njb3JlcyA9IF8uc29ydEJ5KHByZXZpb3VzU2NvcmVzLCBmdW5jdGlvbihzKXtcbiAgICAgICAgcmV0dXJuIC1zLnNjb3JlO1xuICAgIH0pO1xuICAgIFxuICAgIHJldHVybiBwcmV2aW91c1Njb3Jlcy5zbGljZSgwLDUpO1xufTtcblxudmFyIF9nZXRQZXJmb3JtYW5jZUFkaiA9IGZ1bmN0aW9uKCl7XG5cdHZhciB0YXJnZXQgPSAnJyxcblx0XHRpbmRleCA9IF8uZmluZEluZGV4KHRoaXMuc2NvcmVCb2FyZCgpLCBmdW5jdGlvbihzY29yZSl7XG5cdFx0cmV0dXJuIHNjb3JlLmlzQ3VycmVudDtcblx0fSk7XG5cblx0c3dpdGNoKGluZGV4KXtcblx0XHRjYXNlIDA6XG5cdFx0XHR0YXJnZXQgPSAndHJvcGh5Jztcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgMTpcblx0XHRjYXNlIDI6XG5cdFx0XHR0YXJnZXQgPSAncG9zaXRpdmUnO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAzOlxuXHRcdGNhc2UgNDpcblx0XHRcdHRhcmdldCA9ICdtb2RlcmF0ZSc7XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OlxuXHRcdFx0dGFyZ2V0ID0gJ25lZ2F0aXZlJztcblx0fVxuXG5cdHJldHVybiB0YXJnZXQ7XG59O1xuXG52YXIgX2dldFJlc3VsdEltYWdlID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIF8uZmluZFdoZXJlKHRoaXMuYXNzZXRzKCksIHsgbmFtZSA6IHRoaXMucGVyZm9ybWFuY2VBZGooKSB9KS5pbWFnZTtcbn07XG5cbi8qXG4gICAgUHVibGljIE1lbWJlcnNcbiovXG5SZXN1bHRWTS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5zY29yZSA9IG0ucHJvcChHYW1lTW9kZWwuc2NvcmUoKSk7XG4gICAgdGhpcy5oaWdoU2NvcmUgPSBtLnByb3AoR2FtZU1vZGVsLmhpZ2hTY29yZSgpKTtcbiAgICB0aGlzLnJlc3VsdE1lc3NhZ2VzID0gbS5wcm9wKEdhbWVNb2RlbC5yZXN1bHRNZXNzYWdlcygpKTtcbiAgICB0aGlzLmFzc2V0cyA9IG0ucHJvcChHYW1lTW9kZWwuYXNzZXRzKCkpO1xuICAgIHRoaXMuZW5kTWVzc2FnZSA9IG0ucHJvcChHYW1lTW9kZWwuZW5kTWVzc2FnZSgpKTtcbiAgICBcbiAgICAvLyBEZXJpdmF0aXZlIERhdGFcblx0dGhpcy5zY29yZUJvYXJkID0gbS5wcm9wKF9jYWxjVG9wRml2ZShHYW1lTW9kZWwucHJldmlvdXNTY29yZXMoKSwgdGhpcy5zY29yZSgpKSk7XG4gICAgdGhpcy5tZXNzYWdlID0gbS5wcm9wKF9jYWxjTWVzc2FnZS5jYWxsKHRoaXMpKTtcbiAgICB0aGlzLnBlcmZvcm1hbmNlQWRqID0gbS5wcm9wKF9nZXRQZXJmb3JtYW5jZUFkai5jYWxsKHRoaXMpKTtcbiAgICB0aGlzLnJlc3VsdEltYWdlID0gbS5wcm9wKF9nZXRSZXN1bHRJbWFnZS5jYWxsKHRoaXMpKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUmVzdWx0Vk07IiwiLyogR2xvYmFsIG1vZHVsZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcbiAgICBIYW1tZXIgPSByZXF1aXJlKCdoYW1tZXJqcycpLFxuICAgIFZlbG9jaXR5ID0gcmVxdWlyZSgndmVsb2NpdHktYW5pbWF0ZScpO1xuXG52YXIgVmlldyA9IGZ1bmN0aW9uKGN0cmwsIGFuc3dlcil7XG5cbiAgICB2YXIgYW5pbUluID0gZnVuY3Rpb24oZWwsIGlzSW5pdGlhbGl6ZWQsIGNvbnRleHQpIHtcbiAgICAgICAgaWYgKGFuc3dlci50b2dnbGVkKCkpIHtcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC50b2dnbGUoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICBWZWxvY2l0eShlbCwgJ2NhbGxvdXQucHVsc2UnLCB7IGR1cmF0aW9uIDogNDAwIH0pXG4gICAgICAgICAgICBhbnN3ZXIudG9nZ2xlZChmYWxzZSk7XG4gICAgICAgIH0gXG4gICAgICAgIGVsc2UgaWYoYW5zd2VyLnRvZ2dsZVJlamVjdGVkKCkpe1xuICAgICAgICAgICAgVmVsb2NpdHkoZWwsICdjYWxsb3V0LnNoYWtlJywgeyBkdXJhdGlvbiA6IDQwMCB9KTtcbiAgICAgICAgICAgIGFuc3dlci50b2dnbGVSZWplY3RlZChmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZighaXNJbml0aWFsaXplZCl7XG4gICAgICAgICAgICB2YXIgaGFtbWVydGltZSA9IG5ldyBIYW1tZXIoZWwpO1xuICAgICAgICAgICAgaGFtbWVydGltZS5vbigndGFwJywgY3RybC50b2dnbGUuYmluZChjdHJsLCBhbnN3ZXIpKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbShcImxpLmFuc3dlci5vcGFxdWVcIiwge1xuICAgICAgICBjb25maWcgOiBhbmltSW4sXG4gICAgICAgIGNsYXNzIDogIWFuc3dlci5jb3JyZWN0KCkgPyAnanNfZmFsc3knIDogJ2pzX3RydXRoeScsXG4gICAgICAgIHN0eWxlIDogeyBiYWNrZ3JvdW5kSW1hZ2UgOiBcInVybChcIiArIGFuc3dlci5pbWFnZSgpICsgXCIpXCIgfVxuICAgIH0sIFtcbiAgICAgICAgbShcImg0Lm5hbWVcIiwgYW5zd2VyLm5hbWUoKSlcbiAgICBdKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVmlldzsiLCIvKiBHbG9iYWwgbW9kdWxlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuICAgIF8gPSByZXF1aXJlKCdsb2Rhc2gnKSxcbiAgICBhbnN3ZXJWaWV3ID0gcmVxdWlyZSgnLi9hbnN3ZXItdmlldycpLFxuICAgIHRpbWVyVmlldyA9IHJlcXVpcmUoJy4vdGltZXItdmlldycpLFxuICAgIFZlbG9jaXR5ID0gcmVxdWlyZSgndmVsb2NpdHktYW5pbWF0ZScpO1xuXG5cbi8qXG4gICAgSGVscGVyc1xuKi9cblxudmFyIF9nZXRFbCA9IGZ1bmN0aW9uKG1hcmtlcil7XG4gICAgdmFyIGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChtYXJrZXIpO1xuICAgIHJldHVybiBlbC5sZW5ndGggPiAxID8gZWwgOiBlbFswXTtcbn07XG5cbnZhciBfcnVuU2VxdWVuY2UgPSBmdW5jdGlvbihzZXEpe1xuICAgIFZlbG9jaXR5LlJ1blNlcXVlbmNlKHNlcSk7XG59O1xuXG52YXIgX2dldEFuaW1hdGlvbkZvciA9IGZ1bmN0aW9uKG5hbWUsIG92ZXJpZGVzKXtcbiAgICB2YXIgYW5pbSA9IHtcbiAgICAgICAgXCJxdWVzdGlvbk51bWJlclVwXCIgICA6IHsgZSA6IF9nZXRFbCgnLnF1ZXN0aW9uLW51bWJlcicpLCBwIDogeyBsZWZ0IDogJzUwcHgnLCB0b3AgOiAnMjBweCcsIGZvbnRTaXplIDogJzAuOXJlbScgfSB9LFxuICAgICAgICBcInF1ZXN0aW9uTnVtYmVyRG93blwiIDogeyBlIDogX2dldEVsKCcucXVlc3Rpb24tbnVtYmVyJyksIHAgOiAncmV2ZXJzZScgfSxcbiAgICAgICAgXCJxdWVzdGlvblNob3dcIiAgICAgICA6IHsgZSA6IF9nZXRFbCgnLmN1cnJlbnQtcXVlc3Rpb24nKSwgIHAgOiAndHJhbnNpdGlvbi5zbGlkZVVwSW4nIH0sXG4gICAgICAgIFwicXVlc3Rpb25IaWRlXCIgICAgICAgOiB7IGUgOiBfZ2V0RWwoJy5jdXJyZW50LXF1ZXN0aW9uJyksICBwIDogJ3RyYW5zaXRpb24uc2xpZGVVcE91dCcgfSxcbiAgICAgICAgXCJsaW1pdFNob3dcIiAgICAgICAgICA6IHsgZSA6IF9nZXRFbCgnLmxpbWl0JyksIHAgOiAndHJhbnNpdGlvbi5ib3VuY2VJbicgfSxcbiAgICAgICAgXCJsaW1pdEhpZGVcIiAgICAgICAgICA6IHsgZSA6IF9nZXRFbCgnLmxpbWl0JyksIHAgOiAndHJhbnNpdGlvbi5ib3VuY2VPdXQnIH0sXG4gICAgICAgIFwiaW1hZ2VRdWVzdGlvblNob3dcIiAgOiB7IGUgOiBfZ2V0RWwoJy5xdWVzdGlvbi1tYXNrID4gLmltYWdlLWhvbGRlcicpLCBwIDogJ3RyYW5zaXRpb24uc2hyaW5rSW4nIH0sXG4gICAgICAgIFwiaW1hZ2VRdWVzdGlvbkhpZGVcIiAgOiB7IGUgOiBfZ2V0RWwoJy5xdWVzdGlvbi1tYXNrID4gLmltYWdlLWhvbGRlcicpLCBwIDogJ3RyYW5zaXRpb24uc2hyaW5rT3V0JyB9LFxuICAgICAgICBcImFuc3dlcnNTaG93XCIgICAgICAgIDogeyBlIDogX2dldEVsKCcuYW5zd2VyJyksIHAgOiAndHJhbnNpdGlvbi5ib3VuY2VJbicsIG8gOiB7IHN0YWdnZXIgOiAyMDAgfSB9LFxuICAgICAgICBcImFuc3dlcnNIaWRlXCIgICAgICAgIDogeyBlIDogX2dldEVsKCcuYW5zd2VyJyksIHAgOiAndHJhbnNpdGlvbi5ib3VuY2VPdXQnLCBvIDogeyBkdXJhdGlvbiA6IDUwMCB9IH0sXG4gICAgICAgIFwiZmFsc2VBbnN3ZXJzRmFkZVwiICAgOiB7IGUgOiBfZ2V0RWwoJy5qc19mYWxzeScpLCBwIDogeyBvcGFjaXR5IDogMC4zIH0sIG8gOiB7IGR1cmF0aW9uIDogNTAwIH0gfSxcbiAgICAgICAgXCJ0cnVlQW5zd2Vyc0J1enpcIiAgICA6IHsgZSA6IF9nZXRFbCgnLmpzX3RydXRoeScpLCBwIDogJ2NhbGxvdXQucHVsc2UnLCBvIDogeyBkdXJhdGlvbiA6IDMwMCwgc3RhZ2dlciA6IDIwMCB9IH0sXG4gICAgfTtcblxuICAgIHZhciB0YXJnZXQgPSBhbmltW25hbWVdO1xuICAgIGlmKG92ZXJpZGVzICkge1xuICAgICAgICB0YXJnZXQubyA9IHRhcmdldC5vIHx8IHt9O1xuICAgICAgICBfLmV4dGVuZCh0YXJnZXQubywgb3ZlcmlkZXMpO1xuICAgIH0gXG4gICAgcmV0dXJuIHRhcmdldDtcbn07XG5cbnZhciBfcmVuZGVyU3RhbmRhcmQgPSBmdW5jdGlvbihjdHJsLCBlbCl7XG4gICAgdmFyIHNlcXVlbmNlID0gW1xuICAgICAgICBfZ2V0QW5pbWF0aW9uRm9yKCdhbnN3ZXJzU2hvdycpLFxuICAgICAgICBfZ2V0QW5pbWF0aW9uRm9yKCdxdWVzdGlvbk51bWJlclVwJyksXG4gICAgICAgIF9nZXRBbmltYXRpb25Gb3IoJ3F1ZXN0aW9uU2hvdycpLFxuICAgICAgICBfZ2V0QW5pbWF0aW9uRm9yKCdsaW1pdFNob3cnLCB7IGNvbXBsZXRlIDogY3RybC5zdGFydFF1ZXN0aW9uLmJpbmQoY3RybCkgfSlcbiAgICBdO1xuICAgIGlmKGN0cmwuVk0uY3VycmVudFF1ZXN0aW9uKCkgPiAwKSBzZXF1ZW5jZS51bnNoaWZ0KF9nZXRBbmltYXRpb25Gb3IoJ3F1ZXN0aW9uTnVtYmVyRG93bicpKTtcbiAgICBfcnVuU2VxdWVuY2Uoc2VxdWVuY2UpO1xufTtcblxudmFyIF9yZW5kZXJJbWFnZVF1ZXN0aW9uID0gZnVuY3Rpb24oY3RybCwgZWwpe1xuICAgIHZhciBzZXF1ZW5jZSA9IG51bGw7XG4gICAgaWYoIWN0cmwuVk0ucXVlc3Rpb24oKS5pbWFnZVNob3duKCkpe1xuICAgICAgICBzZXF1ZW5jZSA9IFtcbiAgICAgICAgICBfZ2V0QW5pbWF0aW9uRm9yKCdxdWVzdGlvbk51bWJlclVwJyksXG4gICAgICAgICAgX2dldEFuaW1hdGlvbkZvcigncXVlc3Rpb25TaG93JyksXG4gICAgICAgICAgX2dldEFuaW1hdGlvbkZvcignaW1hZ2VRdWVzdGlvblNob3cnKSxcbiAgICAgICAgICBfZ2V0QW5pbWF0aW9uRm9yKCdpbWFnZVF1ZXN0aW9uSGlkZScsIHsgZGVsYXkgOiAyMDAwIH0pLFxuICAgICAgICAgIF9nZXRBbmltYXRpb25Gb3IoJ3F1ZXN0aW9uSGlkZScsIHsgY29tcGxldGUgOiBjdHJsLm9uSW1hZ2VTaG93bi5iaW5kKGN0cmwpIH0pXG4gICAgICAgIF07XG4gICAgICAgIGlmKGN0cmwuVk0uY3VycmVudFF1ZXN0aW9uKCkgPiAwKSBzZXF1ZW5jZS51bnNoaWZ0KF9nZXRBbmltYXRpb25Gb3IoJ3F1ZXN0aW9uTnVtYmVyRG93bicpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzZXF1ZW5jZSA9IFtcbiAgICAgICAgICBfZ2V0QW5pbWF0aW9uRm9yKCdxdWVzdGlvblNob3cnKSxcbiAgICAgICAgICBfZ2V0QW5pbWF0aW9uRm9yKCdhbnN3ZXJzU2hvdycpLFxuICAgICAgICAgIF9nZXRBbmltYXRpb25Gb3IoJ2xpbWl0U2hvdycsIHsgY29tcGxldGUgOiBjdHJsLnN0YXJ0UXVlc3Rpb24uYmluZChjdHJsKSB9KVxuICAgICAgICBdO1xuICAgIH1cbiAgICBfcnVuU2VxdWVuY2Uoc2VxdWVuY2UpO1xufTtcblxuLypcbiAgICBSZW5kZXIgRW50cnkgTWVtYmVyc1xuKi9cblxudmFyIHJlbmRlckdhbWVQYWdlID0gZnVuY3Rpb24oY3RybCwgZWwpe1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lID0gJ2dhbWUnO1xuICAgIFZlbG9jaXR5KF9nZXRFbCgnLmdhbWUtaGVhZGVyJyksIHsgdHJhbnNsYXRlWSA6ICcrPTE3MHB4JyB9LCB7IGR1cmF0aW9uIDogNTAwLCBkZWxheSA6IDMwMCwgZWFzaW5nIDogWyAyNTAsIDAgXSB9KS50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgIGN0cmwucmVhZHkoKTtcbiAgICB9KTtcbn07XG5cblxudmFyIHJlbmRlck91dCA9IGZ1bmN0aW9uKGN0cmwsIGVsKXtcbiAgICBWZWxvY2l0eShlbC5jaGlsZHJlblswXSwgJ3JldmVyc2UnKS50aGVuKGN0cmwuZW5kR2FtZS5iaW5kKGN0cmwpKTtcbn07XG5cblxudmFyIHJlbmRlckFuc3dlcnNPdXQgPSBmdW5jdGlvbihjdHJsLCBlbCl7XG4gICAgLy8gVmVsb2NpdHlcbiAgICBfcnVuU2VxdWVuY2UoW1xuICAgICAgICBfZ2V0QW5pbWF0aW9uRm9yKCdmYWxzZUFuc3dlcnNGYWRlJyksXG4gICAgICAgIF9nZXRBbmltYXRpb25Gb3IoJ3RydWVBbnN3ZXJzQnV6eicpLFxuICAgICAgICBfZ2V0QW5pbWF0aW9uRm9yKCdhbnN3ZXJzSGlkZScsIHsgZGVsYXkgOiAxNTAwIH0pLFxuICAgICAgICBfZ2V0QW5pbWF0aW9uRm9yKCdxdWVzdGlvbkhpZGUnLCB7IGR1cmF0aW9uIDogNTAwIH0pLFxuICAgICAgICBfZ2V0QW5pbWF0aW9uRm9yKCdsaW1pdEhpZGUnLCB7IGR1cmF0aW9uIDogMjAwICwgY29tcGxldGUgOiBjdHJsLmFmdGVyRW5kUXVlc3Rpb24uYmluZChjdHJsKSB9KVxuICAgIF0pO1xufTtcblxudmFyIHJlbmRlclF1ZXN0aW9uRm9yVHlwZSA9IGZ1bmN0aW9uKGN0cmwsIGVsKXtcbiAgICAvLyBTaG93IHRoZSBxdWVzdGlvbnNcbiAgICBfZ2V0RWwoJy5nYW1lLWhlYWRlcicpLmNsYXNzTGlzdC5hZGQoJ2JlZ2luJyk7XG5cbiAgICAvLyBnZXQgYW5zd2VycyBhbmQgcmVtb3ZlIHdlaXJkIGluaXQgc3R5bGVcbiAgICB2YXIgYW5zd2VycyA9IF9nZXRFbCgnLnF1ZXN0aW9uLW1hc2snKTtcbiAgICBhbnN3ZXJzLnN0eWxlLm9wYWNpdHkgPSAxO1xuICAgIGFuc3dlcnMuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cbiAgICBzd2l0Y2goY3RybC5WTS5xdWVzdGlvbigpLnR5cGUoKSl7XG4gICAgICAgIGNhc2UgXCJzdGFuZGFyZFwiIDpcbiAgICAgICAgICAgIF9yZW5kZXJTdGFuZGFyZChjdHJsLCBlbCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiaW1hZ2VcIiA6XG4gICAgICAgICAgICBfcmVuZGVySW1hZ2VRdWVzdGlvbihjdHJsLCBlbCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbn07XG5cbnZhciBWaWV3ID0gZnVuY3Rpb24oY3RybCl7XG4gICAgdmFyIGFuaW1JbiA9IGZ1bmN0aW9uKGVsLCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSB7XG4gICAgICAgIC8vIERlY2lkZSB3aGF0IHRvIGRvIFxuICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgIHJlbmRlckdhbWVQYWdlKGN0cmwsIGVsKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBlbmQgb2YgcXVlc3Rpb25cbiAgICAgICAgZWxzZSBpZihjdHJsLlZNLmVuZFF1ZXN0aW9uKCkpe1xuICAgICAgICAgICAgcmVuZGVyQW5zd2Vyc091dChjdHJsLCBlbCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gc2hvdyB0aGUgcXVlc3Rpb25cbiAgICAgICAgZWxzZSBpZighY3RybC5WTS5nYW1lT3ZlcigpICYmICFjdHJsLlZNLnF1ZXN0aW9uU2hvd24oKSl7XG4gICAgICAgICAgICByZW5kZXJRdWVzdGlvbkZvclR5cGUoY3RybCwgZWwpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEVuZCBvZiBnYW1lIFxuICAgICAgICBlbHNlIGlmKGN0cmwuVk0uZ2FtZU92ZXIoKSkge1xuICAgICAgICAgICAgcmVuZGVyT3V0KGN0cmwsIGVsKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbSgnI2dhbWUtcGFnZScsIFtcbiAgICAgICAgbSgnLmdhbWUtaG9sZGVyJywge1xuICAgICAgICAgICAgY29uZmlnIDogYW5pbUluXG4gICAgICAgIH0sW1xuICAgICAgICAgICAgbSgnaGVhZGVyLmdhbWUtaGVhZGVyLm91dC10b3AtZnVsbCcsIFtcbiAgICAgICAgICAgICAgICB0aW1lclZpZXcoY3RybCwgY3RybC5WTS50aW1lcigpKSxcbiAgICAgICAgICAgICAgICBtKCdoMy5pbnRybycsICdHZXQgcmVhZHknKSxcbiAgICAgICAgICAgICAgICBtKCdoMy5xdWVzdGlvbi1udW1iZXInLCBcInF1ZXN0aW9uIFwiICsgKCtjdHJsLlZNLmN1cnJlbnRRdWVzdGlvbigpICsgMSkpLFxuICAgICAgICAgICAgICAgIG0oJ2gzLmN1cnJlbnQtcXVlc3Rpb24ub3BhcXVlJywgY3RybC5WTS5xdWVzdGlvbigpLnF1ZXN0aW9uRWxlbWVudCgpKSxcbiAgICAgICAgICAgICAgICBtKCdoNC5saW1pdC5vcGFxdWUnLCBbJ0Nob29zZSAnLCBtKCdzcGFuJywgY3RybC5WTS5xdWVzdGlvbigpLmxpbWl0KCkpXSlcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLnF1ZXN0aW9uLW1hc2snLCBbXG4gICAgICAgICAgICAgICAgbSgnLmltYWdlLWhvbGRlci5vcGFxdWUnLCB7IHN0eWxlIDogeyBiYWNrZ3JvdW5kSW1hZ2UgOiAndXJsKCcgKyAoY3RybC5WTS5xdWVzdGlvbigpLnR5cGUoKSA9PT0gJ2ltYWdlJyA/IGN0cmwuVk0ucXVlc3Rpb24oKS5zY2VuZUltYWdlKCkgOiAnJykgKyAnKScgfSB9IClcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLmFuc3dlcnMtYXJlYScsIFtcbiAgICAgICAgICAgICAgICBtKFwidWxcIiwgW1xuICAgICAgICAgICAgICAgICAgICBjdHJsLlZNLnF1ZXN0aW9uKCkuYW5zd2VycygpLm1hcChmdW5jdGlvbihhbnN3ZXIsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYW5zd2VyVmlldyhjdHJsLCBhbnN3ZXIpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKVxuICAgICAgICBdKVxuICAgIF0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3OyIsIi8qIEdsb2JhbCBtb2R1bGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG4gICAgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpLFxuICAgIEhhbW1lciA9IHJlcXVpcmUoJ2hhbW1lcmpzJyksXG4gICAgVmVsb2NpdHkgPSByZXF1aXJlKCd2ZWxvY2l0eS1hbmltYXRlJyk7XG5cbnZhciBMb2FkaW5nID0gZnVuY3Rpb24oY3RybCl7XG5cbiAgICB2YXIgYW5pbUluID0gZnVuY3Rpb24oZWwsIGlzSW5pdGlhbGl6ZWQsIGNvbnRleHQpIHtcbiAgICAgICAgdmFyIHNlcXVlbmNlID0gW1xuICAgICAgICAgICAgeyBlIDogZWwuY2hpbGRyZW5bMF0sIHAgOiAndHJhbnNpdGlvbi5zbGlkZVVwSW4nLCBvIDogeyBkdXJhdGlvbiA6IDMwMCwgZGVsYXkgOiAzMDAsIG9wYWNpdHkgOiAwIH0gfSxcbiAgICAgICAgICAgIHsgZSA6IGVsLmNoaWxkcmVuWzFdLCBwIDogJ3RyYW5zaXRpb24uc2xpZGVVcEluJywgbyA6IHsgZHVyYXRpb24gOiAzMDAgfSB9LFxuICAgICAgICAgICAgeyBlIDogZWwuY2hpbGRyZW5bMl0sIHAgOiAndHJhbnNpdGlvbi5ib3VuY2VJbicsICBvIDogeyBkdXJhdGlvbiA6IDMwMCB9IH0sXG4gICAgICAgICAgICB7IGUgOiBlbC5jaGlsZHJlblszXSwgcCA6IHsgb3BhY2l0eSA6IDEsIHJvdGF0ZVogOiAnLTI1JywgcmlnaHQgOiAtNTAgfSwgbyA6IHsgZHVyYXRpb24gOiA1MDAsIGVhc2luZyA6IFsgMjUwLCAxNSBdIH0gfVxuICAgICAgICBdO1xuXG4gICAgICAgIGlmICghaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPSAnaW50cm8nO1xuICAgICAgICAgICAgVmVsb2NpdHkuUnVuU2VxdWVuY2Uoc2VxdWVuY2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgVmVsb2NpdHkoZWwuY2hpbGRyZW4sICd0cmFuc2l0aW9uLmZhZGVPdXQnLCB7IHN0YWdnZXIgOiAnMTAwbXMnIH0pLnRoZW4oY3RybC5zdGFydEdhbWUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBldmVudHMgPSBmdW5jdGlvbihlbCwgaXNJbml0aWFsaXplZCl7XG4gICAgICAgIGlmKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICB2YXIgaGFtbWVydGltZSA9IG5ldyBIYW1tZXIoZWwpO1xuICAgICAgICAgICAgaGFtbWVydGltZS5vbigndGFwJywgY3RybC5vbkJlZ2luKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbSgnI2ludHJvLXBhZ2UnLCBbXG4gICAgICAgIG0oJy5pbnRyby1ob2xkZXInLCB7XG4gICAgICAgICAgICBjb25maWcgOiBhbmltSW5cbiAgICAgICAgfSxbXG4gICAgICAgICAgICBtKCdoMi5vcGFxdWUnLCBjdHJsLlZNLnRpdGxlKCkpLFxuICAgICAgICAgICAgbSgnLmRlc2NyaXB0aW9uLm9wYXF1ZScsIGN0cmwuVk0uZGVzY3JpcHRpb24oKSksXG4gICAgICAgICAgICBtKCdhLmJlZ2luLm9wYXF1ZScsIHsgY29uZmlnOiBldmVudHMgfSwgJ2JlZ2luJyksXG4gICAgICAgICAgICBtKCcuYnJhbmQub3BhcXVlLm91dC1yaWdodC1mYXInLCB7IHN0eWxlIDogeyBiYWNrZ3JvdW5kSW1hZ2UgOiAndXJsKHswfSknLnJlcGxhY2UoJ3swfScsIGN0cmwuVk0uYnJhbmQoKSkgfSB9KVxuICAgICAgICBdKVxuICAgIF0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb2FkaW5nOyIsIi8qIEdsb2JhbCBtb2R1bGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG4gICAgVmVsb2NpdHkgPSByZXF1aXJlKCd2ZWxvY2l0eS1hbmltYXRlJyk7XG5cbnZhciBMb2FkaW5nID0gZnVuY3Rpb24oY3RybCl7XG5cbiAgICB2YXIgYW5pbUluID0gZnVuY3Rpb24oZWwsIGlzSW5pdGlhbGl6ZWQsIGNvbnRleHQpIHtcbiAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICBWZWxvY2l0eShlbCwgeyB0cmFuc2xhdGVYIDogJys9MTAwJScgfSwgeyBkZWxheSA6IDIwMCwgZHVyYXRpb24gOiAzMDAsIGVhc2luZyA6ICdlYXNlJyB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmKGN0cmwuVk0ubG9hZGVkKCkpIFZlbG9jaXR5KGVsLCBcInJldmVyc2VcIikudGhlbihjdHJsLm9ubG9hZGVkKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbSgnI2xvYWRpbmctcGFnZScsIFtcbiAgICAgICAgbSgnLm1lc3NhZ2UtaG9sZGVyLm91dC1sZWZ0LWZ1bGwnLCB7XG4gICAgICAgICAgICBjb25maWcgOiBhbmltSW5cbiAgICAgICAgfSxbXG4gICAgICAgICAgICBtKCdoMycsICdMb2FkaW5nICcgKyBjdHJsLlZNLnByb2dyZXNzKCkgKyAnJScpXG4gICAgICAgIF0pXG4gICAgXSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExvYWRpbmc7IiwiLyogR2xvYmFsIG1vZHVsZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcbiAgICBWZWxvY2l0eSA9IHJlcXVpcmUoJ3ZlbG9jaXR5LWFuaW1hdGUnKTtcblxudmFyIFZpZXcgPSBmdW5jdGlvbihjdHJsLCB0aW1lcil7XG5cbiAgICB2YXIgcmVuZGVyU2NvcmVib2FyZEluID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3Jlc3VsdHMnKVswXSxcbiAgICAgICAgICAgIHNjb3Jlc0FyZWEgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzY29yZXMnKVswXSxcbiAgICAgICAgICAgIHNjb3JlVGl0bGUgPSBzY29yZXNBcmVhLmNoaWxkcmVuWzBdLFxuICAgICAgICAgICAgbW92ZU9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbW92ZS1vbicpWzBdLFxuICAgICAgICAgICAgc2NvcmVzID0gc2NvcmVzQXJlYS5jaGlsZHJlblsxXTtcblxuICAgICAgICB2YXIgc2VxdWVuY2UgPSBbXG4gICAgICAgICAgICB7IGUgOiByZXN1bHQuY2hpbGRyZW4sIHAgOiAndHJhbnNpdGlvbi5leHBhbmRPdXQnLCBvIDogeyBkZWxheSA6IDUwMDAgfSB9LFxuICAgICAgICAgICAgeyBlIDogc2NvcmVUaXRsZSwgcCA6ICd0cmFuc2l0aW9uLmZhZGVJbicgfSxcbiAgICAgICAgICAgIHsgZSA6IHNjb3Jlcy5jaGlsZHJlbiwgcCA6ICd0cmFuc2l0aW9uLnNsaWRlTGVmdEJpZ0luJywgbyA6IHsgc3RhZ2dlciA6IDIwMCB9IH0sXG4gICAgICAgICAgICB7IGUgOiBtb3ZlT24sIHAgOiAndHJhbnNpdGlvbi5mYWRlSW4nIH1cbiAgICAgICAgXTtcbiAgICAgICAgVmVsb2NpdHkuUnVuU2VxdWVuY2Uoc2VxdWVuY2UpO1xuICAgIH07XG5cbiAgICB2YXIgcmVuZGVyUmVwbGF5ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGEgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdidG4nKTtcbiAgICAgICAgVmVsb2NpdHkoYSwgJ2ZhZGVJbicsIHsgc3RhZ2dlciA6IDIwMCwgY29tcGxldGUgOiByZW5kZXJTY29yZWJvYXJkSW4uYmluZCh0aGlzKSB9KTtcbiAgICB9O1xuXG4gICAgdmFyIGFuaW1JbiA9IGZ1bmN0aW9uKGVsLCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSB7XG4gICAgICAgIGlmKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9ICdyZXN1bHQnO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3Jlc3VsdHMnKVswXTtcbiAgICAgICAgICAgIHZhciBzZXF1ZW5jZSA9IFtcbiAgICAgICAgICAgICAgICB7IGUgOiByZXN1bHQuY2hpbGRyZW5bMF0sIHAgOiAndHJhbnNpdGlvbi53aGlybEluJyB9LFxuICAgICAgICAgICAgICAgIHsgZSA6IHJlc3VsdC5jaGlsZHJlblsxXSwgcCA6ICd0cmFuc2l0aW9uLmV4cGFuZEluJyB9LFxuICAgICAgICAgICAgICAgIHsgZSA6IHJlc3VsdC5jaGlsZHJlblsyXSwgcCA6ICd0cmFuc2l0aW9uLmV4cGFuZEluJywgbyA6IHsgY29tcGxldGUgOiByZW5kZXJSZXBsYXkuYmluZCh0aGlzKSB9IH1cbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICBWZWxvY2l0eS5SdW5TZXF1ZW5jZShzZXF1ZW5jZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIG0oJyNyZXN1bHQtcGFnZScsIFtcbiAgICAgICAgbSgnLnJlc3VsdC1ob2xkZXInLCB7XG4gICAgICAgICAgICBjb25maWcgOiBhbmltSW5cbiAgICAgICAgfSxbXG4gICAgICAgICAgICBtKCcucmVzdWx0cycsIFtcbiAgICAgICAgICAgICAgICBtKCcucmVzdWx0LWltYWdlLm9wYXF1ZScsIHsgc3R5bGUgOiB7IGJhY2tncm91bmRJbWFnZSA6ICd1cmwoJyArIGN0cmwuVk0ucmVzdWx0SW1hZ2UoKSArICcpJyB9IH0pLFxuICAgICAgICAgICAgICAgIG0oJ2gxLnJlc3VsdC5vcGFxdWUnLCBjdHJsLlZNLnNjb3JlKCkgKyAnLycgKyBjdHJsLlZNLmhpZ2hTY29yZSgpKSxcbiAgICAgICAgICAgICAgICBtKCdwLm9wYXF1ZScsIGN0cmwuVk0ubWVzc2FnZSgpKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCcuc2NvcmVzJywgW1xuICAgICAgICAgICAgICAgIG0oJ2gzLm9wYXF1ZScsICdZb3VyIFNjb3JlcycpLFxuICAgICAgICAgICAgICAgIG0oJ29sLm15LXNjb3JlcycsIFtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5WTS5zY29yZUJvYXJkKCkubWFwKGZ1bmN0aW9uKHMsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjbGFzc05hbWUgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSArPSAgKGkgPT09IDApID8gJ2ZpcnN0JyA6ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lICs9ICBzLmlzQ3VycmVudCA/ICcgY3VycmVudCcgOiAnJztcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJ2xpLm9wYXF1ZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuc2NvcmUtaXRlbScsIHsgY2xhc3MgOiBjbGFzc05hbWUgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzLnNjb3JlICsgJyBwb2ludHMgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3BhbicsIHMuZnJpZW5kbHlUaW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCdwLm1vdmUtb24ub3BhcXVlJywgWydZb3Ugc2NvcmVkICcsIG0oJ3NwYW4nLCBjdHJsLlZNLnNjb3JlKCkgKyAncHRzJyksICcsICcgKyBjdHJsLlZNLmVuZE1lc3NhZ2UoKV0pLFxuICAgICAgICAgICAgbSgnYS5idG4ucmVwbGF5Lm9wYXF1ZVtocmVmPVwiIy9nYW1lXCJdJywgJ1RyeSBBZ2FpbicpLFxuICAgICAgICAgICAgbSgnYS5idG4ubGV2ZWwyLm9wYXF1ZScsICdMZXZlbCAyJylcbiAgICAgICAgXSlcbiAgICBdKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVmlldzsiLCIvKiBHbG9iYWwgbW9kdWxlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuICAgIFZlbG9jaXR5ID0gcmVxdWlyZSgndmVsb2NpdHktYW5pbWF0ZScpO1xuXG52YXIgVmlldyA9IGZ1bmN0aW9uKGN0cmwsIHRpbWVyKXtcblxuICAgIHZhciBhbmltSW4gPSBmdW5jdGlvbihlbCwgaXNJbml0aWFsaXplZCwgY29udGV4dCkge1xuICAgICAgICBpZighdGltZXIpIHJldHVybjtcbiAgICAgICAgaWYoIXRpbWVyLmlzQWN0aXZlKCkpe1xuICAgICAgICAgICAgVmVsb2NpdHkoZWwsIHsgd2lkdGggOiAnMTAwJScgfSwgeyBkZWxheSA6IDEwMDAsIGR1cmF0aW9uIDogdGltZXIudGltZSgpLCBlYXNpbmcgOiAnbGluZWFyJyB9KS50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgY3RybC5vblRpbWUoKTtcbiAgICAgICAgICAgICAgICBWZWxvY2l0eShlbCwgeyB3aWR0aCA6IDAgfSwgIHsgZHVyYXRpb24gOiAyMDAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRpbWVyLmlzQWN0aXZlKHRydWUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBtKFwiLnRpbWVyXCIsIHtcbiAgICAgICAgY29uZmlnIDogYW5pbUluXG4gICAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXc7Il19
