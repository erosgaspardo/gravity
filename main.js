let container = document.querySelector(".main");
let positionX = 0;
let velocity = 0; // Inertia effect
let friction = 0.9; // Slowdown factor
let sensitivity = .5; // Adjust movement speed

// Calculate movement limits dynamically
function getScrollLimits() {
    let containerWidth = container.scrollWidth;
    let viewportWidth = window.innerWidth;
    return {
        min: 0, // Stop at the first image
        max: Math.max(0, containerWidth - viewportWidth), // Stop at the last image
    };
}

function handleMotion(event) {
    if (!event.accelerationIncludingGravity) return;

    let accelX = event.accelerationIncludingGravity.x || 0; // Left/Right tilt

    // Apply sensitivity for smooth scrolling
    velocity += accelX * sensitivity;

    updateFieldIfNotNull("Accelerometer_gx", accelX);
    updateFieldIfNotNull("Accelerometer_i", event.interval, 2);
    incrementEventCount();
}

function updatePosition() {
    positionX -= velocity; // Invert direction to match scrolling behavior
    velocity *= friction; // Apply inertia effect

    // Get scroll limits dynamically
    let { min, max } = getScrollLimits();

    // Restrict position within limits
    positionX = Math.max(min, Math.min(max, positionX));

    container.style.transform = `translateX(${-positionX}px)`; // Move container
    requestAnimationFrame(updatePosition);
}

function updateFieldIfNotNull(fieldName, value, precision = 4) {
    if (value != null) {
        document.getElementById(fieldName).innerHTML = value.toFixed(precision);
    }
}

function incrementEventCount() {
    let counterElement = document.getElementById("num-observed-events");
    let eventCount = parseInt(counterElement.innerHTML);
    counterElement.innerHTML = eventCount + 1;
}

let is_running = false;
let demo_button = document.getElementById("start_demo");

demo_button.onclick = function (e) {
    e.preventDefault();

    // Request permission for iOS 13+ devices
    if (
        DeviceMotionEvent &&
        typeof DeviceMotionEvent.requestPermission === "function"
    ) {
        DeviceMotionEvent.requestPermission()
            .then(response => {
                if (response !== "granted") {
                    alert("Permission denied for motion sensors.");
                }
            })
            .catch(console.error);
    }

    if (is_running) {
        window.removeEventListener("devicemotion", handleMotion);
        demo_button.innerHTML = "Start demo";
        demo_button.classList.add("btn-success");
        demo_button.classList.remove("btn-danger");
        is_running = false;
    } else {
        window.addEventListener("devicemotion", handleMotion);
        updatePosition(); // Start animation loop
        demo_button.innerHTML = "Stop demo";
        demo_button.classList.remove("btn-success");
        demo_button.classList.add("btn-danger");
        container.style.overflow = "visible"
        is_running = true;
    }
};
