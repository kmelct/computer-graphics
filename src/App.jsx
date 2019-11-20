import React, { Component } from "react";
import * as THREE from "three";

import { CorrugatedGeometry } from "./geometry";
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

    const geometryPositive = new CorrugatedGeometry().draw(25, 25);

    this.uniforms = {
      time: { value: 1.0 }
    };

    this.figureUniform = THREE.UniformsUtils.merge([
      THREE.UniformsLib["ambient"],
      THREE.UniformsLib["lights"],
      {
        myColour: { value: new THREE.Vector4(0, 1, 1, 1) },
        delta: { value: 0 }
      }
    ]);

    this.light = new THREE.PointLight(0xffee88, 1, 0);
    this.light.position.set(0, 300, 100);
    this.scene.add(this.light);

    var sphereLight = new THREE.SphereGeometry(10, 10, 10);
    var box = new THREE.BoxBufferGeometry(35, 35, 35);
    var ground = new THREE.BoxBufferGeometry(350, 350, 2);

    var LightMat = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    this.meshLight = new THREE.Mesh(sphereLight, LightMat);
    this.meshLight.position.set(0, 2, 0);
    this.scene.add(this.meshLight);

    const figureShaderMaterial = new THREE.ShaderMaterial({
      uniforms: this.figureUniform,
      lights: true,
      vertexShader: `
      varying vec3 vViewPosition; //VertexPos
	varying vec3 vNormal;

	attribute float vertexDisplacement;
    uniform float delta;
    varying float vOpacity;
   	varying vec3 vUv;

  void main() {
    	vec3 transformed = vec3( position );
    	vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 ); //Eye-coordinate position
    	vViewPosition = - mvPosition.xyz;

		vUv = position;
    	vOpacity = vertexDisplacement;

    	vec3 p = position;
    	p.x += sin(p.y + delta );

      	vNormal = normalMatrix * normal;
      	gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
   }
`,
      fragmentShader: `
      uniform vec4 myColour;
    varying vec3 vViewPosition; //Translation component of view matrix
    varying vec3 vNormal;

		uniform float delta;
    	varying float vOpacity;
    	varying vec3 vUv;


  struct PointLight {
    vec3 position;
    vec3 color;
    float distance;
    float decay;

    int shadow;
    float shadowBias;
    float shadowRadius;
    vec2 shadowMapSize;
    float shadowCameraNear;
    float shadowCameraFar;
  };

   uniform PointLight pointLights[ NUM_POINT_LIGHTS ];

    void main() {

      vec3 mvPosition = -vViewPosition; //Eye coordinate space

      vec4 addedLights = vec4(0.1, 0.1, 0.1, 1.0);
      for(int l = 0; l < NUM_POINT_LIGHTS; l++) {
        vec3 lightDirection = normalize(pointLights[l].position -  mvPosition   );
        addedLights.rgb += clamp(dot(lightDirection, vNormal), 0.0, 1.0) * pointLights[l].color;
      }
      gl_FragColor = myColour * addedLights;//mix(vec4(diffuse.x, diffuse.y, diffuse.z, 1.0), addedLights, addedLights);
    }`
    });

    var groundMaterial = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
      varying vec2 vUv;
			void main()
			{
				vUv = uv;
				vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
				gl_Position = projectionMatrix * mvPosition;
			}`,
      fragmentShader: `
      uniform float time;
			varying vec2 vUv;
			void main( void ) {
				vec2 position = - 1.0 + 2.0 * vUv;
				float red = abs( sin( position.x * position.y + time / 5.0 ) );
				float green = abs( sin( position.x * position.y + time / 4.0 ) );
				float blue = abs( sin( position.x * position.y + time / 3.0 ) );
				gl_FragColor = vec4( red, green, blue, 1.0 );
			}
      `
    });

    var shaderMaterial = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
      varying vec2 vUv;
			void main()
			{
				vUv = uv;
				vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
				gl_Position = projectionMatrix * mvPosition;
			}`,
      fragmentShader: `
			uniform float time;
			varying vec2 vUv;
			void main(void) {
				vec2 p = - 1.0 + 2.0 * vUv;
				float a = time * 40.0;
				float d, e, f, g = 1.0 / 40.0 ,h ,i ,r ,q;
				e = 400.0 * ( p.x * 0.5 + 0.5 );
				f = 400.0 * ( p.y * 0.5 + 0.5 );
				i = 200.0 + sin( e * g + a / 150.0 ) * 20.0;
				d = 200.0 + cos( f * g / 2.0 ) * 18.0 + cos( e * g ) * 7.0;
				r = sqrt( pow( abs( i - e ), 2.0 ) + pow( abs( d - f ), 2.0 ) );
				q = f / r;
				e = ( r * cos( q ) ) - a / 2.0;
				f = ( r * sin( q ) ) - a / 2.0;
				d = sin( e * g ) * 176.0 + sin( e * g ) * 164.0 + r;
				h = ( ( f + d ) + a / 2.0 ) * g;
				i = cos( h + r * p.x / 1.3 ) * ( e + e + a ) + cos( q * g * 6.0 ) * ( r + h / 3.0 );
				h = sin( f * g ) * 144.0 - sin( e * g ) * 212.0 * p.x;
				h = ( h + ( f - e ) * q + sin( r - ( a + h ) / 7.0 ) * 10.0 + i / 4.0 ) * g;
				i += cos( h * 2.3 * sin( a / 350.0 - q ) ) * 184.0 * sin( q - ( r * 4.3 + a / 12.0 ) * g ) + tan( r * g + h ) * 184.0 * cos( r * g + h );
				i = mod( i / 5.6, 256.0 ) / 64.0;
				if ( i < 0.0 ) i += 4.0;
				if ( i >= 2.0 ) i = 4.0 - i;
				d = r / 350.0;
				d += sin( d * d * 8.0 ) * 0.52;
				f = ( sin( a * g ) + 1.0 ) / 2.0;
				gl_FragColor = vec4( vec3( f * i / 1.6, i / 2.0 + d / 13.0, i ) * d * p.x + vec3( i / 1.3 + d / 8.0, i / 2.0 + d / 18.0, i ) * d * ( 1.0 - p.x ), 1.0 );
			}`
    });

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
      // mesh.material.uniforms.delta.needsUpdate = true;
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
