import * as tree from "three";
import { IGeometry } from "./IGeometry";

interface ICorrugatedGeometryOpts {
  R?: number;
  N?: number;
  A?: number;
}

export class CorrugatedGeometry implements IGeometry {
  private readonly _r: number;
  private readonly _n: number;
  private readonly _a: number;

  constructor(opts: ICorrugatedGeometryOpts = {}) {
    this._r = opts.R || 50;
    this._n = opts.N || 30;
    this._a = opts.A || 5;
  }

  public draw(slices: number, stack: number) {
    const figure = new tree.ParametricGeometry(this.drawFigure, slices, stack);
    return figure;
  }

  public drawFigure = (u: number, v: number, target: any) => {
    u = u * Math.PI * 2;
    v = v * Math.PI;

    const R = this._r;
    const N = this._n;
    const A = this._a;

    const k1 = R * Math.cos(v) + A * (1 - Math.sin(v));
    const k2 = Math.abs(Math.cos(N * u));

    const x = k1 * k2 * Math.cos(u);
    const y = k1 * k2 * Math.sin(u);
    const z = R * Math.sin(v);

    target.set(x, y, z);
  };
}
