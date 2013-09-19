/// <reference path="../_definitions.d.ts" />
import base = require("./base");
import M4 = require("./matrix4");

export interface Vector3 {
    [index: number]: number;
}

//#region Init Methods

export var _temp1 = new base.ArrayType(3);
export var _temp2 = new base.ArrayType(3);
export var _temp3 = new base.ArrayType(3);

export var x: Vector3;
export var y: Vector3;
export var z: Vector3;

/** Return a copy of the given vector 3 */
export var $: (x: number, y: number, z: number) => Vector3;
/** Create a new vector 3 with the given arguments */
export var clone: (v: Vector3) => Vector3;

if (base.ArrayType === Array) {
    x = [1.0, 0.0, 0.0];
    y = [0.0, 1.0, 0.0];
    z = [0.0, 0.0, 1.0];

    $ = function (x: number, y: number, z: number): Vector3 {
        return [x, y, z];
    };
    clone = function (v: Vector3): Vector3 {
        return [v[0], v[1], v[2]];
    };
} else {
    x = new base.ArrayType([1.0, 0.0, 0.0]);
    y = new base.ArrayType([0.0, 1.0, 0.0]);
    z = new base.ArrayType([0.0, 0.0, 1.0]);

    $ = function (x: number, y: number, z: number): Vector3 {
        return new base.ArrayType([x, y, z]);
    };
    clone = function (v: Vector3): Vector3 {
        return new base.ArrayType(v);
    };
}

export var u = x;
export var v = y;

//#endregion

//#region Operation Methods

/** Return a vector 3 by performing r = a + b */
export function add(a: Vector3, b: Vector3, r?: Vector3): Vector3 {
    if (r === undefined)
        r = new base.ArrayType(3);

    r[0] = a[0] + b[0];
    r[1] = a[1] + b[1];
    r[2] = a[2] + b[2];

    return r;
}

/** Return a vector 3 by performing r = a - b */
export function sub(a: Vector3, b: Vector3, r?: Vector3): Vector3 {
    if (r === undefined)
        r = new base.ArrayType(3);

    r[0] = a[0] - b[0];
    r[1] = a[1] - b[1];
    r[2] = a[2] - b[2];

    return r;
}
export var substract = sub;

/** Return a vector 3 by performing r = -a */
export function neg(a: Vector3, r?: Vector3): Vector3 {
    if (r === undefined)
        r = new base.ArrayType(3);

    r[0] = -a[0];
    r[1] = -a[1];
    r[2] = -a[2];

    return r;
}
export var negate = neg;

/** Return a vector 3 by performing r = dot(a, b) */
export function dot(a: Vector3, b: Vector3): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/** Return a vector 3 by performing cross operation : r = a x b */
export function cross(a: Vector3, b: Vector3, r?: Vector3): Vector3 {
    if (r === undefined)
        r = new base.ArrayType(3);

    r[0] = a[1] * b[2] - a[2] * b[1];
    r[1] = a[2] * b[0] - a[0] * b[2];
    r[2] = a[0] * b[1] - a[1] * b[0];

    return r;
}

/** Return a vector 3 by performing r = m * v */
export function mul4x4(m: M4.Matrix4, v: Vector3, r?: Vector3): Vector3 {
    var w;
    var tmp = _temp1;
    if (r === undefined)
        r = new base.ArrayType(3);

    tmp[0] = m[3];
    tmp[1] = m[7];
    tmp[2] = m[11];
    w = dot(v, tmp) + m[15];
    tmp[0] = m[0];
    tmp[1] = m[4];
    tmp[2] = m[8];
    r[0] = (dot(v, tmp) + m[12]) / w;
    tmp[0] = m[1];
    tmp[1] = m[5];
    tmp[2] = m[9];
    r[1] = (dot(v, tmp) + m[13]) / w;
    tmp[0] = m[2];
    tmp[1] = m[6];
    tmp[2] = m[10];
    r[2] = (dot(v, tmp) + m[14]) / w;
    return r;
}

//#endregion

//#region Transformation Methods

/** Normalize given vector 3 by performing  r = a / |a|. */
export function normalize(a: Vector3, r?: Vector3): Vector3 {
    if (r === undefined)
        r = new base.ArrayType(3);

    var im = 1.0 / length(a);
    r[0] = a[0] * im;
    r[1] = a[1] * im;
    r[2] = a[2] * im;

    return r;
}

/** Return given vector 3 scaled by performing  r = a * k. */
export function scale(a: Vector3, k: number, r?: Vector3): Vector3 {
    if (r === undefined)
        r = new base.ArrayType(3);

    r[0] = a[0] * k;
    r[1] = a[1] * k;
    r[2] = a[2] * k;

    return r;
}

//#endregion

//#region Information Methods

/** Direction from a to b. Return a direction vector 3 by performing r = (a - b) / |a - b|. The result is the normalized. */
export function direction(a: Vector3, b: Vector3, r?: Vector3): Vector3 {
    if (r === undefined)
        r = new base.ArrayType(3);

    return normalize(sub(a, b, r), r);
}

/** Return length of the given vector 3 by performing r = |a|. */
export function length(a: Vector3): number {
    return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
}

/** Return length squared of the given vector 3 by performing r = |a|*|a|. */
export function lengthSquared(a: Vector3): number {
    return a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
}

//#endregion
