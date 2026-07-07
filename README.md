# FlavorFind

FlavorFind is a premium, responsive React-based recipe search web application designed to help users discover meals based on ingredients they have on hand, with advanced dietary filtering and persistent favoriting.

## Stack
- **Language / Framework**: React 19 (JavaScript) / Vite 8
- **Key libraries**: Vitest (testing), Lucide/SVG Icons (UI icons)
- **Database (if any)**: LocalStorage (browser-level favorites persistence)

## Setup
Follow these steps to set up the project on your local machine:
1. Ensure Node.js (version 18+ or 22+ recommended) is installed.
2. Clone this repository and open a terminal inside the project directory.
3. Install dependencies:
   ```bash
   npm install
   ```

## Environment Variables
Currently, no environment variables are required. See [.env.example](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/.env.example) for details.

## Running Locally
To launch the application locally in development mode:
```bash
npm run dev
```
Open your browser to the local URL displayed in the terminal (typically `http://localhost:5173`).

To run the unit tests:
```bash
npm run test
```

To build the project for production and test the build compilation:
```bash
npm run build
```

## Deployed
The application is deployed live on Vercel at: [flavorfind-recipe-finder.vercel.app](https://flavorfind-recipe-finder.vercel.app)


## Architecture Notes
The application is structured around a strict separation of concerns, decoupling UI components, data structures, search algorithms, and states:
- **Models (`src/models/recipe.js`)**: Defines the required structure for a recipe object and exports a `validateRecipe` helper, guaranteeing data integrity.
- **Utilities**:
  - `src/utils/filterUtils.js`: Handles string normalization, strict matching, and dietary filters.
  - `src/utils/shoppingListUtils.js`: Normalizes units, evaluates fractional quantities, assigns departments, and aggregates duplicate ingredients.
  - `src/utils/cookModeUtils.js`: Extracts step instruction durations (seconds) using RegEx patterns.
- **Logging & Utilities (`src/utils/`)**:
  - `src/utils/logger.js`: A custom level-based logger (DEBUG, INFO, WARN, ERROR) used to track application flow and debug state mutations cleanly without standard `console.log` pollution.
  - `src/utils/sharingUtils.js`: Packages custom recipes into Base64 query URLs and parses ID reference lookups for keyless client-side sharing.
  - `src/utils/portionsScaler.js`: Parses, formats, and scales recipe ingredient quantity values based on select multiplier yields.
- **Services**:
  - `src/services/recipeService.js`: Handles combined recipe search and favorites indexing synced to `localStorage`.
  - `src/services/inventoryService.js`: Operates CRUD storage and expiration day math for local fridge inventory items.
  - `src/services/plannerService.js`: Manages weekly meal plan slot storage synced to `localStorage`.
  - `src/services/voiceConfigService.js`: Manages customizable voice commands mappings and Web Audio alarm chime selections synced to `localStorage`.
  - `src/services/apiService.js`: Operates external recipe queries (via Spoonacular or keyless TheMealDB).
  - `src/services/conversionService.js`: Operates weights, volumes, and temperature conversions, and fuzzy substitutions advisor.
  - `src/services/speechSynthesisService.js`: Manages text-to-speech configuration (voices, rate, pitch) and step narration playbacks.
  - `src/services/nutritionService.js`: Estimates recipe macronutrients and sodium content using offline keyword indexes, portion scales, and yield counts.
- **Components (`src/components/`)**: Atomic, reusable React components:
  - `RecipeCard`: Handles card detail layout, custom deletion buttons, step accordions, expired/expiring warnings, and drag-and-drop triggers.
  - `RecipeList`: Maps recipes to the layout and manages the empty search state.
  - `SearchFilters`: Coordinates search queries and checkboxes.
  - `FavoritesList`: Displays favorited recipes in a slide-out drawer with selection checkboxes and drag capability.
  - `RecipeForm`: An overlay modal containing form elements, client validations, and dynamic list inputs.
  - `ShoppingListModal`: Renders aggregated shopping checklist items, manages custom shopping list categories and custom keyword sorting rules, and handles copy-to-clipboard and browser print overrides.
  - `CookModeModal`: Fullscreen step-by-step cooking guide with step countdown timers, Web Audio beep chimes, hands-free voice commands, an interactive conversions/substitutions advisor, and a text-to-speech recipe step narrator.
  - `InventoryDrawer`: Sliding drawer displaying the fridge ingredients database, freshness badges, an addition form, a button to autofill ingredient searches, and an expiring freshness warning threshold configurator.
  - `PlannerDrawer`: Sliding drawer displaying the weekly meal grid (Monday-Sunday for breakfast, lunch, dinner), drag-and-drop drop targets, select dropdown fallbacks, and a bulk shopping list compiler.
- **App Layout (`src/App.jsx` & `src/App.css`)**: Serves as the central coordinator for state synchronization, synchronization of favorites deletions, toast alerts, Cook Mode active selections, HSL styling, and printer layout formatting.

## Notes
- Built using React 19 and Vite 8, featuring high HMR speeds.
- 100% test coverage on the utility, model, and service layers (100 total unit tests).


