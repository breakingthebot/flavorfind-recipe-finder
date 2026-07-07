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
- **Logging (`src/utils/logger.js`)**: A custom level-based logger (DEBUG, INFO, WARN, ERROR) used to track application flow and debug state mutations cleanly without standard `console.log` pollution.
- **Services**:
  - `src/services/recipeService.js`: Handles combined recipe search and favorites indexing synced to `localStorage`.
  - `src/services/inventoryService.js`: Operates CRUD storage and expiration day math for local fridge inventory items.
- **Components (`src/components/`)**: Atomic, reusable React components:
  - `RecipeCard`: Handles card detail layout, custom deletion buttons, step accordions, and expired/expiring ingredient warning banners.
  - `RecipeList`: Maps recipes to the layout and manages the empty search state.
  - `SearchFilters`: Coordinates search queries and checkboxes.
  - `FavoritesList`: Displays favorited recipes in a slide-out drawer with selection checkboxes.
  - `RecipeForm`: An overlay modal containing form elements, client validations, and dynamic list inputs.
  - `ShoppingListModal`: Renders aggregated shopping checklist items, handles copy-to-clipboard and browser print overrides.
  - `CookModeModal`: Fullscreen step-by-step cooking guide with step countdown timers, Web Audio beep chimes, and browser hands-free voice commands.
  - `InventoryDrawer`: Sliding drawer displaying the fridge ingredients database, freshness badges, an addition form, and a button to autofill ingredient searches.
- **App Layout (`src/App.jsx` & `src/App.css`)**: Serves as the central coordinator for state synchronization, synchronization of favorites deletions, toast alerts, Cook Mode active selections, HSL styling, and printer layout formatting.

## Notes
- Built using React 19 and Vite 8, featuring high HMR speeds.
- 100% test coverage on the utility, model, and service layers (50 total unit tests).


