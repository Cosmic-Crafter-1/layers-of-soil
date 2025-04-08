
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

02/03/12 -
-- Noticed that raycasting was highlighting several layers at once. Because of these reasons :
        a. Overlapping geometries: The expanded displacement maps on your geometries might be causing the actual rendered surfaces to overlap. Since you're using displacement maps with significant values, the actual visible geometry extends beyond the base shape.
        b. Imprecise ray intersection test: The raycaster is detecting multiple intersections along the ray path, not just the closest one.
        c. BoxGeometry boundaries: The way you're testing for intersections doesn't account for the visual displacement of the geometry.

My original code had two major issues:

You were actually showing info boxes for all intersected objects, not just the top one
There was a logical inconsistency - you were scaling closestObject (the first intersection) but showing info for intersect.object (the current intersection in the loop)

Solution was to just remove the for loop that looped over all intersections lmao :)

-- I gotta notify user to switch of reading mode for better experience.


8-04-25 -
1. Start with HTML, take a day for that, no worries. Re-write the entire code yourself, to better understand it - 1D.
2. Try animating just one layer that goes from right to left, and the text coming on the right.
3. I need to make it so that it's container by container. Like scroll and you go to next div directly....


I got another idea, like we have a small version of the entire soil block at bottom left or bottom right (fixed). Now when you land on the page, you get that big cute all layers. But when you start scrolling, it becomes a smaller version of itself and fixes itself at the bottom as I said. Then when we scroll,the first layer being humus, it comes from the big layer when we landed to the left and info about it on the right. 
But now when you scroll again, it goes to the small layer below. And the next layer is picked from that small layer itself, like topsoil from that small version comes out of it to the right (opposite direction again) and becomes big with text on left. And so on..

And finally when you finish all layers, the small model, again, becomes the original size and users can interact freely.


Generate accurate info based audio for topsoil, subsoil, parentrock and bedrock - 1D