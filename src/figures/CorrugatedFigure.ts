import { IFigure } from "./IFigure";

interface ICorrugatedFigureOpts {
  R?: number;
  N?: number;
  A?: number;
}

export class CorrugatedFigure implements IFigure {
  private readonly _r: number;
  private readonly _n: number;
  private readonly _a: number;

  constructor(opts: ICorrugatedFigureOpts = {}) {
    this._r = opts.R || 5;
    this._n = opts.N || 30;
    this._a = opts.A || 5;
  }

  draw = (u: number, v: number, target: any) => {
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
