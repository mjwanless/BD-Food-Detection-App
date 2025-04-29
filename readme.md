# FridgeToFork 🍽️

FridgeToFork is a web application that helps you discover recipes based on ingredients you already have. Simply take a photo of your ingredients, and the app will identify them using computer vision technology, then suggest recipes you can make.

## Features

-   📷 Capture ingredients using your webcam or upload an image
-   🔍 AI-powered ingredient detection using a custom YOLO model
-   ✨ Edit and add ingredients manually
-   🥗 Filter recipes by cuisine type and dietary restrictions
-   🍳 View detailed recipe information with direct links to full instructions

## Tech Stack

-   **Frontend**: HTML, CSS (Tailwind CSS), JavaScript
-   **Backend**: Flask (Python)
-   **AI Model**: YOLO (You Only Look Once) for object detection
-   **API**: Spoonacular API for recipe search

## Requirements

-   Python 3.8 or higher
-   Flask
-   PyTorch
-   Ultralytics YOLOv8
-   Other dependencies listed in `requirements.txt`

## Installation

1. Create and activate a virtual environment (recommended):

    ```bash
    python -m venv venv

    # On Windows
    venv\Scripts\activate

    # On macOS/Linux
    source venv/bin/activate
    ```

2. Install the required dependencies:

    ```bash
    pip install -r requirements.txt
    ```

3. Download the pre-trained model:

    > **Note**: You need to download the custom YOLO model file `best_ingredient_detection_model.pt` and place it in the project root directory.

## Running the Application

1. Start the Flask server:

    ```bash
    python app.py
    ```

2. Open your web browser and navigate to:
    ```
    http://127.0.0.1:5000/
    ```

## Usage

1. **Start**: Click the "Get Started" button on the landing page.

2. **Upload Image**: Either upload an image of your ingredients or use your webcam to capture a photo.

3. **Detect Ingredients**: Click the "Detect Ingredients" button to analyze the image.

4. **Customize Search**:

    - Review the detected ingredients
    - Add or remove ingredients as needed
    - Select a cuisine type (optional)
    - Choose dietary restrictions (optional)

5. **Find Recipes**: Click the "Find Recipes" button to get recipe suggestions based on your ingredients.

6. **View Recipes**: Browse the recipe suggestions and click "View Recipe" to see the full instructions.

## API Keys

The application uses the Spoonacular API for recipe search. The code currently includes an API key, but it's recommended to:

1. Register for your own API key at [Spoonacular API](https://spoonacular.com/food-api)
2. Replace the API key in the `script.js` file with your own key

## Project Structure

-   `app.py`: Flask application with routes for serving the web app and handling predictions
-   `static/index.html`: Main HTML file for the web interface
-   `static/script.js`: JavaScript code for the client-side functionality
-   `requirements.txt`: List of Python dependencies
-   `best_ingredient_detection_model.pt`: Custom YOLO model for ingredient detection (not included in repository)

## Limitations

-   The ingredient detection model is currently limited to a handful of common items
-   The Spoonacular API has rate limits on the free tier
-   Webcam functionality may vary depending on browser permissions

## License

[MIT License](LICENSE)

## Acknowledgements

-   [Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics) for object detection
-   [Spoonacular API](https://spoonacular.com/food-api) for recipe data
-   [Tailwind CSS](https://tailwindcss.com/) for styling
