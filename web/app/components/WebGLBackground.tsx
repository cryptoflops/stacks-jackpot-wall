'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const fragmentShader = `
uniform float time;
uniform vec2 resolution;

varying vec2 vUv;

void main() {
    vec2 p = -1.0 + 2.0 * vUv;
    float d = length(p);

    // Deep Midnight Purple Base
    vec3 color = vec3(0.015, 0.01, 0.05);

    // Aurora Waves
    for(float i = 1.0; i < 4.0; i++) {
        p.x += 0.3 / i * sin(i * 3.0 * p.y + time + i * 14.0);
        p.y += 0.4 / i * cos(i * 2.5 * p.x + time + i * 18.0);
        
        float intensity = 0.005 / abs(p.y + sin(p.x * 2.0));
        
        // Stacks Purple & Deep Zinc tones
        vec3 auroraColor = vec3(0.33, 0.27, 1.0) * intensity;
        if(i > 2.0) auroraColor = vec3(0.99, 0.39, 0.2) * (intensity * 0.4); // Subtle accent
        
        color += auroraColor;
    }

    // Vignette
    color *= 1.0 - d * 0.5;

    gl_FragColor = vec4(color, 1.0);
}
`;

const vertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

function AuroraMaterial() {
    const meshRef = useRef<THREE.Mesh>(null);

    const uniforms = useMemo(() => ({
        time: { value: 0 },
        resolution: { value: new THREE.Vector2() }
    }), []);

    useFrame((state) => {
        if (meshRef.current) {
            const material = meshRef.current.material as THREE.ShaderMaterial;
            material.uniforms.time.value = state.clock.getElapsedTime() * 0.5;
        }
    });

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                fragmentShader={fragmentShader}
                vertexShader={vertexShader}
                uniforms={uniforms}
                depthWrite={false}
                depthTest={false}
            />
        </mesh>
    );
}

export default function WebGLBackground() {
    return (
        <div className="fixed inset-0 -z-10 bg-[#020108]">
            <Canvas camera={{ position: [0, 0, 1] }}>
                <AuroraMaterial />
            </Canvas>
            {/* Subtle Overlay to blend with UI */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60 pointer-events-none" />
        </div>
    );
}
