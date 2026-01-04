/**
 * Simple Stopwatch Application
 *
 * This script provides the core functionality for a stopwatch:
 * - Start, Stop, Reset operations
 * - Lap recording
 * - Millisecond precision display
 * - Responsive UI updates
 */

// --- DOM Element References ---
const display = document.getElementById('display');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const resetButton = document.getElementById('resetButton');
const lapButton = document.getElementById('lapButton');
const lapsList = document.getElementById('lapsList');

// --- Stopwatch State Variables ---
let startTime = 0;           // Timestamp when the stopwatch was started or last resumed
let elapsedTime = 0;         // Total elapsed time in milliseconds
let timerInterval = null;    // Stores the interval ID for clearing
let isRunning = false;       // Flag to check if stopwatch is currently running
let lapCounter = 0;          // Counter for lap numbers

/**
 * Formats a given time in milliseconds into a human-readable string: HH:MM:SS.MMM
 * @param {number} ms - Time in milliseconds.
 * @returns {string} Formatted time string.
 */
function formatTime(ms) {
    // Ensure ms is a non-negative number
    if (typeof ms !== 'number' || ms < 0) {
        console.error("Invalid time input for formatTime:", ms);
        ms = 0;
    }

    const totalMilliseconds = Math.floor(ms);

    const hours = Math.floor(totalMilliseconds / 3600000);
    const minutes = Math.floor((totalMilliseconds % 3600000) / 60000);
    const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
    const milliseconds = totalMilliseconds % 1000;

    // Pad with leading zeros
    const format = (num, length) => String(num).padStart(length, '0');

    return `${format(hours, 2)}:${format(minutes, 2)}:${format(seconds, 2)}.${format(milliseconds, 3)}`;
}

/**
 * Updates the stopwatch display with the current elapsed time.
 * This function is called repeatedly when the stopwatch is running.
 */
function updateDisplay() {
    // Calculate the current elapsed time since the timer started
    // If not running, elapsedTime remains the paused value
    const currentTime = isRunning ? Date.now() - startTime + elapsedTime : elapsedTime;
    display.textContent = formatTime(currentTime);
}

/**
 * Starts or resumes the stopwatch.
 * - Records the start time.
 * - Sets an interval to update the display every 10 milliseconds for smooth millisecond updates.
 * - Updates button states.
 */
function startTimer() {
    if (isRunning) {
        return; // Prevent multiple start calls
    }

    isRunning = true;
    startTime = Date.now() - elapsedTime; // Adjust startTime to account for previously elapsed time
    timerInterval = setInterval(() => {
        elapsedTime = Date.now() - startTime;
        updateDisplay();
    }, 10); // Update every 10ms for millisecond precision

    // Update button states
    startButton.disabled = true;
    stopButton.disabled = false;
    resetButton.disabled = false;
    lapButton.disabled = false;
}

/**
 * Stops the stopwatch.
 * - Clears the interval to halt updates.
 * - Updates button states.
 */
function stopTimer() {
    if (!isRunning) {
        return; // Prevent multiple stop calls if already stopped
    }

    isRunning = false;
    clearInterval(timerInterval);
    timerInterval = null; // Clear the interval ID
    // elapsedTime is already updated by updateDisplay in the interval, so no need to recalculate here.
    // The last value of elapsedTime is preserved.

    // Update button states
    startButton.disabled = false;
    stopButton.disabled = true;
    // resetButton and lapButton remain enabled
}

/**
 * Resets the stopwatch to its initial state.
 * - Stops the timer.
 * - Clears all time variables.
 * - Clears the lap list.
 * - Updates button states.
 */
function resetTimer() {
    // Stop the timer if it's running
    if (isRunning) {
        stopTimer();
    }

    // Reset all time variables
    startTime = 0;
    elapsedTime = 0;
    lapCounter = 0;

    // Reset the display
    display.textContent = formatTime(0);

    // Clear lap list
    lapsList.innerHTML = ''; // Clear all child elements

    // Reset button states
    startButton.disabled = false;
    stopButton.disabled = true;
    resetButton.disabled = true;
    lapButton.disabled = true;
}

/**
 * Records the current elapsed time as a lap.
 * - Adds the lap time to the lap list.
 */
function lapTimer() {
    if (!isRunning) {
        return; // Laps can only be recorded when the stopwatch is running
    }

    lapCounter++;
    const currentLapTime = elapsedTime; // Use the current total elapsed time
    const formattedLapTime = formatTime(currentLapTime);

    const listItem = document.createElement('li');
    listItem.innerHTML = `<span>Lap ${lapCounter}:</span> <span>${formattedLapTime}</span>`;
    lapsList.prepend(listItem); // Add new laps to the top of the list
}

// --- Event Listeners ---
/**
 * Initializes event listeners for all control buttons.
 * Uses event delegation where appropriate or direct listeners for specific elements.
 */
function initializeEventListeners() {
    startButton.addEventListener('click', startTimer);
    stopButton.addEventListener('click', stopTimer);
    resetButton.addEventListener('click', resetTimer);
    lapButton.addEventListener('click', lapTimer);
}

// --- Initialization ---
/**
 * Function to run when the DOM is fully loaded.
 * - Sets initial display.
 * - Initializes event listeners.
 * - Handles potential errors if DOM elements are missing.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Basic validation to ensure all required DOM elements exist
    const requiredElements = { display, startButton, stopButton, resetButton, lapButton, lapsList };
    for (const key in requiredElements) {
        if (!requiredElements[key]) {
            console.error(`Error: DOM element with ID '${key.replace(/Button|List|display/, (match) => {
                if (match === 'display') return 'display';
                if (match === 'Button') return 'Button';
                if (match === 'List') return 'List';
                return match;
            })}' not found.`);
            // Potentially disable functionality or show an error message to the user
            return; // Stop initialization if critical elements are missing
        }
    }

    // Set initial display to 00:00:00.000
    display.textContent = formatTime(0);

    // Initialize button states
    startButton.disabled = false;
    stopButton.disabled = true;
    resetButton.disabled = true;
    lapButton.disabled = true;

    initializeEventListeners();
    console.log("Stopwatch application initialized.");
});

// For demonstration/testing, expose functions if needed (not for production usually)
// window.stopwatch = { startTimer, stopTimer, resetTimer, lapTimer, formatTime };