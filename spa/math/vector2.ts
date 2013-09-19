/// <reference path="../_definitions.d.ts" />
import base = require("./base");
import M3 = require("./matrix3");

export interface Vector2 {
    [index: number]: number;
}

//#region Init Methods

export var x: Vector2;
export var y: Vector2;

/** Create a new vector 2 with the given arguments */
export var $: (x: number, y: number) => Vector2;
/** Return a copy of the given vector 2 */
export var clone: (vector: Vector2) => Vector2;

if (base.ArrayType === Array) {
    x = [1.0, 0.0];
    y = [0.0, 1.0];

    $ = function (x: number, y: number): Vector2 {
        return [x, y];
    };
    clone = function (vector: Vector2): Vector2 {
        return [vector[0], vector[1]];
    };
}
else {
    x = new base.ArrayType([1.0, 0.0]);
    y = new base.ArrayType([0.0, 1.0]);

    $ = function (x: number, y: number): Vector2 {
        return new base.ArrayType([x, y]);
    };
    clone = function (vector: Vector2): Vector2 {
        return new base.ArrayType(vector);
    };
}

export var u = x;
export var v = y;

//#endregion

//#region Operation Methods

/** Return a vector 2 by performing r = a + b */
export function add(a: Vector2, b: Vector2, r?: Vector2): Vector2 {
    if (r === undefined)
        r = new base.ArrayType(2);

    r[0] = a[0] + b[0];
    r[1] = a[1] + b[1];

    return r;
}

/** Return a vector 2 by performing r = a - b */
export function sub(a: Vector2, b: Vector2, r?: Vector2): Vector2 {
    if (r === undefined)
        r = new base.ArrayType(2);

    r[0] = a[0] - b[0];
    r[1] = a[1] - b[1];

    return r;
}
export var substract = sub;

/** Return a vector 2 by performing r = -a */
export function neg(a: Vector2, r?: Vector2): Vector2 {
    if (r === undefined)
        r = new base.ArrayType(2);

    r[0] = - a[0];
    r[1] = - a[1];

    return r;
}
export var negate = neg;

/** Return result of operation performing r = dot(a, b) */
export function dot(a: Vector2, b: Vector2): number {
    return a[0] * b[0] + a[1] * b[1];
}

/** Return a vector 2 by performing cross operation : r = a x b */
export function cross(a: Vector2, b: Vector2, r?: Vector2): Vector2 {
    if (r === undefined)
        r = new base.ArrayType(2);

    r[0] = a[1] - b[1];
    r[1] = b[0] - a[0];

    return r;
}

/** Return a vector 2 by performing r = m * v */
export function mul3x3(m: M3.Matrix3, b: Vector2, r?: Vector2): Vector2 {
    var x = v[0], y = v[1], z = v[2];
    if (r === undefined)
        r = new base.ArrayType(2);

    r[0] = m[0] * x + m[1] * y + m[6];
    r[1] = m[2] * x + m[3] * y + m[7];

    return r;
}

//#endregion

//#region Transformation Methods

/** Normalize given vector 2 by performing  r = a / |a|. */
export function normalize(a: Vector2, r?: Vector2): Vector2 {
    if (r === undefined)
        r = new base.ArrayType(2);

    var im = 1.0 / length(a);
    r[0] = a[0] * im;
    r[1] = a[1] * im;

    return r;
}

/** Return given vector 2 scaled by performing  r = a * k. */
export function scale(a: Vector2, k: number, r?: Vector2): Vector2 {
    if (r === undefined)
        r = new base.ArrayType(2);

    r[0] = a[0] * k;
    r[1] = a[1] * k;

    return r;
}

//#endregion

//#region Information Methods

/** Direction from a to b. Return a direction vector 2 by performing r = (a - b) / |a - b|. The result is the normalized. */
export function direction(a: Vector2, b: Vector2, r?: Vector2): Vector2 {
    if (r === undefined)
        r = new base.ArrayType(2);

    return normalize(sub(a, b, r), r);
}

/** Return length of the given vector 2 by performing r = |a|. */
export function length(a: Vector2): number {
    return Math.sqrt(a[0] * a[0] + a[1] * a[1]);
}

/** Return length squared of the given vector 2 by performing r = |a|*|a|. */
export function lengthSquared(a: Vector2): number {
    return a[0] * a[0] + a[1] * a[1];
}

//#endregion
