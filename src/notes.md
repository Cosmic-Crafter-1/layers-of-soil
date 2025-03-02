
Timeline, To-Do's and things done.

24/02/12 - 
Added dinosaur bones.

25/02/12 - 
Make sure the bones come up with the layer and add animation to it. Optimize the sounds and models and reduce size.

26/02/12 - 
Just thought about it, like going in front and showing a layer and coming back, is JUST ANIMATING THE CAMERA's position lmao. 

Added camera animation and narration.

-- Noticed that if I switch tabs / go to another app and come back, the sound is playing but animation is paused (because three.js does it auto). [Gotta fix it later.]

-- Noticed that colors on Amoled display pops out too much. On PC brown looks perfect, but on mobile it's messed up. [Gotta fix it later.]

27/02/12 -
-- Noticed that if I click on the animateCamera button twice, the animation plays out twice. [Fixed using a counter].

28/02/12 - 
-- Noticed code is getting too big. Time to organize.'
-- Sound wasn't working in vercel. Fixed it by importing it rather than trying all paths.

2/03/12 -
-- Noticed that raycasting was highlighting several layers at once. Because of these reasons :
        a. Overlapping geometries: The expanded displacement maps on your geometries might be causing the actual rendered surfaces to overlap. Since you're using displacement maps with significant values, the actual visible geometry extends beyond the base shape.
        b. Imprecise ray intersection test: The raycaster is detecting multiple intersections along the ray path, not just the closest one.
        c. BoxGeometry boundaries: The way you're testing for intersections doesn't account for the visual displacement of the geometry.

My original code had two major issues:

You were actually showing info boxes for all intersected objects, not just the top one
There was a logical inconsistency - you were scaling closestObject (the first intersection) but showing info for intersect.object (the current intersection in the loop)

Solution was to just remove the for loop that looped over all intersections lmao :)