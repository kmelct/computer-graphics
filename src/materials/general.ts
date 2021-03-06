import * as three from "three";

export const figureShaderMaterial = (uniforms: any) =>
  new three.ShaderMaterial({
    uniforms,
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
    }
  `
  });

export const groundShaderMaterial = (uniforms: any) =>
  new three.ShaderMaterial({
    uniforms,
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

export const cubeShaderMaterial = (uniforms: any) =>
  new three.ShaderMaterial({
    uniforms,
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
