import React, { Component } from "react";
import * as THREE from "three";

import { CorrugatedGeometry } from "./geometry";
import * as uniforms from "./uniforms";
import * as materials from "./materials";
import * as orbits from "three-orbit-controls";

class Scene extends Component {
  componentDidMount() {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;

    // Init scene
    this.initCamera(width, height);
    this.initScene(width, height);
    this.initializeOrbits();

    // Add meshes to scene
    const meshes = this.initMeshes();
    meshes.forEach(el => {
      this.scene.add(el);
    });

    // Render scene
    this.renderScene();
  }

  initMeshes = () => {
    // Geometry
    const geometryPositive = new CorrugatedGeometry().draw(25, 25);
    const sphereLightGeometry = new THREE.SphereGeometry(10, 10, 10);
    const boxGeometry = new THREE.BoxBufferGeometry(35, 35, 35);
    const groundGeometry = new THREE.BoxBufferGeometry(350, 350, 2);

    // Uniforms
    this.uniforms = uniforms.timeUniform();
    this.figureUniform = uniforms.figureUniform();

    // Materials
    const figureShaderMaterial = materials.figureShaderMaterial(
      this.figureUniform
    );
    const groundMaterial = materials.groundShaderMaterial(this.uniforms);
    const shaderMaterial = materials.cubeShaderMaterial(this.uniforms);
    const LightMat = new THREE.MeshLambertMaterial({ color: 0xff0000 });

    // Lights
    this.light = new THREE.PointLight(0xffee88, 1, 0);
    this.light.position.set(0, 300, 100);

    // Meshes
    this.meshLight = new THREE.Mesh(sphereLightGeometry, LightMat);
    this.meshLight.position.set(0, 2, 0);

    const figureMesh = new THREE.Mesh(geometryPositive, figureShaderMaterial);
    const boxMesh = new THREE.Mesh(boxGeometry, shaderMaterial);
    boxMesh.position.set(100, 0, 20);
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);

    return [figureMesh, boxMesh, groundMesh, this.light, this.meshLight];
  };

  initCamera = (width, height) => {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 1000);
    this.camera.position.set(0, -350, 150);
  };

  initScene = (width, height) => {
    const OrbitControls = orbits(THREE);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x34465e);
    this.mount.appendChild(this.renderer.domElement);
  };

  initializeOrbits = () => {
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.panSpeed = 0.8;
  };

  renderScene = () => {
    this.frameId = window.requestAnimationFrame(this.renderScene);
    this.renderer.render(this.scene, this.camera);
    this.clock = new THREE.Clock();

    setInterval(() => {
      const delta = (this.clock && this.clock.getDelta()) || 0;
      if (this.uniforms) this.uniforms.time.value += delta * 5;

      this.light.position.y = 100;
      this.light.position.x = 500 * Math.sin(Date.now() / 240);
      this.light.position.z = 500 * Math.cos(Date.now() / 240);
      this.meshLight.position.y = 100;
      this.meshLight.position.x = 500 * Math.sin(Date.now() / 240);
      this.meshLight.position.z = 500 * Math.cos(Date.now() / 240);
      this.figureUniform.delta.value = delta;
    }, 30);
  };

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
export default Scene;
