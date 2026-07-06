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
No deployment configured yet.

## Architecture Notes
The application is structured around a strict separation of concerns, decoupling UI components, data structures, search algorithms, and states:
- **Models (`src/models/recipe.js`)**: Defines the required structure for a recipe object and exports a `validateRecipe` helper, guaranteeing data integrity.
- **Utilities (`src/utils/filterUtils.js`)**: Decouples search matching logic from the UI. It hosts the string-normalization algorithms used to perform case-insensitive, whitespace-trimmed, strict (AND) and non-strict (OR) ingredient matching, as well as dietary tag evaluation.
- **Logging (`src/utils/logger.js`)**: A custom level-based logger (DEBUG, INFO, WARN, ERROR) used to track application flow and debug state mutations cleanly without standard `console.log` pollution.
- **Services (`src/services/recipeService.js`)**: Functions as the data and state access layer. It handles looking up recipes, searching them using filter utilities, and syncing user favorites to `localStorage`.
- **Components (`src/components/`)**: Atomic, reusable React components. `RecipeCard` handles detail layout and instructions accordion states; `RecipeList` handles mapping cards and the empty state; `SearchFilters` controls query states; and `FavoritesList` renders the slide-out navigation panel.
- **App Layout (`src/App.jsx` & `src/App.css`)**: Serves as the central coordinator for state synchronization and applies glassmorphic styling, HSL dark/light modes, and fluid css transitions.

## Notes
- Built using React 19 and Vite 8, featuring high HMR speeds.
- 100% test coverage on the utility, model, and service layers (24 total unit tests).
