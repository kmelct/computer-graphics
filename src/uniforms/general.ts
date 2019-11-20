import * as three from "three";

export const timeUniform = () => ({
  time: { value: 1.0 }
});

export const figureUniform = () => {
  const a = three.UniformsUtils.merge([
    three.UniformsLib["lights"],
    three.UniformsLib["common"],
    {
      myColour: { value: new three.Vector4(0, 1, 1, 1) },
      delta: { value: 0 }
    }
  ]);
};
