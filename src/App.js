/* 
Iridescent Shader Material
Created by Fabio Ottaviani
https://linktr.ee/supahfunk
*/

import { Suspense, useRef, useMemo } from "react";
import { useFrame, Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useControls } from "leva";
import { Vector3 } from "three";
import "./styles.css";

const Suzanne = () => {
  const { nodes } = useGLTF("./suzanne.glb", true);
  const $mesh = useRef();

  const opts = useControls({
    red: {
      min: -1,
      max: 1,
      value: 0.3,
    },
    green: {
      min: -1,
      max: 1,
      value: 0.2,
    },
    blue: {
      min: -1,
      max: 1,
      value: -0.2,
    },
    shade: {
      min: 3,
      max: 30,
      value: 20,
    },
    animate: true,
  });

  useFrame(() => {
    if (opts.animate) {
      $mesh.current.material.uniforms.uTime.value += 0.02;
    }
    $mesh.current.material.uniforms.uColor.value = new Vector3(
      opts.red,
      opts.green,
      opts.blue
    );
    $mesh.current.material.uniforms.uShade.value = opts.shade;
  });

  const shaderArgs = useMemo(
    () => ({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Vector3(opts.red, opts.green, opts.blue) }, // Color Correction
        uShade: { value: opts.shade },
      },
      vertexShader: /*glsl*/ `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      } 
    `,
      fragmentShader: /*glsl*/ `
      varying vec3 vNormal;
      uniform float uTime;
      uniform float uShade;
      uniform vec3 uColor;
      void main() {
        gl_FragColor = vec4(vNormal * (sin(vNormal.z * uShade + uTime * 3.) * .5 + .5) + uColor, 1.);
      } 
    `,
    }),
    [opts]
  );

  return (
    <mesh ref={$mesh} geometry={nodes.Suzanne.geometry}>
      <shaderMaterial args={[shaderArgs]} />
    </mesh>
  );
};

export default function App() {
  return (
    <Canvas
      camera={{
        position: [-1, 0.1, 3],
      }}
    >
      <OrbitControls />
      <Suspense fallback={null}>
        <Suzanne />
      </Suspense>
    </Canvas>
  );
}
