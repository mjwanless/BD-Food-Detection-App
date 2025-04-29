document.addEventListener("DOMContentLoaded", function () {
    const elements = {
        landingScreen: document.getElementById("landing-screen"),
        startButton: document.getElementById("start-button"),
        imageUploadContainer: document.getElementById("image-upload-container"),
        loadingDetection: document.getElementById("loading-detection"),
        loadingRecipes: document.getElementById("loading-recipes"),
        resultsSelectionContainer: document.getElementById("results-selection-container"),
        recipeResultsContainer: document.getElementById("recipe-results-container"),
        restartButton: document.getElementById("restart-button"),

        imageUpload: document.getElementById("image-upload"),
        imagePreviewContainer: document.getElementById("image-preview-container"),
        detectButton: document.getElementById("detect-button"),
        ingredientsList: document.getElementById("ingredients-list"),
        uploadStatus: document.getElementById("upload-status"),
        detectionStatus: document.getElementById("detection-status"),
        findRecipesButton: document.getElementById("find-recipes-button"),
        recipesList: document.getElementById("recipes-list"),

        webcamToggle: document.getElementById("webcam-toggle"),
        webcamContainer: document.getElementById("webcam-container"),
        webcam: document.getElementById("webcam"),
        captureButton: document.getElementById("capture-button"),

        recipeSearchForm: document.getElementById("recipe-search-form"),
        addIngredientBtn: document.getElementById("add-ingredient-btn"),
        cuisineType: document.getElementById("cuisine-type"),
        dietRestriction: document.getElementById("diet-restriction"),
    };

    // This is so that I can treat the app as a SPA, or pseudo-React, but I didn't feel like setting up Router or a react project
    const state = {
        currentFile: null,
        detectedIngredients: [],
        webcamStream: null,
        currentState: "LANDING",
    };

    const StateMachine = {
        states: {
            LANDING: {
                next: "UPLOAD",
                show: () => {
                    hideAllScreens();
                    elements.landingScreen.classList.remove("hidden");
                },
            },
            UPLOAD: {
                next: "LOADING_DETECTION",
                show: () => {
                    hideAllScreens();
                    elements.imageUploadContainer.classList.remove("hidden");
                },
            },
            LOADING_DETECTION: {
                next: "INGREDIENT_SELECT",
                show: () => {
                    hideAllScreens();
                    elements.loadingDetection.classList.remove("hidden");
                },
            },
            INGREDIENT_SELECT: {
                next: "LOADING_RECIPES",
                show: () => {
                    hideAllScreens();
                    elements.resultsSelectionContainer.classList.remove("hidden");
                },
            },
            LOADING_RECIPES: {
                next: "RECIPE_RESULTS",
                show: () => {
                    hideAllScreens();
                    elements.loadingRecipes.classList.remove("hidden");
                },
            },
            RECIPE_RESULTS: {
                next: "LANDING",
                show: () => {
                    hideAllScreens();
                    elements.recipeResultsContainer.classList.remove("hidden");
                },
            },
        },
        transition(newState) {
            if (this.states[newState]) {
                state.currentState = newState;
                this.states[newState].show();
            }
        },
    };

    // Utility function to hide all screens
    function hideAllScreens() {
        [
            elements.landingScreen,
            elements.imageUploadContainer,
            elements.loadingDetection,
            elements.resultsSelectionContainer,
            elements.loadingRecipes,
            elements.recipeResultsContainer,
        ].forEach((screen) => screen.classList.add("hidden"));
    }

    // Webcam functionality
    const webcamManager = {
        start() {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices
                    .getUserMedia({ video: true })
                    .then((mediaStream) => {
                        state.webcamStream = mediaStream;
                        elements.webcam.srcObject = mediaStream;
                        elements.webcam.play();
                    })
                    .catch((error) => {
                        console.error("Error accessing webcam:", error);
                        this.updateStatus(`Error accessing camera: ${error.message}`, "text-red-500");
                        elements.webcamContainer.classList.add("hidden");
                    });
            } else {
                this.updateStatus("Camera not supported in this browser.", "text-red-500");
                elements.webcamContainer.classList.add("hidden");
            }
        },

        stop() {
            if (state.webcamStream) {
                state.webcamStream.getTracks().forEach((track) => track.stop());
                state.webcamStream = null;
            }
        },

        capture() {
            if (!elements.webcam.videoWidth) {
                this.updateStatus("Camera not ready yet. Please wait...", "text-yellow-500");
                return;
            }

            const canvas = document.createElement("canvas");
            canvas.width = elements.webcam.videoWidth;
            canvas.height = elements.webcam.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(elements.webcam, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                state.currentFile = new File([blob], "webcam-capture.jpg", { type: "image/jpeg" });

                const imageUrl = URL.createObjectURL(blob);
                elements.imagePreviewContainer.innerHTML = `
                <img src="${imageUrl}" alt="Captured" class="w-full h-64 object-contain">
            `;
                elements.detectButton.disabled = false;
                elements.detectButton.classList.remove("opacity-50", "cursor-not-allowed");
            }, "image/jpeg");
        },

        updateStatus(message, className = "") {
            elements.uploadStatus.textContent = message;
            elements.uploadStatus.className = className;
        },
    };

    // Image upload handling
    const imageUploadHandler = {
        handle(e) {
            const file = e.target.files[0];
            if (!file) {
                this.reset();
                return;
            }

            // Make sure that the webcam is off when uploading a file
            webcamManager.stop();
            elements.webcamContainer.classList.add("hidden");

            state.currentFile = file;

            const reader = new FileReader();
            reader.onload = (e) => {
                elements.imagePreviewContainer.innerHTML = `
            <img src="${e.target.result}" alt="Preview" class="w-full h-64 object-contain">
        `;
                elements.detectButton.disabled = false;
                elements.detectButton.classList.remove("opacity-50", "cursor-not-allowed");

                // Remove the filename display
                elements.uploadStatus.textContent = "";
                elements.uploadStatus.className = "";
            };
            reader.readAsDataURL(file);
        },

        reset() {
            elements.detectButton.disabled = true;
            elements.detectButton.classList.add("opacity-50", "cursor-not-allowed");
            elements.uploadStatus.textContent = "";
            elements.imagePreviewContainer.innerHTML = `
        <div class="text-center p-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="mt-1 text-sm text-gray-500">
                No image selected
            </p>
        </div>
    `;
            state.currentFile = null;

            // Also reset any ingredients that were detected
            elements.ingredientsList.innerHTML = "";
            state.detectedIngredients = [];

            // Clear the file input so user can reselect the same file if wanted
            if (elements.imageUpload) {
                elements.imageUpload.value = "";
            }

            // Hide the recipe search form until new ingredients are detected
            if (elements.recipeSearchForm) {
                elements.recipeSearchForm.classList.add("hidden");
            }

            // Clear any editable ingredients
            const container = document.getElementById("editable-ingredients-container");
            if (container) {
                container.innerHTML = "";
            }
        },
    };

    // Ingredient detection
    const ingredientDetector = {
        detect() {
            if (!state.currentFile) {
                elements.detectionStatus.textContent = "No file selected";
                elements.detectionStatus.className = "status-error";
                return;
            }

            this.sendToServer(state.currentFile);
        },

        sendToServer(file) {
            const formData = new FormData();
            formData.append("image", file);

            elements.ingredientsList.innerHTML = "<p>Detecting ingredients...</p>";
            elements.detectionStatus.textContent = "Sending image to server...";
            elements.detectionStatus.className = "status-info";

            fetch("/predict", { method: "POST", body: formData })
                .then((response) => {
                    if (!response.ok) {
                        return response.text().then((text) => {
                            throw new Error(`Server error (${response.status}): ${text}`);
                        });
                    }
                    return response.json();
                })
                .then((data) => {
                    elements.detectionStatus.textContent = "Ingredients successfully detected!";
                    elements.detectionStatus.className = "status-success";
                    StateMachine.transition("INGREDIENT_SELECT");
                    this.displayIngredients(data.predicted_classes);
                })
                .catch((error) => {
                    console.error("Error:", error);
                    elements.detectionStatus.textContent = `Error: ${error.message}`;
                    elements.detectionStatus.className = "status-error";
                    elements.ingredientsList.innerHTML = "<p>Error detecting ingredients. Please try again.</p>";
                });
        },

        displayIngredients(ingredients) {
            if (!ingredients || ingredients.length === 0) {
                elements.ingredientsList.innerHTML = `
                    <div class="text-center p-6 bg-gray-50 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p class="mt-4 text-gray-700 font-medium">No ingredients detected</p>
                        <p class="mt-2 text-gray-600">Please try another image or add ingredients manually</p>
                    </div>
                `;
                elements.recipeSearchForm.classList.remove("hidden");
                state.detectedIngredients = [];
                return;
            }

            // Display ingredients list
            let html = '<div class="mb-6">';
            html += '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">';

            // Remove duplicates; it gets too long if I have an image full of potatoes or something
            const uniqueIngredients = [...new Set(ingredients)];

            uniqueIngredients.forEach((ingredient) => {
                html += `
                    <div class="bg-gray-100 p-3 rounded-lg flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span class="text-gray-800">${ingredient}</span>
                    </div>
                `;
            });

            html += "</div></div>";
            elements.ingredientsList.innerHTML = html;

            state.detectedIngredients = uniqueIngredients;
            elements.recipeSearchForm.classList.remove("hidden");
            this.populateEditableIngredients(uniqueIngredients);

            // Hide the debug info
            elements.detectionStatus.classList.add("hidden");
        },

        populateEditableIngredients(ingredients) {
            const container = document.getElementById("editable-ingredients-container");
            container.innerHTML = "";
            ingredients.forEach((ingredient) => this.addEditableIngredient(ingredient));
        },

        addEditableIngredient(ingredient = "") {
            const container = document.getElementById("editable-ingredients-container");

            // Check if this ingredient already exists
            const existingIngredients = Array.from(container.querySelectorAll(".ingredient-tag")).map((tag) =>
                tag.getAttribute("data-ingredient").trim()
            );

            if (ingredient.trim() !== "" && existingIngredients.includes(ingredient.trim())) {
                return;
            }

            const div = document.createElement("div");
            div.className = "ingredient-tag flex items-center bg-green-100 px-3 py-2 rounded-full text-green-800 mb-2 mr-2 inline-block";
            div.setAttribute("data-ingredient", ingredient);
            div.innerHTML = `
                <span>${ingredient}</span>
                <button type="button" class="ml-2 text-green-600 hover:text-green-800 remove-ingredient">
                    ×
                </button>
            `;

            const removeBtn = div.querySelector(".remove-ingredient");
            removeBtn.addEventListener("click", () => div.remove());

            container.appendChild(div);
        },
    };

    // Recipe search stuff
    const recipeSearch = {
        search(e) {
            e.preventDefault();

            const self = this;

            // Collect ingredients
            const ingredientTags = document.querySelectorAll(".ingredient-tag");
            const ingredients = Array.from(
                new Set(
                    Array.from(ingredientTags)
                        .map((tag) => tag.getAttribute("data-ingredient").trim())
                        .filter((value) => value !== "")
                )
            );

            if (ingredients.length === 0) {
                alert("Please add at least one ingredient");
                return;
            }

            // Get filter values
            const cuisineType = elements.cuisineType.value;
            const dietRestriction = elements.dietRestriction.value;

            // Disable button and show loading state
            elements.findRecipesButton.disabled = true;
            StateMachine.transition("LOADING_RECIPES");

            const handleApiError = (error) => {
                console.error("Error:", error);
                elements.recipesList.innerHTML = `
            <div class="text-center p-8 bg-gray-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="mt-4 text-gray-700 font-medium">Error finding recipes</p>
                <p class="mt-2 text-gray-600">${error.message}</p>
                <button class="mt-4 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300" 
                        onclick="document.getElementById('find-recipes-button').disabled = false; StateMachine.transition('INGREDIENT_SELECT');">
                    Try Again
                </button>
            </div>
            `;
            };

            // If cuisine or diet filters are applied, we need to use the complexSearch endpoint
            if ((cuisineType && cuisineType !== "any") || (dietRestriction && dietRestriction !== "any")) {
                const searchParams = new URLSearchParams({
                    includeIngredients: ingredients.join(","),
                    number: "5",
                    instructionsRequired: "true",
                    fillIngredients: "true",
                    addRecipeInformation: "true",
                });

                // Add cuisine type if selected
                if (cuisineType && cuisineType !== "any") {
                    searchParams.append("cuisine", cuisineType);
                }

                // Add diet restriction if selected
                if (dietRestriction && dietRestriction !== "any") {
                    searchParams.append("diet", dietRestriction);
                }

                fetch(`https://api.spoonacular.com/recipes/complexSearch?${searchParams.toString()}&apiKey=fcd729f5b562417a82119bd84d2756f9`)
                    .then((response) => {
                        if (!response.ok) {
                            return response.text().then((text) => {
                                throw new Error(`API error (${response.status}): ${text}`);
                            });
                        }
                        return response.json();
                    })
                    .then((searchData) => {
                        console.log("complexSearch response:", searchData);

                        if (!searchData.results || searchData.results.length === 0) {
                            StateMachine.transition("RECIPE_RESULTS");
                            self.displayRecipes([]);
                            return;
                        }

                        const recipes = searchData.results.map((recipe) => {
                            return {
                                ...recipe,
                                usedIngredientCount: recipe.usedIngredientCount || 0,
                                missedIngredientCount: recipe.missedIngredientCount || 0,
                                usedIngredients: recipe.usedIngredients || [],
                                missedIngredients: recipe.missedIngredients || [],
                            };
                        });

                        StateMachine.transition("RECIPE_RESULTS");
                        self.displayRecipes(recipes);
                    })
                    .catch((error) => {
                        handleApiError(error);
                    });
            } else {
                const params = new URLSearchParams({
                    ingredients: ingredients.join(","),
                    number: "5",
                    ranking: "2",
                    ignorePantry: "true",
                });

                fetch(`https://api.spoonacular.com/recipes/findByIngredients?${params.toString()}&apiKey=fcd729f5b562417a82119bd84d2756f9`)
                    .then((response) => {
                        if (!response.ok) {
                            return response.text().then((text) => {
                                throw new Error(`API error (${response.status}): ${text}`);
                            });
                        }
                        return response.json();
                    })
                    .then((recipesData) => {
                        if (recipesData.length === 0) {
                            StateMachine.transition("RECIPE_RESULTS");
                            self.displayRecipes([]);
                            return;
                        }

                        // Get recipe IDs for fetching detailed information
                        const recipeIds = recipesData.map((recipe) => recipe.id).join(",");

                        return fetch(`https://api.spoonacular.com/recipes/informationBulk?ids=${recipeIds}&apiKey=fcd729f5b562417a82119bd84d2756f9`)
                            .then((response) => {
                                if (!response.ok) {
                                    return response.text().then((text) => {
                                        throw new Error(`API error (${response.status}): ${text}`);
                                    });
                                }
                                return response.json();
                            })
                            .then((detailedRecipes) => {
                                // Combine the two datasets
                                const combinedRecipes = detailedRecipes.map((detailedRecipe) => {
                                    const basicRecipe = recipesData.find((r) => r.id === detailedRecipe.id);
                                    return {
                                        ...detailedRecipe,
                                        usedIngredientCount: basicRecipe.usedIngredientCount,
                                        missedIngredientCount: basicRecipe.missedIngredientCount,
                                        usedIngredients: basicRecipe.usedIngredients,
                                        missedIngredients: basicRecipe.missedIngredients,
                                    };
                                });

                                StateMachine.transition("RECIPE_RESULTS");
                                self.displayRecipes(combinedRecipes);
                            });
                    })
                    .catch((error) => {
                        handleApiError(error);
                    });
            }
        },

        displayRecipes(recipes) {
            if (!recipes || recipes.length === 0) {
                elements.recipesList.innerHTML = `
            <div class="text-center p-8 bg-gray-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p class="mt-4 text-gray-700 font-medium">No recipes found</p>
                <p class="mt-2 text-gray-600">Try adjusting your ingredients or filters</p>
                <button class="mt-4 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300" 
                        onclick="document.getElementById('find-recipes-button').disabled = false; StateMachine.transition('INGREDIENT_SELECT');">
                    Try Again
                </button>
            </div>
        `;
                return;
            }

            const recipesToShow = recipes.slice(0, 5);

            // If we have fewer than 5 recipes, add placeholders
            while (recipesToShow.length < 5) {
                recipesToShow.push({
                    placeholder: true,
                    title: "No Recipe Found",
                    image: "https://via.placeholder.com/300x200?text=No+Recipe+Found",
                });
            }

            let html = `
        <div class="flex flex-col space-y-4">
    `;

            recipesToShow.forEach((recipe) => {
                html += this.generateHorizontalRecipeCard(recipe);
            });

            html += "</div>";

            elements.recipesList.innerHTML = html;
            elements.findRecipesButton.disabled = false;
        },

        generateHorizontalRecipeCard(recipe) {
            if (recipe.placeholder) {
                return `
            <div class="bg-gray-100 rounded-xl overflow-hidden shadow-md opacity-50 flex">
                <div class="w-1/3 bg-gray-200"></div>
                <div class="p-4 w-2/3">
                    <div class="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div class="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
            </div>
        `;
            }

            // Show how many ingredients from our list are used
            const usedIngredientCount = recipe.usedIngredientCount || 0;
            const totalIngredients = (recipe.usedIngredientCount || 0) + (recipe.missedIngredientCount || 0);

            const usedIngredientsList = recipe.usedIngredients ? recipe.usedIngredients.map((ing) => ing.name).join(", ") : "";

            const usedIngredientsTooltip = usedIngredientsList ? `title="Using: ${usedIngredientsList}"` : "";

            return `
        <div class="bg-white rounded-xl shadow-md overflow-hidden flex transition-transform duration-300 transform hover:shadow-lg">
            <div class="w-1/3 relative">
                <img src="${recipe.image}" alt="${recipe.title}" class="absolute w-full h-full object-cover">
            </div>
            <div class="p-4 w-2/3 flex flex-col">
                <h3 class="text-lg font-bold text-gray-800 mb-2">${recipe.title}</h3>
                
                <div class="flex-grow">
                    ${
                        recipe.readyInMinutes
                            ? `
                    <div class="inline-flex items-center text-sm text-gray-600 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Ready in ${recipe.readyInMinutes} minutes
                    </div>
                    `
                            : ""
                    }
                    
                    <div class="inline-flex items-center text-sm ${
                        usedIngredientCount > 0 ? "text-green-700" : "text-gray-600"
                    } mt-1 ml-3" ${usedIngredientsTooltip}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 ${
                            usedIngredientCount > 0 ? "text-green-700" : "text-gray-500"
                        }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span class="font-medium">Uses ${usedIngredientCount} of your ingredients</span>
                    </div>
                </div>
                
                <a href="https://spoonacular.com/recipes/${recipe.title.replace(/\s+/g, "-")}-${recipe.id}" 
                   target="_blank" 
                   class="mt-3 inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition duration-300 self-start">
                    View Recipe
                </a>
            </div>
        </div>
    `;
        },
    };

    if (elements.addIngredientBtn) {
        elements.addIngredientBtn.addEventListener("click", function () {
            // Ingredient modal
            const modalHTML = `
                <div id="ingredient-modal" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div class="bg-white rounded-lg p-6 max-w-sm w-full">
                        <h3 class="text-lg font-medium text-gray-900 mb-4">Add New Ingredient</h3>
                        <input type="text" id="new-ingredient-input" class="w-full border border-gray-300 rounded-lg p-2 mb-4" placeholder="Enter ingredient name">
                        <div class="flex justify-end space-x-2">
                            <button id="cancel-ingredient" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">Cancel</button>
                            <button id="confirm-ingredient" class="px-4 py-2 bg-green-500 text-white rounded-lg">Add</button>
                        </div>
                    </div>
                </div>
            `;

            // Append modal to body
            document.body.insertAdjacentHTML("beforeend", modalHTML);

            // Focus input
            document.getElementById("new-ingredient-input").focus();

            document.getElementById("cancel-ingredient").addEventListener("click", function () {
                document.getElementById("ingredient-modal").remove();
            });

            // Handle confirm
            document.getElementById("confirm-ingredient").addEventListener("click", function () {
                const newIngredient = document.getElementById("new-ingredient-input").value.trim();
                if (newIngredient) {
                    ingredientDetector.addEditableIngredient(newIngredient);
                }
                document.getElementById("ingredient-modal").remove();
            });

            // Handle enter key
            document.getElementById("new-ingredient-input").addEventListener("keyup", function (e) {
                if (e.key === "Enter") {
                    const newIngredient = e.target.value.trim();
                    if (newIngredient) {
                        ingredientDetector.addEditableIngredient(newIngredient);
                    }
                    document.getElementById("ingredient-modal").remove();
                }
            });
        });
    }

    // Event Listeners
    elements.webcamToggle.addEventListener("click", () => {
        if (elements.webcamContainer.classList.contains("hidden")) {
            elements.webcamContainer.classList.remove("hidden");
            webcamManager.start();
        } else {
            elements.webcamContainer.classList.add("hidden");
            webcamManager.stop();
        }
    });

    elements.captureButton.addEventListener("click", () => webcamManager.capture());
    elements.imageUpload.addEventListener("change", (e) => imageUploadHandler.handle(e));

    // State Machine Event Listeners
    elements.startButton.addEventListener("click", () => {
        StateMachine.transition("UPLOAD");
    });

    elements.detectButton.addEventListener("click", () => {
        StateMachine.transition("LOADING_DETECTION");
        ingredientDetector.detect();
    });

    elements.findRecipesButton.addEventListener("click", (e) => {
        e.preventDefault();
        recipeSearch.search(e);
    });

    elements.restartButton.addEventListener("click", () => {
        // Change from going to LANDING to going to UPLOAD
        StateMachine.transition("UPLOAD");
        // Reset the form and current image
        imageUploadHandler.reset();
        // Also stop any active webcam
        webcamManager.stop();
        elements.webcamContainer.classList.add("hidden");
    });

    // Initial state
    StateMachine.transition("LANDING");
});
