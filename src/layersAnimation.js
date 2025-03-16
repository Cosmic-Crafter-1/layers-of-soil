import * as THREE from 'three'
import gsap from 'gsap'

/**
 * This module contains all the layer animation functions
 * Each function animates a specific soil layer when clicked
 */

// Helper function to create and show the back button
function showBackButton(callback) {
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.style.display = 'block';
        backButton.onclick = callback;
    }
}

// Helper function to hide the back button
function hideBackButton() {
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.style.display = 'none';
        backButton.onclick = null;
    }
}

// Helper function to configure controls for zoomed state
function configureControlsForZoomedState(controls, targetObject) {
    // Store original control settings
    const originalSettings = {
        enableZoom: controls.enableZoom,
        enablePan: controls.enablePan,
        minPolarAngle: controls.minPolarAngle,
        maxPolarAngle: controls.maxPolarAngle,
        minAzimuthAngle: controls.minAzimuthAngle,
        maxAzimuthAngle: controls.maxAzimuthAngle
    };

    // Disable zooming and panning
    controls.enableZoom = false;
    controls.enablePan = false;

    // Fix the polar angle to maintain the isometric view
    // This locks the up/down rotation while allowing left/right
    controls.minPolarAngle = controls.getPolarAngle();
    controls.maxPolarAngle = controls.getPolarAngle();

    // Allow full horizontal rotation
    controls.minAzimuthAngle = -Infinity;
    controls.maxAzimuthAngle = Infinity;

    // Set the target to the object's position
    if (targetObject) {
        controls.target.copy(targetObject.position);
    }

    // Enable controls for horizontal rotation only
    controls.enabled = true;

    // Return function to restore original settings
    return function restoreControls() {
        controls.enableZoom = originalSettings.enableZoom;
        controls.enablePan = originalSettings.enablePan;
        controls.minPolarAngle = originalSettings.minPolarAngle;
        controls.maxPolarAngle = originalSettings.maxPolarAngle;
        controls.minAzimuthAngle = originalSettings.minAzimuthAngle;
        controls.maxAzimuthAngle = originalSettings.maxAzimuthAngle;
    };
}

/**
 * Animate Humus Layer
 * Zooms in on the humus layer and hides other layers
 */
export function animateHumusLayer(humusLayer, grassLayer, topsoil, subsoil, parentRock, bedRock, model2, camera, controls, isExpanded, playWhooshSound, onComplete) {
    // Flag to track if animation is in progress
    let animationInProgress = true;

    // Store original camera position and rotation to return to later
    const originalCameraPosition = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
    };

    const originalCameraRotation = {
        x: camera.rotation.x,
        y: camera.rotation.y,
        z: camera.rotation.z
    };

    // Store original positions of all layers explicitly
    const originalPositions = {
        grassLayer: { x: grassLayer.position.x, y: grassLayer.position.y, z: grassLayer.position.z },
        humusLayer: { x: humusLayer.position.x, y: humusLayer.position.y, z: humusLayer.position.z },
        topsoil: { x: topsoil.position.x, y: topsoil.position.y, z: topsoil.position.z },
        subsoil: { x: subsoil.position.x, y: subsoil.position.y, z: subsoil.position.z },
        parentRock: { x: parentRock.position.x, y: parentRock.position.y, z: parentRock.position.z },
        bedRock: { x: bedRock.position.x, y: bedRock.position.y, z: bedRock.position.z }
    };

    // Store original scale of humus layer
    const originalHumusScale = {
        x: humusLayer.scale.x,
        y: humusLayer.scale.y,
        z: humusLayer.scale.z
    };

    // Disable orbit controls during animation
    controls.enabled = false;

    // Create a timeline for sequential animations
    const timeline = gsap.timeline({
        onComplete: () => {
            // Animation is complete, allow clicking
            animationInProgress = false;

            // Configure controls for zoomed state (only horizontal rotation)
            const restoreControlSettings = configureControlsForZoomedState(controls, humusLayer);

            // Show the back button
            showBackButton(() => handleReturn(restoreControlSettings));
        }
    });

    // Move other layers far away
    timeline.to(grassLayer.position, {
        y: -100,
        duration: 1,
        ease: 'power2.inOut'
    }, 0);

    timeline.to(topsoil.position, {
        y: -100,
        duration: 1,
        ease: 'power2.inOut'
    }, 0);

    timeline.to(subsoil.position, {
        y: -100,
        duration: 1,
        ease: 'power2.inOut'
    }, 0);

    timeline.to(parentRock.position, {
        y: -100,
        duration: 1,
        ease: 'power2.inOut'
    }, 0);

    timeline.to(bedRock.position, {
        y: -100,
        duration: 1,
        ease: 'power2.inOut'
    }, 0);

    // Hide the model
    if (model2) {
        timeline.to(model2.position, {
            y: -100,
            duration: 1,
            ease: 'power2.inOut'
        }, 0);
    }

    // Move humus layer to center of screen
    timeline.to(humusLayer.position, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.5,
        ease: 'power2.inOut'
    }, 0.5);

    // Scale humus layer slightly for emphasis
    timeline.to(humusLayer.scale, {
        x: 1.2,
        y: 1.2,
        z: 1.2,
        duration: 1,
        ease: 'power2.inOut'
    }, 0.5);

    // Animate camera to focus on humus layer from isometric view
    timeline.to(camera.position, {
        x: 5,
        y: 5,
        z: 8,
        duration: 2,
        ease: 'power2.inOut',
        onUpdate: () => {
            camera.lookAt(humusLayer.position);
        }
    }, 0.8);

    // Function to handle return to original view
    function handleReturn(restoreControlSettings) {
        // Ignore if animation is in progress
        if (animationInProgress) return;

        // Mark that animation is in progress again
        animationInProgress = true;

        // Hide the back button
        hideBackButton();

        // Play whoosh sound for return journey
        playWhooshSound();

        // Restore original control settings
        if (restoreControlSettings) {
            restoreControlSettings();
        }

        // Create return timeline
        const returnTimeline = gsap.timeline({
            onComplete: () => {
                // Re-enable controls after animation completes
                controls.enabled = true;

                // Animation is complete
                animationInProgress = false;

                // Call the onComplete callback if provided
                if (onComplete) onComplete();

                // Debug log to verify positions
                console.log("Final grassLayer position:", grassLayer.position.y);
                console.log("Expected position:", originalPositions.grassLayer.y);
            }
        });

        // Move camera back to original position
        returnTimeline.to(camera.position, {
            x: originalCameraPosition.x,
            y: originalCameraPosition.y,
            z: originalCameraPosition.z,
            duration: 2,
            ease: 'power2.inOut'
        }, 0);

        // Restore camera rotation
        returnTimeline.to(camera.rotation, {
            x: originalCameraRotation.x,
            y: originalCameraRotation.y,
            z: originalCameraRotation.z,
            duration: 2,
            ease: 'power2.inOut'
        }, 0);

        // Return humus layer to original position and scale
        returnTimeline.to(humusLayer.position, {
            x: originalPositions.humusLayer.x,
            y: originalPositions.humusLayer.y,
            z: originalPositions.humusLayer.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 0.5);

        returnTimeline.to(humusLayer.scale, {
            x: originalHumusScale.x,
            y: originalHumusScale.y,
            z: originalHumusScale.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 0.5);

        // Return grassLayer to original position (special handling)
        returnTimeline.to(grassLayer.position, {
            x: originalPositions.grassLayer.x,
            y: originalPositions.grassLayer.y,
            z: originalPositions.grassLayer.z,
            duration: 1.5,
            ease: 'power2.inOut',
            onComplete: () => {
                // Force position update to ensure it's correct
                grassLayer.position.set(
                    originalPositions.grassLayer.x,
                    originalPositions.grassLayer.y,
                    originalPositions.grassLayer.z
                );
            }
        }, 1);

        // Return other layers to original positions
        returnTimeline.to(topsoil.position, {
            x: originalPositions.topsoil.x,
            y: originalPositions.topsoil.y,
            z: originalPositions.topsoil.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 1);

        returnTimeline.to(subsoil.position, {
            x: originalPositions.subsoil.x,
            y: originalPositions.subsoil.y,
            z: originalPositions.subsoil.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 1);

        returnTimeline.to(parentRock.position, {
            x: originalPositions.parentRock.x,
            y: originalPositions.parentRock.y,
            z: originalPositions.parentRock.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 1);

        returnTimeline.to(bedRock.position, {
            x: originalPositions.bedRock.x,
            y: originalPositions.bedRock.y,
            z: originalPositions.bedRock.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 1);

        // Restore model position
        if (model2) {
            returnTimeline.to(model2.position, {
                y: isExpanded ? 0.4 : -3,
                duration: 1.5,
                ease: 'power2.inOut'
            }, 1);
        }
    }
}

/**
 * Animate Topsoil Layer
 * Zooms in on the topsoil layer and hides other layers
 */
export function animateTopsoilLayer(topsoil, grassLayer, humusLayer, subsoil, parentRock, bedRock, model2, camera, controls, isExpanded, playWhooshSound, onComplete) {
    // Flag to track if animation is in progress
    let animationInProgress = true;

    // Store original camera position and rotation to return to later
    const originalCameraPosition = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
    };

    const originalCameraRotation = {
        x: camera.rotation.x,
        y: camera.rotation.y,
        z: camera.rotation.z
    };

    // Store original positions of all layers explicitly
    const originalPositions = {
        grassLayer: { x: grassLayer.position.x, y: grassLayer.position.y, z: grassLayer.position.z },
        humusLayer: { x: humusLayer.position.x, y: humusLayer.position.y, z: humusLayer.position.z },
        topsoil: { x: topsoil.position.x, y: topsoil.position.y, z: topsoil.position.z },
        subsoil: { x: subsoil.position.x, y: subsoil.position.y, z: subsoil.position.z },
        parentRock: { x: parentRock.position.x, y: parentRock.position.y, z: parentRock.position.z },
        bedRock: { x: bedRock.position.x, y: bedRock.position.y, z: bedRock.position.z }
    };

    // Store original scale of topsoil layer
    const originalTopsoilScale = {
        x: topsoil.scale.x,
        y: topsoil.scale.y,
        z: topsoil.scale.z
    };

    // Disable orbit controls during animation
    controls.enabled = false;

    // Create a timeline for sequential animations
    const timeline = gsap.timeline({
        onComplete: () => {
            // Animation is complete, allow clicking
            animationInProgress = false;

            // Configure controls for zoomed state (only horizontal rotation)
            const restoreControlSettings = configureControlsForZoomedState(controls, topsoil);

            // Show the back button
            showBackButton(() => handleReturn(restoreControlSettings));
        }
    });

    // Move other layers far away
    timeline.to(grassLayer.position, {
        y: -100,
        duration: 1,
        ease: 'power2.inOut'
    }, 0);

    timeline.to(humusLayer.position, {
        y: -100,
        duration: 1,
        ease: 'power2.inOut'
    }, 0);

    timeline.to(subsoil.position, {
        y: -100,
        duration: 1,
        ease: 'power2.inOut'
    }, 0);

    timeline.to(parentRock.position, {
        y: -100,
        duration: 1,
        ease: 'power2.inOut'
    }, 0);

    timeline.to(bedRock.position, {
        y: -100,
        duration: 1,
        ease: 'power2.inOut'
    }, 0);

    // Hide the model
    if (model2) {
        timeline.to(model2.position, {
            y: -100,
            duration: 1,
            ease: 'power2.inOut'
        }, 0);
    }

    // Move topsoil layer to center of screen
    timeline.to(topsoil.position, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.5,
        ease: 'power2.inOut'
    }, 0.5);

    // Scale topsoil layer slightly for emphasis
    timeline.to(topsoil.scale, {
        x: 1.2,
        y: 1.2,
        z: 1.2,
        duration: 1,
        ease: 'power2.inOut'
    }, 0.5);

    // Animate camera to focus on topsoil layer from isometric view
    timeline.to(camera.position, {
        x: 5,
        y: 5,
        z: 8,
        duration: 2,
        ease: 'power2.inOut',
        onUpdate: () => {
            camera.lookAt(topsoil.position);
        }
    }, 0.8);

    // Function to handle return to original view
    function handleReturn(restoreControlSettings) {
        // Ignore if animation is in progress
        if (animationInProgress) return;

        // Mark that animation is in progress again
        animationInProgress = true;

        // Hide the back button
        hideBackButton();

        // Play whoosh sound for return journey
        playWhooshSound();

        // Restore original control settings
        if (restoreControlSettings) {
            restoreControlSettings();
        }

        // Create return timeline
        const returnTimeline = gsap.timeline({
            onComplete: () => {
                // Re-enable controls after animation completes
                controls.enabled = true;

                // Animation is complete
                animationInProgress = false;

                // Call the onComplete callback if provided
                if (onComplete) onComplete();
            }
        });

        // Move camera back to original position
        returnTimeline.to(camera.position, {
            x: originalCameraPosition.x,
            y: originalCameraPosition.y,
            z: originalCameraPosition.z,
            duration: 2,
            ease: 'power2.inOut'
        }, 0);

        // Restore camera rotation
        returnTimeline.to(camera.rotation, {
            x: originalCameraRotation.x,
            y: originalCameraRotation.y,
            z: originalCameraRotation.z,
            duration: 2,
            ease: 'power2.inOut'
        }, 0);

        // Return topsoil layer to original position and scale
        returnTimeline.to(topsoil.position, {
            x: originalPositions.topsoil.x,
            y: originalPositions.topsoil.y,
            z: originalPositions.topsoil.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 0.5);

        returnTimeline.to(topsoil.scale, {
            x: originalTopsoilScale.x,
            y: originalTopsoilScale.y,
            z: originalTopsoilScale.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 0.5);

        // Return other layers to original positions
        returnTimeline.to(grassLayer.position, {
            x: originalPositions.grassLayer.x,
            y: originalPositions.grassLayer.y,
            z: originalPositions.grassLayer.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 1);

        returnTimeline.to(humusLayer.position, {
            x: originalPositions.humusLayer.x,
            y: originalPositions.humusLayer.y,
            z: originalPositions.humusLayer.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 1);

        returnTimeline.to(subsoil.position, {
            x: originalPositions.subsoil.x,
            y: originalPositions.subsoil.y,
            z: originalPositions.subsoil.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 1);

        returnTimeline.to(parentRock.position, {
            x: originalPositions.parentRock.x,
            y: originalPositions.parentRock.y,
            z: originalPositions.parentRock.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 1);

        returnTimeline.to(bedRock.position, {
            x: originalPositions.bedRock.x,
            y: originalPositions.bedRock.y,
            z: originalPositions.bedRock.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 1);

        // Restore model position
        if (model2) {
            returnTimeline.to(model2.position, {
                y: isExpanded ? 0.4 : -3,
                duration: 1.5,
                ease: 'power2.inOut'
            }, 1);
        }
    }
}

/**
 * Animate Subsoil Layer
 * Zooms in on the subsoil layer and hides other layers
 */
export function animateSubsoilLayer(subsoil, grassLayer, humusLayer, topsoil, parentRock, bedRock, model2, camera, controls, isExpanded, playWhooshSound, onComplete) {
    // Flag to track if animation is in progress
    let animationInProgress = true;

    // Store original camera position and rotation to return to later
    const originalCameraPosition = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
    };

    const originalCameraRotation = {
        x: camera.rotation.x,
        y: camera.rotation.y,
        z: camera.rotation.z
    };

    // Store original positions of all layers explicitly
    const originalPositions = {
        grassLayer: { x: grassLayer.position.x, y: grassLayer.position.y, z: grassLayer.position.z },
        humusLayer: { x: humusLayer.position.x, y: humusLayer.position.y, z: humusLayer.position.z },
        topsoil: { x: topsoil.position.x, y: topsoil.position.y, z: topsoil.position.z },
        subsoil: { x: subsoil.position.x, y: subsoil.position.y, z: subsoil.position.z },
        parentRock: { x: parentRock.position.x, y: parentRock.position.y, z: parentRock.position.z },
        bedRock: { x: bedRock.position.x, y: bedRock.position.y, z: bedRock.position.z }
    };

    // Store original scale of subsoil layer
    const originalSubsoilScale = {
        x: subsoil.scale.x,
        y: subsoil.scale.y,
        z: subsoil.scale.z
    };

    // Disable orbit controls during animation
    controls.enabled = false;

    // Create a timeline for sequential animations
    const timeline = gsap.timeline({
        onComplete: () => {
            // Animation is complete, allow clicking
            animationInProgress = false;

            // Configure controls for zoomed state (only horizontal rotation)
            const restoreControlSettings = configureControlsForZoomedState(controls, subsoil);

            // Show the back button
            showBackButton(() => handleReturn(restoreControlSettings));
        }
    });

    // Move other layers far away
    timeline.to(grassLayer.position, {
        y: -100,
        duration: 1,
        ease: 'power2.inOut'
    }, 0);

    timeline.to(humusLayer.position, {
        y: -100,
        duration: 1,
        ease: 'power2.inOut'
    }, 0);

    timeline.to(topsoil.position, {
        y: -100,
        duration: 1,
        ease: 'power2.inOut'
    }, 0);

    timeline.to(parentRock.position, {
        y: -100,
        duration: 1,
        ease: 'power2.inOut'
    }, 0);

    timeline.to(bedRock.position, {
        y: -100,
        duration: 1,
        ease: 'power2.inOut'
    }, 0);

    // Hide the model
    if (model2) {
        timeline.to(model2.position, {
            y: -100,
            duration: 1,
            ease: 'power2.inOut'
        }, 0);
    }

    // Move subsoil layer to center of screen
    timeline.to(subsoil.position, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.5,
        ease: 'power2.inOut'
    }, 0.5);

    // Scale subsoil layer slightly for emphasis
    timeline.to(subsoil.scale, {
        x: 1.2,
        y: 1.2,
        z: 1.2,
        duration: 1,
        ease: 'power2.inOut'
    }, 0.5);

    // Animate camera to focus on subsoil layer from isometric view
    timeline.to(camera.position, {
        x: 5,
        y: 5,
        z: 8,
        duration: 2,
        ease: 'power2.inOut',
        onUpdate: () => {
            camera.lookAt(subsoil.position);
        }
    }, 0.8);

    // Function to handle return to original view
    function handleReturn(restoreControlSettings) {
        // Ignore if animation is in progress
        if (animationInProgress) return;

        // Mark that animation is in progress again
        animationInProgress = true;

        // Hide the back button
        hideBackButton();

        // Play whoosh sound for return journey
        playWhooshSound();

        // Restore original control settings
        if (restoreControlSettings) {
            restoreControlSettings();
        }

        // Create return timeline
        const returnTimeline = gsap.timeline({
            onComplete: () => {
                // Re-enable controls after animation completes
                controls.enabled = true;

                // Animation is complete
                animationInProgress = false;

                // Call the onComplete callback if provided
                if (onComplete) onComplete();
            }
        });

        // Move camera back to original position
        returnTimeline.to(camera.position, {
            x: originalCameraPosition.x,
            y: originalCameraPosition.y,
            z: originalCameraPosition.z,
            duration: 2,
            ease: 'power2.inOut'
        }, 0);

        // Restore camera rotation
        returnTimeline.to(camera.rotation, {
            x: originalCameraRotation.x,
            y: originalCameraRotation.y,
            z: originalCameraRotation.z,
            duration: 2,
            ease: 'power2.inOut'
        }, 0);

        // Return subsoil layer to original position and scale
        returnTimeline.to(subsoil.position, {
            x: originalPositions.subsoil.x,
            y: originalPositions.subsoil.y,
            z: originalPositions.subsoil.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 0.5);

        returnTimeline.to(subsoil.scale, {
            x: originalSubsoilScale.x,
            y: originalSubsoilScale.y,
            z: originalSubsoilScale.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 0.5);

        // Return other layers to original positions
        returnTimeline.to(grassLayer.position, {
            x: originalPositions.grassLayer.x,
            y: originalPositions.grassLayer.y,
            z: originalPositions.grassLayer.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 1);

        returnTimeline.to(humusLayer.position, {
            x: originalPositions.humusLayer.x,
            y: originalPositions.humusLayer.y,
            z: originalPositions.humusLayer.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 1);

        returnTimeline.to(topsoil.position, {
            x: originalPositions.topsoil.x,
            y: originalPositions.topsoil.y,
            z: originalPositions.topsoil.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 1);

        returnTimeline.to(parentRock.position, {
            x: originalPositions.parentRock.x,
            y: originalPositions.parentRock.y,
            z: originalPositions.parentRock.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 1);

        returnTimeline.to(bedRock.position, {
            x: originalPositions.bedRock.x,
            y: originalPositions.bedRock.y,
            z: originalPositions.bedRock.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 1);

        // Restore model position
        if (model2) {
            returnTimeline.to(model2.position, {
                y: isExpanded ? 0.4 : -3,
                duration: 1.5,
                ease: 'power2.inOut'
            }, 1);
        }
    }
}

/**
 * Animate Parent Rock Layer
 * Zooms in on the parent rock layer and hides other layers
 */
export function animateParentRockLayer(parentRock, grassLayer, humusLayer, topsoil, subsoil, bedRock, model2, camera, controls, isExpanded, playWhooshSound, onComplete) {
    // Flag to track if animation is in progress
    let animationInProgress = true;

    // Store original camera position and rotation to return to later
    const originalCameraPosition = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
    };

    const originalCameraRotation = {
        x: camera.rotation.x,
        y: camera.rotation.y,
        z: camera.rotation.z
    };

    // Store original positions of all layers explicitly
    const originalPositions = {
        grassLayer: { x: grassLayer.position.x, y: grassLayer.position.y, z: grassLayer.position.z },
        humusLayer: { x: humusLayer.position.x, y: humusLayer.position.y, z: humusLayer.position.z },
        topsoil: { x: topsoil.position.x, y: topsoil.position.y, z: topsoil.position.z },
        subsoil: { x: subsoil.position.x, y: subsoil.position.y, z: subsoil.position.z },
        parentRock: { x: parentRock.position.x, y: parentRock.position.y, z: parentRock.position.z },
        bedRock: { x: bedRock.position.x, y: bedRock.position.y, z: bedRock.position.z }
    };

    // Store original scale of parent rock layer
    const originalParentRockScale = {
        x: parentRock.scale.x,
        y: parentRock.scale.y,
        z: parentRock.scale.z
    };

    // Disable orbit controls during animation
    controls.enabled = false;

    // Create a timeline for sequential animations
    const timeline = gsap.timeline({
        onComplete: () => {
            // Animation is complete, allow clicking
            animationInProgress = false;

            // Configure controls for zoomed state (only horizontal rotation)
            const restoreControlSettings = configureControlsForZoomedState(controls, parentRock);

            // Show the back button
            showBackButton(() => handleReturn(restoreControlSettings));
        }
    });

    // Move other layers far away
    timeline.to(grassLayer.position, {
        y: -100,
        duration: 1,
        ease: 'power2.inOut'
    }, 0);

    timeline.to(humusLayer.position, {
        y: -100,
        duration: 1,
        ease: 'power2.inOut'
    }, 0);

    timeline.to(topsoil.position, {
        y: -100,
        duration: 1,
        ease: 'power2.inOut'
    }, 0);

    timeline.to(subsoil.position, {
        y: -100,
        duration: 1,
        ease: 'power2.inOut'
    }, 0);

    timeline.to(bedRock.position, {
        y: -100,
        duration: 1,
        ease: 'power2.inOut'
    }, 0);

    // Hide the model
    if (model2) {
        timeline.to(model2.position, {
            y: -100,
            duration: 1,
            ease: 'power2.inOut'
        }, 0);
    }

    // Move parent rock layer to center of screen
    timeline.to(parentRock.position, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.5,
        ease: 'power2.inOut'
    }, 0.5);

    // Scale parent rock layer slightly for emphasis
    timeline.to(parentRock.scale, {
        x: 1.2,
        y: 1.2,
        z: 1.2,
        duration: 1,
        ease: 'power2.inOut'
    }, 0.5);

    // Animate camera to focus on parent rock layer from isometric view
    timeline.to(camera.position, {
        x: 5,
        y: 5,
        z: 8,
        duration: 2,
        ease: 'power2.inOut',
        onUpdate: () => {
            camera.lookAt(parentRock.position);
        }
    }, 0.8);

    // Function to handle return to original view
    function handleReturn(restoreControlSettings) {
        // Ignore if animation is in progress
        if (animationInProgress) return;

        // Mark that animation is in progress again
        animationInProgress = true;

        // Hide the back button
        hideBackButton();

        // Play whoosh sound for return journey
        playWhooshSound();

        // Restore original control settings
        if (restoreControlSettings) {
            restoreControlSettings();
        }

        // Create return timeline
        const returnTimeline = gsap.timeline({
            onComplete: () => {
                // Re-enable controls after animation completes
                controls.enabled = true;

                // Animation is complete
                animationInProgress = false;

                // Call the onComplete callback if provided
                if (onComplete) onComplete();
            }
        });

        // Move camera back to original position
        returnTimeline.to(camera.position, {
            x: originalCameraPosition.x,
            y: originalCameraPosition.y,
            z: originalCameraPosition.z,
            duration: 2,
            ease: 'power2.inOut'
        }, 0);

        // Restore camera rotation
        returnTimeline.to(camera.rotation, {
            x: originalCameraRotation.x,
            y: originalCameraRotation.y,
            z: originalCameraRotation.z,
            duration: 2,
            ease: 'power2.inOut'
        }, 0);

        // Return parent rock layer to original position and scale
        returnTimeline.to(parentRock.position, {
            x: originalPositions.parentRock.x,
            y: originalPositions.parentRock.y,
            z: originalPositions.parentRock.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 0.5);

        returnTimeline.to(parentRock.scale, {
            x: originalParentRockScale.x,
            y: originalParentRockScale.y,
            z: originalParentRockScale.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 0.5);

        // Return other layers to original positions
        returnTimeline.to(grassLayer.position, {
            x: originalPositions.grassLayer.x,
            y: originalPositions.grassLayer.y,
            z: originalPositions.grassLayer.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 1);

        returnTimeline.to(humusLayer.position, {
            x: originalPositions.humusLayer.x,
            y: originalPositions.humusLayer.y,
            z: originalPositions.humusLayer.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 1);

        returnTimeline.to(topsoil.position, {
            x: originalPositions.topsoil.x,
            y: originalPositions.topsoil.y,
            z: originalPositions.topsoil.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 1);

        returnTimeline.to(subsoil.position, {
            x: originalPositions.subsoil.x,
            y: originalPositions.subsoil.y,
            z: originalPositions.subsoil.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 1);

        returnTimeline.to(bedRock.position, {
            x: originalPositions.bedRock.x,
            y: originalPositions.bedRock.y,
            z: originalPositions.bedRock.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 1);

        // Restore model position
        if (model2) {
            returnTimeline.to(model2.position, {
                y: isExpanded ? 0.4 : -3,
                duration: 1.5,
                ease: 'power2.inOut'
            }, 1);
        }
    }
}

/**
 * Animate Bed Rock Layer
 * Zooms in on the bed rock layer and hides other layers
 */
export function animateBedRockLayer(bedRock, grassLayer, humusLayer, topsoil, subsoil, parentRock, model2, camera, controls, isExpanded, playWhooshSound, onComplete) {
    // Flag to track if animation is in progress
    let animationInProgress = true;

    // Store original camera position and rotation to return to later
    const originalCameraPosition = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
    };

    const originalCameraRotation = {
        x: camera.rotation.x,
        y: camera.rotation.y,
        z: camera.rotation.z
    };

    // Store original positions of all layers explicitly
    const originalPositions = {
        grassLayer: { x: grassLayer.position.x, y: grassLayer.position.y, z: grassLayer.position.z },
        humusLayer: { x: humusLayer.position.x, y: humusLayer.position.y, z: humusLayer.position.z },
        topsoil: { x: topsoil.position.x, y: topsoil.position.y, z: topsoil.position.z },
        subsoil: { x: subsoil.position.x, y: subsoil.position.y, z: subsoil.position.z },
        parentRock: { x: parentRock.position.x, y: parentRock.position.y, z: parentRock.position.z },
        bedRock: { x: bedRock.position.x, y: bedRock.position.y, z: bedRock.position.z }
    };

    // Store original scale of bed rock layer
    const originalBedRockScale = {
        x: bedRock.scale.x,
        y: bedRock.scale.y,
        z: bedRock.scale.z
    };

    // Disable orbit controls during animation
    controls.enabled = false;

    // Create a timeline for sequential animations
    const timeline = gsap.timeline({
        onComplete: () => {
            // Animation is complete, allow clicking
            animationInProgress = false;

            // Configure controls for zoomed state (only horizontal rotation)
            const restoreControlSettings = configureControlsForZoomedState(controls, bedRock);

            // Show the back button
            showBackButton(() => handleReturn(restoreControlSettings));
        }
    });

    // Move other layers far away
    timeline.to(grassLayer.position, {
        y: -100,
        duration: 1,
        ease: 'power2.inOut'
    }, 0);

    timeline.to(humusLayer.position, {
        y: -100,
        duration: 1,
        ease: 'power2.inOut'
    }, 0);

    timeline.to(topsoil.position, {
        y: -100,
        duration: 1,
        ease: 'power2.inOut'
    }, 0);

    timeline.to(subsoil.position, {
        y: -100,
        duration: 1,
        ease: 'power2.inOut'
    }, 0);

    timeline.to(parentRock.position, {
        y: -100,
        duration: 1,
        ease: 'power2.inOut'
    }, 0);

    // Hide the model
    if (model2) {
        timeline.to(model2.position, {
            y: -100,
            duration: 1,
            ease: 'power2.inOut'
        }, 0);
    }

    // Move bed rock layer to center of screen
    timeline.to(bedRock.position, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.5,
        ease: 'power2.inOut'
    }, 0.5);

    // Scale bed rock layer slightly for emphasis
    timeline.to(bedRock.scale, {
        x: 1.2,
        y: 1.2,
        z: 1.2,
        duration: 1,
        ease: 'power2.inOut'
    }, 0.5);

    // Animate camera to focus on bed rock layer from isometric view
    timeline.to(camera.position, {
        x: 5,
        y: 5,
        z: 8,
        duration: 2,
        ease: 'power2.inOut',
        onUpdate: () => {
            camera.lookAt(bedRock.position);
        }
    }, 0.8);

    // Function to handle return to original view
    function handleReturn(restoreControlSettings) {
        // Ignore if animation is in progress
        if (animationInProgress) return;

        // Mark that animation is in progress again
        animationInProgress = true;

        // Hide the back button
        hideBackButton();

        // Play whoosh sound for return journey
        playWhooshSound();

        // Restore original control settings
        if (restoreControlSettings) {
            restoreControlSettings();
        }

        // Create return timeline
        const returnTimeline = gsap.timeline({
            onComplete: () => {
                // Re-enable controls after animation completes
                controls.enabled = true;

                // Animation is complete
                animationInProgress = false;

                // Call the onComplete callback if provided
                if (onComplete) onComplete();
            }
        });

        // Move camera back to original position
        returnTimeline.to(camera.position, {
            x: originalCameraPosition.x,
            y: originalCameraPosition.y,
            z: originalCameraPosition.z,
            duration: 2,
            ease: 'power2.inOut'
        }, 0);

        // Restore camera rotation
        returnTimeline.to(camera.rotation, {
            x: originalCameraRotation.x,
            y: originalCameraRotation.y,
            z: originalCameraRotation.z,
            duration: 2,
            ease: 'power2.inOut'
        }, 0);

        // Return bed rock layer to original position and scale
        returnTimeline.to(bedRock.position, {
            x: originalPositions.bedRock.x,
            y: originalPositions.bedRock.y,
            z: originalPositions.bedRock.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 0.5);

        returnTimeline.to(bedRock.scale, {
            x: originalBedRockScale.x,
            y: originalBedRockScale.y,
            z: originalBedRockScale.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 0.5);

        // Return other layers to original positions
        returnTimeline.to(grassLayer.position, {
            x: originalPositions.grassLayer.x,
            y: originalPositions.grassLayer.y,
            z: originalPositions.grassLayer.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 1);

        returnTimeline.to(humusLayer.position, {
            x: originalPositions.humusLayer.x,
            y: originalPositions.humusLayer.y,
            z: originalPositions.humusLayer.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 1);

        returnTimeline.to(topsoil.position, {
            x: originalPositions.topsoil.x,
            y: originalPositions.topsoil.y,
            z: originalPositions.topsoil.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 1);

        returnTimeline.to(subsoil.position, {
            x: originalPositions.subsoil.x,
            y: originalPositions.subsoil.y,
            z: originalPositions.subsoil.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 1);

        returnTimeline.to(parentRock.position, {
            x: originalPositions.parentRock.x,
            y: originalPositions.parentRock.y,
            z: originalPositions.parentRock.z,
            duration: 1.5,
            ease: 'power2.inOut'
        }, 1);

        // Restore model position
        if (model2) {
            returnTimeline.to(model2.position, {
                y: isExpanded ? 0.4 : -3,
                duration: 1.5,
                ease: 'power2.inOut'
            }, 1);
        }
    }
}