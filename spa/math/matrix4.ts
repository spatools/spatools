/// <reference path="../_definitions.d.ts" />
import base = require("./base");
import V3 = require("./vector3");
import M3 = require("./matrix3");

export interface Matrix4 {
    [index: number]: number;
}

//#region Init Methods

export var _temp1 = new base.ArrayType(16);
export var _temp2 = new base.ArrayType(16);

/** Identity 4x4 Matrix */
export var I: Matrix4;

/** Create new Matrix 4x4 */
export var $: (
    m00: number, m01: number, m02: number, m03: number, m04: number, m05: number, m06: number, m07: number,
    m08: number, m09: number, m10: number, m11: number, m12: number, m13: number, m14: number, m15: number) => Matrix4;

/** Clone the given 4x4 matrix */
export var clone: (m: Matrix4) => Matrix4;


if (base.ArrayType === Array) {
    I = [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0];

    $ = function (
        m00: number, m01: number, m02: number, m03: number, m04: number, m05: number, m06: number, m07: number,
        m08: number, m09: number, m10: number, m11: number, m12: number, m13: number, m14: number, m15: number): Matrix4 {
        return [
            m00, m01, m02, m03,
            m04, m05, m06, m07,
            m08, m09, m10, m11,
            m12, m13, m14, m15];
    };

    clone = function (m: Matrix4): Matrix4 {
        return [
            m[0], m[1], m[2], m[3],
            m[4], m[5], m[6], m[7],
            m[8], m[9], m[10], m[11],
            m[12], m[13], m[14], m[15]];
    };
} else {
    I = new base.ArrayType([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0]);

    $ = function (
        m00: number, m01: number, m02: number, m03: number, m04: number, m05: number, m06: number, m07: number,
        m08: number, m09: number, m10: number, m11: number, m12: number, m13: number, m14: number, m15: number): Matrix4 {
        return new base.ArrayType([
            m00, m01, m02, m03,
            m04, m05, m06, m07,
            m08, m09, m10, m11,
            m12, m13, m14, m15]);
    };

    clone = function (m: Matrix4): Matrix4 {
        return new base.ArrayType(m);
    };
}

export var identity = I;

/** Return the top left 3x3 matrix from the given 4x4 matrix */
export function topLeft3x3(m: Matrix4, r?: M3.Matrix3): M3.Matrix3 {
    if (r === undefined)
        r = new base.ArrayType(9);

    r[0] = m[0]; r[1] = m[1]; r[2] = m[2];
    r[3] = m[4]; r[4] = m[5]; r[5] = m[6];
    r[6] = m[8]; r[7] = m[9]; r[8] = m[10];

    return r;
}

//#endregion

//#region CSS Methods

/** Return a string representation of the given matrix */
export function toString(m: Matrix4): string {
    return Array.prototype.join.call(m, ",");
}

/** Return a CSS 2D representation of the given matrix */
export function toCss2dMatrix(m: Matrix4): string {
    return "matrix(" + m[0] + "," + m[1] + "," + m[4] + "," + m[5] + "," + m[12] + "," + m[13] + ")";
}

/** Return a CSS 3D representation of the given matrix */
export function toCss3dMatrix(m: Matrix4): string {
    return "matrix3d(" + toString(m) + ")";
}

/** Return a 4x4 Matrix from the given CSS string */
export function fromCssMatrix(css: string, r?: Matrix4): Matrix4 {
    var c = css.match(/matrix(3d)?\(([^\)]+)\)/i)[2].split(",");
    if (c.length === 16) {
        if (r === undefined)
            r = clone(I);

        for (var i = 0; i < c.length; i++) {
            r[i] = parseFloat(c[i]);
        }
    }
    else {
        if (r === undefined)
            r = clone(I);

        r[0] = parseFloat(c[0]);
        r[1] = parseFloat(c[1]);
        r[4] = parseFloat(c[2]);
        r[5] = parseFloat(c[3]);
        r[12] = parseFloat(c[4]);
        r[13] = parseFloat(c[5]);
    }

    return r;
}

//#endregion

//#region Operation Methods

/** Computes the inverse of the given matrix */
export function inverse(m: Matrix4, r?: Matrix4): Matrix4 {
    if (r === undefined)
        r = new base.ArrayType(16);

    var a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3],
        a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7],
        a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11],
        a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
        return null;
    }
    det = 1.0 / det;

    r[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    r[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    r[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    r[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    r[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    r[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    r[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    r[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    r[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    r[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    r[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    r[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    r[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    r[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    r[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    r[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return r;
}
/** Computes the inverse of the given matrix, assuming that the matrix is orthonormal */
export function inverseOrthonormal(m: Matrix4, r?: Matrix4): Matrix4 {
    if (r === undefined)
        r = new base.ArrayType(16);

    transpose(m, r);

    var t = [m[12], m[13], m[14]];

    r[3] = r[7] = r[11] = 0;
    r[12] = -V3.dot([r[0], r[4], r[8]], t);
    r[13] = -V3.dot([r[1], r[5], r[9]], t);
    r[14] = -V3.dot([r[2], r[6], r[10]], t);

    return r;
}
/** Computes the inverse of the given matrix, calculate only top left 3x3 */
export function inverseTo3x3(m: Matrix4, r?: M3.Matrix3): M3.Matrix3 {
    if (r === undefined)
        r = new base.ArrayType(9);

    var a11 = m[10] * m[5] - m[6] * m[9],
        a21 = -m[10] * m[1] + m[2] * m[9],
        a31 = m[6] * m[1] - m[2] * m[5],
        a12 = -m[10] * m[4] + m[6] * m[8],
        a22 = m[10] * m[0] - m[2] * m[8],
        a32 = -m[6] * m[0] + m[2] * m[4],
        a13 = m[9] * m[4] - m[5] * m[8],
        a23 = -m[9] * m[0] + m[1] * m[8],
        a33 = m[5] * m[0] - m[1] * m[4];

    var det = m[0] * (a11) + m[1] * (a12) + m[2] * (a13);
    if (det === 0) { // no inverse
        throw new Error("matrix not invertible");
    }

    var idet = 1.0 / det;

    r[0] = idet * a11;
    r[1] = idet * a21;
    r[2] = idet * a31;
    r[3] = idet * a12;
    r[4] = idet * a22;
    r[5] = idet * a32;
    r[6] = idet * a13;
    r[7] = idet * a23;
    r[8] = idet * a33;

    return r;
}

/** Return a new matrix by performing r = a * b */
export function mul(a: Matrix4, b: Matrix4, r?: Matrix4): Matrix4 {
    if (r === undefined)
        r = new base.ArrayType(16);

    var a11 = a[0];
    var a21 = a[1];
    var a31 = a[2];
    var a41 = a[3];
    var a12 = a[4];
    var a22 = a[5];
    var a32 = a[6];
    var a42 = a[7];
    var a13 = a[8];
    var a23 = a[9];
    var a33 = a[10];
    var a43 = a[11];
    var a14 = a[12];
    var a24 = a[13];
    var a34 = a[14];
    var a44 = a[15];

    var b11 = b[0];
    var b21 = b[1];
    var b31 = b[2];
    var b41 = b[3];
    var b12 = b[4];
    var b22 = b[5];
    var b32 = b[6];
    var b42 = b[7];
    var b13 = b[8];
    var b23 = b[9];
    var b33 = b[10];
    var b43 = b[11];
    var b14 = b[12];
    var b24 = b[13];
    var b34 = b[14];
    var b44 = b[15];

    r[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    r[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    r[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    r[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    r[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    r[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    r[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    r[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    r[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    r[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    r[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    r[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    r[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
    r[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
    r[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
    r[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

    return r;
}
export var multiply = mul;
/** Return a new matrix by performing r = a * b, assuming a and b are affine (elements 3,7,11,15 = 0,0,0,1) */
export function mulAffine(a: Matrix4, b: Matrix4, r?: Matrix4): Matrix4 {
    if (r === undefined)
        r = new base.ArrayType(16);

    var a11 = a[0];
    var a21 = a[1];
    var a31 = a[2];
    var a12 = a[4];
    var a22 = a[5];
    var a32 = a[6];
    var a13 = a[8];
    var a23 = a[9];
    var a33 = a[10];
    var a14 = a[12];
    var a24 = a[13];
    var a34 = a[14];

    var b11 = b[0];
    var b21 = b[1];
    var b31 = b[2];
    var b12 = b[4];
    var b22 = b[5];
    var b32 = b[6];
    var b13 = b[8];
    var b23 = b[9];
    var b33 = b[10];
    var b14 = b[12];
    var b24 = b[13];
    var b34 = b[14];

    r[0] = a11 * b11 + a12 * b21 + a13 * b31;
    r[1] = a21 * b11 + a22 * b21 + a23 * b31;
    r[2] = a31 * b11 + a32 * b21 + a33 * b31;
    r[3] = 0;
    r[4] = a11 * b12 + a12 * b22 + a13 * b32;
    r[5] = a21 * b12 + a22 * b22 + a23 * b32;
    r[6] = a31 * b12 + a32 * b22 + a33 * b32;
    r[7] = 0;
    r[8] = a11 * b13 + a12 * b23 + a13 * b33;
    r[9] = a21 * b13 + a22 * b23 + a23 * b33;
    r[10] = a31 * b13 + a32 * b23 + a33 * b33;
    r[11] = 0;
    r[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14;
    r[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24;
    r[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34;
    r[15] = 1;

    return r;
}
export var multiplyAffine = mulAffine;

/** Transpose the given matrix into r. */
export function transpose(m: Matrix4, r?: Matrix4): Matrix4 {
    if (m === r) {
        var tmp = 0.0;

        tmp = m[1]; m[1] = m[4]; m[4] = tmp;
        tmp = m[2]; m[2] = m[8]; m[8] = tmp;
        tmp = m[3]; m[3] = m[12]; m[12] = tmp;
        tmp = m[6]; m[6] = m[9]; m[9] = tmp;
        tmp = m[7]; m[7] = m[13]; m[13] = tmp;
        tmp = m[11]; m[11] = m[14]; m[14] = tmp;

        return m;
    }

    if (r === undefined)
        r = new base.ArrayType(16);

    r[0] = m[0]; r[1] = m[4]; r[2] = m[8]; r[3] = m[12];
    r[4] = m[1]; r[5] = m[5]; r[6] = m[9]; r[7] = m[13];
    r[8] = m[2]; r[9] = m[6]; r[10] = m[10]; r[11] = m[14];
    r[12] = m[3]; r[13] = m[7]; r[14] = m[11]; r[15] = m[15];

    return r;
}
/** Transpose the given matrix to itself. */
export function transposeSelf(m: Matrix4): Matrix4 {
    var tmp = m[1]; m[1] = m[4]; m[4] = tmp;

    tmp = m[2]; m[2] = m[8]; m[8] = tmp;
    tmp = m[3]; m[3] = m[12]; m[12] = tmp;
    tmp = m[6]; m[6] = m[9]; m[9] = tmp;
    tmp = m[7]; m[7] = m[13]; m[13] = tmp;
    tmp = m[11]; m[11] = m[14]; m[14] = tmp;

    return m;
}

//#endregion

//#region Projection Methods

/** Creates a matrix for a projection frustum with the given parameters */
export function makeFrustum(left: number, right: number, bottom: number, top: number, znear: number, zfar: number, r?: Matrix4): Matrix4 {
    if (r === undefined)
        r = new base.ArrayType(16);

    var X = 2 * znear / (right - left);
    var Y = 2 * znear / (top - bottom);
    var A = (right + left) / (right - left);
    var B = (top + bottom) / (top - bottom);
    var C = -(zfar + znear) / (zfar - znear);
    var D = -2 * zfar * znear / (zfar - znear);

    r[0] = 2 * znear / (right - left);
    r[1] = 0;
    r[2] = 0;
    r[3] = 0;
    r[4] = 0;
    r[5] = 2 * znear / (top - bottom);
    r[6] = 0;
    r[7] = 0;
    r[8] = (right + left) / (right - left);
    r[9] = (top + bottom) / (top - bottom);
    r[10] = -(zfar + znear) / (zfar - znear);
    r[11] = -1;
    r[12] = 0;
    r[13] = 0;
    r[14] = -2 * zfar * znear / (zfar - znear);
    r[15] = 0;

    return r;
}

/** Creates a matrix for a perspective projection with the given parameters */
export function makePerspective(fovy: number, aspect: number, znear: number, zfar: number, r?: Matrix4): Matrix4 {
    var ymax = znear * Math.tan(fovy * Math.PI / 360.0);
    var ymin = -ymax;
    var xmin = ymin * aspect;
    var xmax = ymax * aspect;

    return makeFrustum(xmin, xmax, ymin, ymax, znear, zfar, r);
}

/** Creates a matrix for an orthogonal frustum projection with the given parameters */
export function makeOrtho(left: number, right: number, bottom: number, top: number, znear: number, zfar: number, r?: Matrix4): Matrix4 {
    if (r === undefined)
        r = new base.ArrayType(16);

    var tX = -(right + left) / (right - left);
    var tY = -(top + bottom) / (top - bottom);
    var tZ = -(zfar + znear) / (zfar - znear);
    var X = 2 / (right - left);
    var Y = 2 / (top - bottom);
    var Z = -2 / (zfar - znear);

    r[0] = 2 / (right - left);
    r[1] = 0;
    r[2] = 0;
    r[3] = 0;
    r[4] = 0;
    r[5] = 2 / (top - bottom);
    r[6] = 0;
    r[7] = 0;
    r[8] = 0;
    r[9] = 0;
    r[10] = -2 / (zfar - znear);
    r[11] = 0;
    r[12] = -(right + left) / (right - left);
    r[13] = -(top + bottom) / (top - bottom);
    r[14] = -(zfar + znear) / (zfar - znear);
    r[15] = 1;

    return r;
}

/** Creates a matrix for a 2D orthogonal frustum projection with the given parameters. znear and zfar are assumed to be -1 and 1, respectively. */
export function makeOrtho2D(left: number, right: number, bottom: number, top: number, r?: Matrix4): Matrix4 {
    return makeOrtho(left, right, bottom, top, -1, 1, r);
}

/** Creates a perspective matrix from the given parameters. */
export function makeLookAt(eye: V3.Vector3, center: V3.Vector3, up: V3.Vector3, r?: Matrix4): Matrix4 {
    var z = V3.direction(eye, center, V3._temp1);
    var x = V3.normalize(V3.cross(up, z, V3._temp2), V3._temp2);
    var y = V3.normalize(V3.cross(z, x, V3._temp3), V3._temp3);

    var tm1 = _temp1;
    var tm2 = _temp2;

    tm1[0] = x[0];
    tm1[1] = y[0];
    tm1[2] = z[0];
    tm1[3] = 0;
    tm1[4] = x[1];
    tm1[5] = y[1];
    tm1[6] = z[1];
    tm1[7] = 0;
    tm1[8] = x[2];
    tm1[9] = y[2];
    tm1[10] = z[2];
    tm1[11] = 0;
    tm1[12] = 0;
    tm1[13] = 0;
    tm1[14] = 0;
    tm1[15] = 1;

    tm2[0] = 1; tm2[1] = 0; tm2[2] = 0; tm2[3] = 0;
    tm2[4] = 0; tm2[5] = 1; tm2[6] = 0; tm2[7] = 0;
    tm2[8] = 0; tm2[9] = 0; tm2[10] = 1; tm2[11] = 0;
    tm2[12] = -eye[0]; tm2[13] = -eye[1]; tm2[14] = -eye[2]; tm2[15] = 1;

    if (r === undefined)
        r = new base.ArrayType(16);

    return mul(tm1, tm2, r);
}

//#endregion

//#region Translate Methods

/** Creates a transformation matrix for translating each of the x, y, and z axes by the amount given in the corresponding element of the 3-element vector. */
export function makeTranslate(v: V3.Vector3, r?: Matrix4): Matrix4 {
    var x = r[0], y = r[1], z = r[2];

    if (r === undefined)
        r = new base.ArrayType(16);

    r[0] = 1;
    r[1] = 0;
    r[2] = 0;
    r[3] = 0;
    r[4] = 0;
    r[5] = 1;
    r[6] = 0;
    r[7] = 0;
    r[8] = 0;
    r[9] = 0;
    r[10] = 1;
    r[11] = 0;
    r[12] = x;
    r[13] = y;
    r[14] = z;
    r[15] = 1;

    return r;
}
/** Creates a transformation matrix for a uniform translation among the x, y, z axes using the given value. */
export function makeTranslate1(k: number, r?: Matrix4): Matrix4 {
    return makeTranslate([k, k, k], r);
}

/** Concatenates a transformation matrix for translating each of the x, y, and z axes by the amount given in the corresponding element of the 3-element vector to the given matrix. */
export function translate(v: V3.Vector3, m: Matrix4, r?: Matrix4): Matrix4 {
    var x = v[0], y = v[1], z = v[2];

    if (base.engine === "css") {
        if (r === m) {
            m[12] += x;
            m[13] += y;
            m[14] += z;

            return m;
        }

        if (r === undefined)
            r = new base.ArrayType(16);

        var m11 = m[0], m21 = m[1], m31 = m[2], m41 = m[3],
            m12 = m[4], m22 = m[5], m32 = m[6], m42 = m[7],
            m13 = m[8], m23 = m[9], m33 = m[10], m43 = m[11];

        r[0] = m11; r[1] = m21; r[2] = m31; r[3] = m41;
        r[4] = m12; r[5] = m22; r[6] = m32; r[7] = m42;
        r[8] = m13; r[9] = m23; r[10] = m33; r[11] = m43;

        r[12] = m[12] + x;
        r[13] = m[13] + y;
        r[14] = m[14] + z;
        r[15] = 1; // m41 * x + m42 * y + m43 * z + m[15];
    }
    else {
        if (r === m) {
            m[12] += m[0] * x + m[4] * y + m[8] * z;
            m[13] += m[1] * x + m[5] * y + m[9] * z;
            m[14] += m[2] * x + m[6] * y + m[10] * z;
            m[15] += m[3] * x + m[7] * y + m[11] * z;

            return m;
        }

        if (r === undefined)
            r = new base.ArrayType(16);

        var m11 = m[0], m21 = m[1], m31 = m[2], m41 = m[3],
            m12 = m[4], m22 = m[5], m32 = m[6], m42 = m[7],
            m13 = m[8], m23 = m[9], m33 = m[10], m43 = m[11];

        r[0] = m11; r[1] = m21; r[2] = m31; r[3] = m41;
        r[4] = m12; r[5] = m22; r[6] = m32; r[7] = m42;
        r[8] = m13; r[9] = m23; r[10] = m33; r[11] = m43;

        r[12] = m11 * x + m12 * y + m13 * z + m[12];
        r[13] = m21 * x + m22 * y + m23 * z + m[13];
        r[14] = m31 * x + m32 * y + m33 * z + m[14];
        r[15] = m41 * x + m42 * y + m43 * z + m[15];
    }

    return r;
}
/** Concatenates a transformation matrix for a uniform translation among the x, y, z axes using the given value to the given matrix. */
export function translate1(k: number, m: Matrix4, r?: Matrix4): Matrix4 {
    return translate([k, k, k], m, r);
}

/** Concatenates a transformation matrix for translating each of the x, y, and z axes by the amount given in the corresponding element of the 3-element vector and store in it directly. */
export function translateSelf(v: V3.Vector3, m: Matrix4): Matrix4 {
    var x = v[0], y = v[1], z = v[2];

    if (base.engine === "css") {
        m[12] += x;
        m[13] += y;
        m[14] += z;
    }
    else {
        m[12] += m[0] * x + m[4] * y + m[8] * z;
        m[13] += m[1] * x + m[5] * y + m[9] * z;
        m[14] += m[2] * x + m[6] * y + m[10] * z;
        m[15] += m[3] * x + m[7] * y + m[11] * z;
    }

    return m;
}

//#endregion

//#region Scale Methods

/** Creates a transformation matrix for scaling each of the x, y, and z axes by the amount given in the corresponding element of the 3-element vector. */
export function makeScale(v: V3.Vector3, r?: Matrix4): Matrix4 {
    if (r === undefined)
        r = new base.ArrayType(16);

    var x = r[0], y = r[1], z = r[2];

    r[0] = x;
    r[1] = 0;
    r[2] = 0;
    r[3] = 0;
    r[4] = 0;
    r[5] = y;
    r[6] = 0;
    r[7] = 0;
    r[8] = 0;
    r[9] = 0;
    r[10] = z;
    r[11] = 0;
    r[12] = 0;
    r[13] = 0;
    r[14] = 0;
    r[15] = 1;

    return r;
}
/** Creates a transformation matrix for a uniform scale by a single scalar value. */
export function makeScale1(k: number, r?: Matrix4): Matrix4 {
    return makeScale([k, k, k], r);
}

/** Concatenates a transformation matrix for scaling each of the x, y, and z axes by the amount given in the corresponding element of the 3-element vector to the given matrix. */
export function scale(v: V3.Vector3, m: Matrix4, r?: Matrix4): Matrix4 {
    var x = v[0], y = v[1], z = v[2];

    if (r === m) {
        m[0] *= x;
        m[1] *= x;
        m[2] *= x;
        m[3] *= x;
        m[4] *= y;
        m[5] *= y;
        m[6] *= y;
        m[7] *= y;
        m[8] *= z;
        m[9] *= z;
        m[10] *= z;
        m[11] *= z;
        return m;
    }

    if (r === undefined)
        r = new base.ArrayType(16);

    r[0] = m[0] * x;
    r[1] = m[1] * x;
    r[2] = m[2] * x;
    r[3] = m[3] * x;
    r[4] = m[4] * y;
    r[5] = m[5] * y;
    r[6] = m[6] * y;
    r[7] = m[7] * y;
    r[8] = m[8] * z;
    r[9] = m[9] * z;
    r[10] = m[10] * z;
    r[11] = m[11] * z;
    r[12] = m[12];
    r[13] = m[13];
    r[14] = m[14];
    r[15] = m[15];

    return r;
}
/** Concatenates a transformation matrix for a uniform scale by a single scalar value to the given matrix. */
export function scale1(k: number, m: Matrix4, r?: Matrix4): Matrix4 {
    return scale([k, k, k], m, r);
}

/** Concatenates a transformation matrix for scaling each of the x, y, and z axes by the amount given in the corresponding element of the 3-element vector at the given center to the given matrix. */
export function scaleAt(v: V3.Vector3, pt: V3.Vector3, m: Matrix4, r?: Matrix4): Matrix4 {
    if (r === undefined)
        r = new base.ArrayType(16);

    var tmp = makeScale(v);
    var tmpPoint = transformPointAffine(tmp, pt);

    translate([pt[0] - tmpPoint[0], pt[1] - tmpPoint[1], pt[2] - tmpPoint[2]], tmp, tmp);
    mul(m, tmp, r);

    return r;
}

//#endregion

//#region Rotate Methods

/** Create a transformation matrix for rotation by angle radians about the 3-element vector axis. */
export function makeRotate(angle: number, axis: V3.Vector3, r?: Matrix4): Matrix4 {
    if (r === undefined)
        r = new base.ArrayType(16);

    axis = V3.normalize(axis, V3._temp1);
    var x = axis[0], y = axis[1], z = axis[2];
    var c = Math.cos(angle);
    var c1 = 1 - c;
    var s = Math.sin(angle);

    r[0] = x * x * c1 + c;
    r[1] = y * x * c1 + z * s;
    r[2] = z * x * c1 - y * s;
    r[3] = 0;
    r[4] = x * y * c1 - z * s;
    r[5] = y * y * c1 + c;
    r[6] = y * z * c1 + x * s;
    r[7] = 0;
    r[8] = x * z * c1 + y * s;
    r[9] = y * z * c1 - x * s;
    r[10] = z * z * c1 + c;
    r[11] = 0;
    r[12] = 0;
    r[13] = 0;
    r[14] = 0;
    r[15] = 1;

    return r;
}

/** Concatenates a rotation of angle radians about the 3-element vector axis to the given matrix. */
export function rotate(angle: number, axis: V3.Vector3, m: Matrix4, r?: Matrix4): Matrix4 {
    if (r === undefined)
        r = new base.ArrayType(16);

    var a0 = axis[0], a1 = axis[1], a2 = axis[2];
    var l = Math.sqrt(a0 * a0 + a1 * a1 + a2 * a2);
    var x = a0, y = a1, z = a2;

    if (l !== 1.0) {
        var im = 1.0 / l;
        x *= im;
        y *= im;
        z *= im;
    }

    var c = Math.cos(angle);
    var c1 = 1 - c;
    var s = Math.sin(angle);
    var xs = x * s;
    var ys = y * s;
    var zs = z * s;
    var xyc1 = x * y * c1;
    var xzc1 = x * z * c1;
    var yzc1 = y * z * c1;

    var m11 = m[0];
    var m21 = m[1];
    var m31 = m[2];
    var m41 = m[3];
    var m12 = m[4];
    var m22 = m[5];
    var m32 = m[6];
    var m42 = m[7];
    var m13 = m[8];
    var m23 = m[9];
    var m33 = m[10];
    var m43 = m[11];

    var t11 = x * x * c1 + c;
    var t21 = xyc1 + zs;
    var t31 = xzc1 - ys;
    var t12 = xyc1 - zs;
    var t22 = y * y * c1 + c;
    var t32 = yzc1 + xs;
    var t13 = xzc1 + ys;
    var t23 = yzc1 - xs;
    var t33 = z * z * c1 + c;

    r[0] = m11 * t11 + m12 * t21 + m13 * t31;
    r[1] = m21 * t11 + m22 * t21 + m23 * t31;
    r[2] = m31 * t11 + m32 * t21 + m33 * t31;
    r[3] = m41 * t11 + m42 * t21 + m43 * t31;
    r[4] = m11 * t12 + m12 * t22 + m13 * t32;
    r[5] = m21 * t12 + m22 * t22 + m23 * t32;
    r[6] = m31 * t12 + m32 * t22 + m33 * t32;
    r[7] = m41 * t12 + m42 * t22 + m43 * t32;
    r[8] = m11 * t13 + m12 * t23 + m13 * t33;
    r[9] = m21 * t13 + m22 * t23 + m23 * t33;
    r[10] = m31 * t13 + m32 * t23 + m33 * t33;
    r[11] = m41 * t13 + m42 * t23 + m43 * t33;

    if (r !== m) {
        r[12] = m[12];
        r[13] = m[13];
        r[14] = m[14];
        r[15] = m[15];
    }

    return r;
}

/** Concatenates a rotation of angle radians about the 3-element vector axis at the given center point to the given matrix. */
export function rotateAt(angle: number, pt: V3.Vector3, axis: V3.Vector3, m: Matrix4, r?: Matrix4): Matrix4 {
    if (r === undefined)
        r = new base.ArrayType(16);

    var tmp = makeRotate(angle, axis);
    var tmpPoint = transformPointAffine(tmp, pt);

    translate([pt[0] - tmpPoint[0], pt[1] - tmpPoint[1], pt[2] - tmpPoint[2]], tmp, tmp);
    mul(m, tmp, r);

    return r;
}

//#endregion

//#region Transform Methods

/** Transform the given point using the specified transformation matrix. */
export function transformPoint(m: Matrix4, v: V3.Vector3, r?: V3.Vector3): V3.Vector3 {
    if (r === undefined)
        r = new base.ArrayType(3);

    var v0 = v[0], v1 = v[1], v2 = v[2];

    r[0] = m[0] * v0 + m[4] * v1 + m[8] * v2 + m[12];
    r[1] = m[1] * v0 + m[5] * v1 + m[9] * v2 + m[13];
    r[2] = m[2] * v0 + m[6] * v1 + m[10] * v2 + m[14];
    var w = m[3] * v0 + m[7] * v1 + m[11] * v2 + m[15];

    if (w !== 1.0) {
        r[0] /= w;
        r[1] /= w;
        r[2] /= w;
    }

    return r;
}
/** Transform the given direction vector by the given transformation matrix. */
export function transformLine(m: Matrix4, v: V3.Vector3, r?: V3.Vector3): V3.Vector3 {
    if (r === undefined)
        r = new base.ArrayType(3);

    var v0 = v[0], v1 = v[1], v2 = v[2];
    r[0] = m[0] * v0 + m[4] * v1 + m[8] * v2;
    r[1] = m[1] * v0 + m[5] * v1 + m[9] * v2;
    r[2] = m[2] * v0 + m[6] * v1 + m[10] * v2;
    var w = m[3] * v0 + m[7] * v1 + m[11] * v2;

    if (w !== 1.0) {
        r[0] /= w;
        r[1] /= w;
        r[2] /= w;
    }

    return r;
}

/** Transform the given point by the given transformation matrix, assuming that it's orthonormal. */
export function transformPointAffine(m: Matrix4, v: V3.Vector3, r?: V3.Vector3): V3.Vector3 {
    if (r === undefined)
        r = new base.ArrayType(3);

    var v0 = v[0], v1 = v[1], v2 = v[2];

    r[0] = m[0] * v0 + m[4] * v1 + m[8] * v2 + m[12];
    r[1] = m[1] * v0 + m[5] * v1 + m[9] * v2 + m[13];
    r[2] = m[2] * v0 + m[6] * v1 + m[10] * v2 + m[14];

    return r;
}

/** Transform the given direction vector by the given transformation matrix, assuming that it's orthonormal. */
export function transformLineAffine(m: Matrix4, v: V3.Vector3, r?: V3.Vector3): V3.Vector3 {
    if (r === undefined)
        r = new base.ArrayType(3);

    var v0 = v[0], v1 = v[1], v2 = v[2];
    r[0] = m[0] * v0 + m[4] * v1 + m[8] * v2;
    r[1] = m[1] * v0 + m[5] * v1 + m[9] * v2;
    r[2] = m[2] * v0 + m[6] * v1 + m[10] * v2;

    return r;
}

//#endregion

//#region DOM Methods

/** Return the bounding box for the given element transformed by the given matrix. */
export function getBoundingClientRect(e: HTMLElement, m: Matrix4): base.BoundingBox {
    var w = e.offsetWidth,
        h = e.offsetHeight,
        tl = [0, 0, 0],
        tr = [w, 0, 0],
        bl = [0, h, 0],
        br = [w, h, 0];

    transformPointAffine(m, tl, tl);
    transformPointAffine(m, tr, tr);
    transformPointAffine(m, bl, bl);
    transformPointAffine(m, br, br);

    return {
        left: Math.min(tl[0], tr[0], bl[0], br[0]),
        top: Math.min(tl[1], tr[1], bl[1], br[1]),
        right: Math.max(tl[0], tr[0], bl[0], br[0]),
        bottom: Math.max(tl[1], tr[1], bl[1], br[1])
    };
}

/** Return the transformation matrix of the given element. */
export function getTransformationMatrix(e: HTMLElement): Matrix4 {
    var c: any = getComputedStyle(e, null);
    c = (c.transform || c.OTransform || c.WebkitTransform || c.msTransform || c.MozTransform || "none"); //.replace(/^none$/, "matrix(1,0,0,1,0,0)");
    return c === "none" ? clone(I) : fromCssMatrix(c);
}

/** Return the given position relative to specified element, by calculating transformation on the element */
export function getRelativePosition(x: number, y: number, e: HTMLElement): V3.Vector3 {
    var m = getAbsoluteTransformationMatrix(e),
        invert = inverse(m);

    return transformPointAffine(invert, [x, y, 0]);
}

//#endregion

//#region Get Absolute Transformation Matrix

var isBuggy;
function detectBuggy(): boolean {
    var div = document.createElement("div"),
        rect: ClientRect, result: boolean;

    div.style.cssText = "width:200px;height:200px;position:fixed;-moz-transform:scale(2);";
    document.body.appendChild(div);

    rect = div.getBoundingClientRect();
    result = !!((<any>getComputedStyle(div, null)).MozTransform && (rect.bottom - rect.top < 300)); // wow
    div.parentNode.removeChild(div);

    return result;
}
function M4_getAbsoluteTransformationMatrixBuggy(x: HTMLElement): Matrix4 {
    var transformationMatrix = clone(I),
        docElem = document.documentElement,
        parentRect, rect, t, c, s, origin, split;

    while (x && x !== document.documentElement) {
        t = clone(I);
        parentRect = x.parentNode && (<HTMLElement>x.parentNode).getBoundingClientRect ? (<HTMLElement>x.parentNode).getBoundingClientRect() : null;
        rect = x.getBoundingClientRect();

        if (parentRect) {
            translateSelf([rect.left - parentRect.left, rect.top - parentRect.top, 0], t);
        }

        s = getComputedStyle(x, null);
        c = (s.MozTransform || "none"); //.replace(/^none$/, "matrix(1,0,0,1,0,0)");

        if (c !== "none") {
            c = fromCssMatrix(c);

            origin = s.MozTransformOrigin || "0 0";
            if (origin.indexOf("%") !== -1) { // Firefox gives 50% 50% when there is no transform!? and pixels (50px 30px) otherwise
                origin = "0 0";
            }
            split = origin.split(" ");
            origin = translate([split[0], split[1], 0], I);

            // transformationMatrix = t * origin * c * origin^-1 * transformationMatrix
            mul(t, origin, t);
            mul(t, c, t);
            mul(t, inverse(origin), t);
            mul(t, transformationMatrix, transformationMatrix);
            //transformationMatrix = multiply(multiply(multiply(multiply(t, origin), c), inverse(origin)), transformationMatrix);
        }

        x = <HTMLElement>x.parentNode;
    }

    translateSelf([-window.pageXOffset, -window.pageYOffset, 0], transformationMatrix);

    return transformationMatrix;
}
function M4_getAbsoluteTransformationMatrix(element: HTMLElement): Matrix4 {
    var transformationMatrix = clone(I),
        x = element, rect = element.getBoundingClientRect(),
        docElem = document.documentElement,
        c, r;

    while (x && x !== docElem) {
        c = getComputedStyle(x, null);
        c = (c.transform || c.WebkitTransform || c.msTransform || c.MozTransform || c.OTransform || "none"); //.replace(/^none$/, "matrix(1,0,0,1,0,0)");

        if (c !== "none") {
            c = fromCssMatrix(c);
            mul(c, transformationMatrix, transformationMatrix);
        }

        x = <HTMLElement>x.parentNode;
    }

    r = getBoundingClientRect(element, transformationMatrix);
    translateSelf([rect.left - r.left, rect.top - r.top, 0], transformationMatrix);

    return transformationMatrix;
}

/** Return the absolute transformation by multiplying each parent matrix transformation */
export function getAbsoluteTransformationMatrix(e: HTMLElement): Matrix4 {
    if (isBuggy === undefined)
        isBuggy = detectBuggy();

    return isBuggy ? M4_getAbsoluteTransformationMatrixBuggy(e) : M4_getAbsoluteTransformationMatrix(e);
}

//#endregion
