import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function OverlayRenderer({
    imageUrl,
    zoom,
    rotateY,
    opacity,
    offsetX,
    offsetY,
    onDragStart,
    onDragMove,
    onDragEnd
}) {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    
    // Keep refs for animation loop update
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const planeMeshRef = useRef(null);
    const particleSystemRef = useRef(null);
    const textureLoaderRef = useRef(null);

    // Mouse drag state tracking inside canvas
    const isDragging = useRef(false);
    const previousMousePosition = useRef({ x: 0, y: 0 });

    // Handle mouse events on canvas
    const handleMouseDown = (e) => {
        isDragging.current = true;
        previousMousePosition.current = {
            x: e.clientX,
            y: e.clientY
        };
        if (onDragStart) onDragStart();
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;

        const deltaX = e.clientX - previousMousePosition.current.x;
        const deltaY = e.clientY - previousMousePosition.current.y;

        previousMousePosition.current = {
            x: e.clientX,
            y: e.clientY
        };

        if (onDragMove) {
            // Send relative drag changes up to parent container
            onDragMove(deltaX * 0.015, -deltaY * 0.015);
        }
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        if (onDragEnd) onDragEnd();
    };

    // Touch events for mobile screens
    const handleTouchStart = (e) => {
        if (e.touches.length !== 1) return;
        isDragging.current = true;
        previousMousePosition.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
        if (onDragStart) onDragStart();
    };

    const handleTouchMove = (e) => {
        if (!isDragging.current || e.touches.length !== 1) return;

        const deltaX = e.touches[0].clientX - previousMousePosition.current.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.current.y;

        previousMousePosition.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };

        if (onDragMove) {
            onDragMove(deltaX * 0.015, -deltaY * 0.015);
        }
    };

    const handleTouchEnd = () => {
        isDragging.current = false;
        if (onDragEnd) onDragEnd();
    };

    // Initialize Three.js
    useEffect(() => {
        if (!containerRef.current || !canvasRef.current) return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        // 1. Create Scene & Camera
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
        camera.position.z = 8;
        cameraRef.current = camera;

        // 2. Create WebGL Renderer
        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            alpha: true, // Transparent canvas background
            antialias: true,
            preserveDrawingBuffer: true // Required to capture snapshot images!
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        rendererRef.current = renderer;

        // 3. Add Ambient & Directional Lighting for glow highlighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x6366f1, 2, 50);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        // 4. Create floating particle system (Holographic stars/dust)
        const particleCount = 120;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 12; // X
            positions[i + 1] = (Math.random() - 0.5) * 10; // Y
            positions[i + 2] = (Math.random() - 0.5) * 8; // Z
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Create round glowing particles
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 16, 16);

        const particleTexture = new THREE.CanvasTexture(canvas);
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.12,
            map: particleTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            color: 0x818cf8 // Glow tint indigo-400
        });

        const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particleSystem);
        particleSystemRef.current = particleSystem;

        // 5. Initialize Texture Loader
        const textureLoader = new THREE.TextureLoader();
        textureLoaderRef.current = textureLoader;

        // 6. Animation loop
        let animationFrameId;
        const clock = new THREE.Clock();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            const elapsedTime = clock.getElapsedTime();

            // Rotate particles slowly in the background
            if (particleSystemRef.current) {
                particleSystemRef.current.rotation.y = elapsedTime * 0.05;
                particleSystemRef.current.rotation.x = elapsedTime * 0.02;
            }

            // Subtle vertical float animation for the landmark plane
            if (planeMeshRef.current && !isDragging.current) {
                planeMeshRef.current.position.y = offsetY + Math.sin(elapsedTime * 1.5) * 0.12;
            }

            renderer.render(scene, camera);
        };

        animate();

        // 7. Handle Resizing
        const handleResize = () => {
            if (!containerRef.current || !camera || !renderer) return;
            const w = containerRef.current.clientWidth;
            const h = containerRef.current.clientHeight;

            camera.aspect = w / h;
            camera.updateProjectionMatrix();

            renderer.setSize(w, h);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            if (renderer) renderer.dispose();
        };
    }, []);

    // Load & Update Monument Texture when imageUrl changes
    useEffect(() => {
        if (!sceneRef.current || !textureLoaderRef.current || !imageUrl) return;

        // Remove old mesh if exists
        if (planeMeshRef.current) {
            sceneRef.current.remove(planeMeshRef.current);
            planeMeshRef.current.geometry.dispose();
            if (Array.isArray(planeMeshRef.current.material)) {
                planeMeshRef.current.material.forEach(m => m.dispose());
            } else {
                planeMeshRef.current.material.dispose();
            }
            planeMeshRef.current = null;
        }

        // Load new texture
        textureLoaderRef.current.load(imageUrl, (texture) => {
            // Keep original aspect ratio of the image
            const imageAspect = texture.image.width / texture.image.height;
            const planeWidth = 4.5 * imageAspect;
            const planeHeight = 4.5;

            const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
            
            // Premium double-sided glowing transparent material
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                opacity: opacity,
                side: THREE.DoubleSide,
                depthWrite: false
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(offsetX, offsetY, 0);
            mesh.scale.set(zoom, zoom, zoom);
            mesh.rotation.y = rotateY;

            sceneRef.current.add(mesh);
            planeMeshRef.current = mesh;
        });
    }, [imageUrl]);

    // Update mesh transformations in real-time based on state props
    useEffect(() => {
        if (planeMeshRef.current) {
            planeMeshRef.current.scale.set(zoom, zoom, zoom);
            planeMeshRef.current.rotation.y = rotateY;
            planeMeshRef.current.position.x = offsetX;
            // Immediate position override (ignores float animation while updating/resetting)
            planeMeshRef.current.position.y = offsetY;
            
            if (Array.isArray(planeMeshRef.current.material)) {
                planeMeshRef.current.material.forEach(m => m.opacity = opacity);
            } else {
                planeMeshRef.current.material.opacity = opacity;
            }
        }
    }, [zoom, rotateY, opacity, offsetX, offsetY]);

    return (
        <div 
            ref={containerRef} 
            className="absolute inset-0 w-full h-full z-10 cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
    );
}
