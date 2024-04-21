
console.log("hi");

const span = document.createElement("span");
document.body.appendChild(span);
span.classList.add("radar");
const canvas = document.createElement("canvas");
span.appendChild(canvas);
var ctx = canvas.getContext("2d");

// Circle parameters
var centerX = canvas.width / 2;
var centerY = canvas.height / 2;
var radius = 100;

// Initial point position
var pointAngle = Math.PI / 4; // Angle in radians
var pointX = centerX + radius * Math.cos(pointAngle);
var pointY = centerY + radius * Math.sin(pointAngle);

// Draw the circle
ctx.beginPath();
ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
ctx.stroke();

// Draw the draggable point
drawPoint();

// Function to draw the draggable point
function drawPoint() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(pointX, pointY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
}

// Mouse event listeners for dragging
var isDragging = false;

canvas.addEventListener("mousedown", function(event) {
    var rect = canvas.getBoundingClientRect();
    var mouseX = event.clientX - rect.left;
    var mouseY = event.clientY - rect.top;

    var dx = mouseX - pointX;
    var dy = mouseY - pointY;
    if (Math.sqrt(dx*dx + dy*dy) < 10) {
        isDragging = true;
    }
});

canvas.addEventListener("mousemove", function(event) {
    if (isDragging) {
        var rect = canvas.getBoundingClientRect();
        var mouseX = event.clientX - rect.left;
        var mouseY = event.clientY - rect.top;

        // Check if mouse is inside or outside the circle
        var dx = mouseX - centerX;
        var dy = mouseY - centerY;
        var distance = Math.sqrt(dx*dx + dy*dy);
        var angle = Math.atan2(dy, dx);

        if (distance <= radius) {
            // Mouse is inside the circle, allow free movement
            pointX = mouseX;
            pointY = mouseY;
        } else {
            // Mouse is outside the circle, constrain to circumference
            pointX = centerX + radius * Math.cos(angle);
            pointY = centerY + radius * Math.sin(angle);
            distance = 100;
        }

        source1.UpdateAzim2(angle);
        source1.UpdateDistance(distance + 25);

        drawPoint();
    }
});

canvas.addEventListener("mouseup", function(event) {
    isDragging = false;
});