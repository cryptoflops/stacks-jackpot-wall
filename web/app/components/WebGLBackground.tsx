'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const fragmentShader = `
uniform float time;
uniform vec2 resolution;
uniform vec2 uMouse;

varying vec2 vUv;

void main() {
    vec2 p = -1.0 + 2.0 * vUv;
    p.x *= resolution.x / resolution.y;
    
    // Mouse influence
    vec2 m = uMouse * 2.0 - 1.0;
    m.x *= resolution.x / resolution.y;
    
    float d = length(p);
    float distToMouse = length(p - m);

    // Deep Midnight Purple Base
    vec3 color = vec3(0.01, 0.005, 0.03);

    // Aurora Waves
    for(float i = 1.0; i < 5.0; i++) {
        // Distortion influenced by mouse
        float mouseDistort = 0.2 / (distToMouse + 0.5) * exp(-distToMouse * 2.0);
        
        p.x += 0.3 / i * sin(i * 3.0 * p.y + time + i * 14.0) + mouseDistort * m.x;
        p.y += 0.4 / i * cos(i * 2.5 * p.x + time + i * 18.0) + mouseDistort * m.y;
        
        float intensity = 0.006 / abs(p.y + sin(p.x * 1.5 + time * 0.2));
        
        // Dynamic colors
        vec3 auroraColor = vec3(0.3, 0.2, 0.9) * intensity;
        if(i > 2.0) auroraColor = vec3(1.0, 0.4, 0.2) * (intensity * 0.5);
        if(i > 3.0) auroraColor = vec3(0.1, 0.8, 0.6) * (intensity * 0.3);
        
        color += auroraColor * (1.0 + mouseDistort * 2.0);
    }

    // Glow at mouse position
    float light = 0.05 / (distToMouse + 0.1);
    color += vec3(0.3, 0.2, 1.0) * light * 0.5;

    // Vignette
    color *= 1.1 - d * 0.4;

    gl_FragColor = vec4(color, 1.0);
}
`;

const vertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`;

function AuroraMaterial() {
    const meshRef = useRef<THREE.Mesh>(null);
    const { size } = useThree();

    const uniforms = useMemo(() => ({
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(size.width, size.height) },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) }
    }), []);

    useFrame((state) => {
        if (meshRef.current) {
            const material = meshRef.current.material as THREE.ShaderMaterial;
            material.uniforms.time.value = state.clock.getElapsedTime() * 0.4;
            material.uniforms.resolution.value.set(state.size.width, state.size.height);

            // Smoothly move mouse uniform
            const targetX = state.mouse.x * 0.5 + 0.5;
            const targetY = state.mouse.y * 0.5 + 0.5;
            material.uniforms.uMouse.value.x += (targetX - material.uniforms.uMouse.value.x) * 0.05;
            material.uniforms.uMouse.value.y += (targetY - material.uniforms.uMouse.value.y) * 0.05;
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
        <div className="fixed inset-0 -z-10 bg-[#020108] w-full h-full overflow-hidden">
            <Canvas gl={{ antialias: false, stencil: false, depth: false }} dpr={[1, 2]}>
                <AuroraMaterial />
            </Canvas>
            {/* Subtle Overlay to blend with UI */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80 pointer-events-none" />
        </div>
    );
}
