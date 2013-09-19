/// <reference path="../_definitions.d.ts" />

export interface WebGLFloatArray extends Float32Array { }

export interface BoundingBox {
    top: number;
    left: number;
    right: number;
    bottom: number;
}

export var ArrayType: any = Array;
export var arrayTypes: any = { simple: Array };

export var engine = "css";
export var engines = { css: "css", webgl: "webgl", tree: "treejs" }; //future implementation

if ("Float32Array" in window) {
    ArrayType = Float32Array;
    arrayTypes.float32 = Float32Array;
}

if ("Float64Array" in window) {
    arrayTypes.float64 = Float64Array;
}

if ("WebGLFloatArray" in window) {
    arrayTypes.webgl = (<any>window).WebGLFloatArray;
}
