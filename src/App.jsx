import React, { Component } from "react";
import * as THREE from "three";

import { CorrugatedGeometry } from "./geometry";
import * as uniforms from "./uniforms";
import * as materials from "./materials";

const OrbitControls = require("three-orbit-controls")(THREE);

class Shape extends Component {
  constructor(props) {
    super(props);
    this.animate = this.animate.bind(this);
    this.addCube = this.addCube.bind(this);
    this.initializeOrbits = this.initializeOrbits.bind(this);
  }
  componentDidMount() {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 1000);
    this.camera.position.set(0, -350, 150);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x34465e);
    this.mount.appendChild(this.renderer.domElement);
    this.initializeOrbits();

    // Geometry
    const geometryPositive = new CorrugatedGeometry().draw(25, 25);
    var sphereLight = new THREE.SphereGeometry(10, 10, 10);
    var box = new THREE.BoxBufferGeometry(35, 35, 35);
    var ground = new THREE.BoxBufferGeometry(350, 350, 2);

    // Uniforms
    this.uniforms = uniforms.timeUniform();
    this.figureUniform = THREE.UniformsUtils.merge([
      THREE.UniformsLib["ambient"],
      THREE.UniformsLib["lights"],
      {
        myColour: { value: new THREE.Vector4(0, 1, 1, 1) },
        delta: { value: 0 }
      }
    ]);

    // Materials
    const figureShaderMaterial = materials.figureShaderMaterial(
      this.figureUniform
    );
    const groundMaterial = materials.groundShaderMaterial(this.uniforms);
    const shaderMaterial = materials.cubeShaderMaterial(this.uniforms);

    this.light = new THREE.PointLight(0xffee88, 1, 0);
    this.light.position.set(0, 300, 100);
    this.scene.add(this.light);

    var LightMat = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    this.meshLight = new THREE.Mesh(sphereLight, LightMat);
    this.meshLight.position.set(0, 2, 0);
    this.scene.add(this.meshLight);

    var meshPositive = new THREE.Mesh(geometryPositive, figureShaderMaterial);
    const mesh = new THREE.Mesh(box, shaderMaterial);
    const groundMesh = new THREE.Mesh(ground, groundMaterial);
    mesh.position.set(100, 0, 20);
    this.clock = new THREE.Clock();

    setInterval(() => {
      var delta = (this.clock && this.clock.getDelta()) || 0;
      if (this.uniforms) this.uniforms.time.value += delta * 5;

      this.light.position.y = 100;
      this.light.position.x = 500 * Math.sin(Date.now() / 240);
      this.light.position.z = 500 * Math.cos(Date.now() / 240);
      this.meshLight.position.y = 100;
      this.meshLight.position.x = 500 * Math.sin(Date.now() / 240);
      this.meshLight.position.z = 500 * Math.cos(Date.now() / 240);
      this.figureUniform.delta.value = delta;
    }, 30);

    this.scene.add(mesh);
    this.scene.add(meshPositive);
    this.scene.add(groundMesh);

    this.animate();
  }
  componentWillUnmount() {
    cancelAnimationFrame(this.frameId);
    this.mount.removeChild(this.renderer.domElement);
  }
  initializeOrbits() {
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.panSpeed = 0.8;
  }

  animate() {
    this.frameId = window.requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  }
  addCube(cube) {
    this.scene.add(cube);
  }
  render() {
    return (
      <div>
        <div
          id="boardCanvas"
          style={{ width: "80vw", height: "40vw" }}
          ref={mount => {
            this.mount = mount;
          }}
        />
      </div>
    );
  }
}
export default Shape;
