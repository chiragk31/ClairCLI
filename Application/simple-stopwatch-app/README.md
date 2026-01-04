# Simple Stopwatch Application

A clean and functional stopwatch application built with HTML, CSS, and vanilla JavaScript. This project demonstrates basic web development principles, including DOM manipulation, event handling, and interval management.

## Features

-   **Start/Stop Functionality**: Start and pause the stopwatch with millisecond precision.
-   **Reset Functionality**: Reset the stopwatch to zero.
-   **Lap Functionality**: Record and display lap times.
-   **Responsive Design**: Adapts to different screen sizes for a better user experience.
-   **Clean UI**: Intuitive and modern user interface.

## Technologies Used

-   **HTML5**: For the basic structure of the application.
-   **CSS3**: For styling and responsive design.
-   **Vanilla JavaScript (ES6+)**: For all dynamic functionality.
-   **`http-server`**: A simple zero-configuration command-line http server for development.

## Setup Instructions

Follow these steps to get the stopwatch application up and running on your local machine.

### Prerequisites

Make sure you have Node.js and npm (Node Package Manager) installed on your system.
You can download them from [nodejs.org](https://nodejs.org/).

### Installation

1.  **Clone the repository (or download the files):**
    ```bash
    git clone https://github.com/your-username/simple-stopwatch-app.git
    # Or simply create a folder and place the files inside.
    ```
2.  **Navigate into the project directory:**
    ```bash
    cd simple-stopwatch-app
    ```
3.  **Install dependencies:**
    This project uses `http-server` as a development dependency to serve the static files.
    ```bash
    npm install
    ```

### Running the Application

1.  **Start the development server:**
    ```bash
    npm start
    ```
2.  **Access the application:**
    Open your web browser and navigate to `http://localhost:8080` (or the address shown in your terminal after running `npm start`).

## Usage

-   **Start**: Click the "Start" button to begin timing.
-   **Stop**: Click the "Stop" button to pause the timer.
-   **Reset**: Click the "Reset" button to clear the timer and all recorded laps.
-   **Lap**: Click the "Lap" button to record the current elapsed time as a lap. Laps are added to the list above, with the most recent lap at the top.

## Project Structure

```
simple-stopwatch-app/
├── index.html         # Main HTML file for the stopwatch UI
├── style.css          # Stylesheets for the application
├── script.js          # Core JavaScript logic for stopwatch functionality
├── package.json       # Defines project metadata and scripts (e.g., for http-server)
├── package-lock.json  # Records exact dependency versions
└── README.md          # Project README file
```

## Contributing

Contributions are welcome! If you have suggestions for improvements or bug fixes, please feel free to:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'feat: Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details (although not explicitly created, it's good practice to mention).
