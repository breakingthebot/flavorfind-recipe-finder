# Changelog

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.11.0] - 2026-07-06

### Added
- Created `getExpirationThreshold` and `saveExpirationThreshold` helper methods inside [src/services/inventoryService.js](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/services/inventoryService.js) to manage configuration indices synced to `localStorage`.
- Created unit tests verifying threshold clamp ranges (1-14 days) and isolation test runs inside [tests/services/inventoryService.test.js](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/tests/services/inventoryService.test.js) (bringing total tests to 82 passing).

### Changed
- Integrated custom warning threshold dropdown selector inside [src/components/InventoryDrawer.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/components/InventoryDrawer.jsx) for dynamic warnings badges rendering.
- Wired threshold state triggers and re-ranking hooks inside [src/App.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/App.jsx) to re-evaluate recipes scores reactively when warning sensitivities change.
- Appended layout visual styles for threshold select boxes to [src/App.css](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/App.css).

## [1.10.0] - 2026-07-06

### Added
- Created [src/services/speechSynthesisService.js](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/services/speechSynthesisService.js) managing text-to-speech configuration (rate, pitch, custom voices) and playback triggers using `window.speechSynthesis`.
- Created [tests/services/speechSynthesisService.test.js](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/tests/services/speechSynthesisService.test.js) validating defaults, settings sanitizations, test narrations, and stop parameters (bringing total tests to 81 passing).

### Changed
- Integrated step-by-step narration inside [src/components/CookModeModal.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/components/CookModeModal.jsx) to automatically read instructions aloud when navigating between cooking directions.
- Mounted voice selectors, speed rate sliders, pitch controllers, and voice testing buttons inside the Settings drawer overlay.

## [1.9.0] - 2026-07-06

### Added
- Created [src/services/conversionService.js](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/services/conversionService.js) managing weight (g, kg, oz, lb), volume (ml, cup, tbsp, tsp, fl oz), and temperature (C, F) conversions, and fuzzy substitutions advisor index.
- Created [tests/services/conversionService.test.js](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/tests/services/conversionService.test.js) validating metric/imperial math, temperature formulas, and fuzzy matches (now totaling 76 passing unit tests).

### Changed
- Integrated kitchen tools in [src/components/CookModeModal.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/components/CookModeModal.jsx) rendering live interactive unit converters, active recipe substitutions highlights, and general substitute search inputs.
- Refactored [src/services/apiService.js](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/services/apiService.js) to return flat strings instead of objects for external recipe ingredients, matching the internal schema and resolving potential rendering crashes.
- Appended styling rules to [src/App.css](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/App.css) for kitchen tools select dropdowns, grid layouts, and active substitutes containers.

## [1.8.0] - 2026-07-06

### Added
- Created [src/utils/sharingUtils.js](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/utils/sharingUtils.js) for UTF-8 safe Base64 encoding of custom recipes in URL query parameters, and ID reference formatting for standard recipes.
- Created [tests/utils/sharingUtils.test.js](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/tests/utils/sharingUtils.test.js) asserting query builders, parameter parsing, and decoding.
- Added `fetchRecipeById` lookup endpoint to [src/services/apiService.js](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/services/apiService.js) with test coverage in [tests/services/apiService.test.js](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/tests/services/apiService.test.js) (67 unit tests total).

### Changed
- Refactored [src/App.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/App.jsx) to parse incoming shared links on startup, automatically importing custom recipes or fetching external reference IDs, and clearing parameters from address bar.
- Refactored [src/App.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/App.jsx) and [src/App.css](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/App.css) to support printable recipe cards (`@media print` formatted sheets) and consolidated shopping lists.
- Updated [src/components/RecipeCard.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/components/RecipeCard.jsx) and [src/components/RecipeList.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/components/RecipeList.jsx) to mount print and copy-link share button controls.

## [1.7.0] - 2026-07-06

### Added
- Created [src/services/apiService.js](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/services/apiService.js) managing external searches (connecting to Spoonacular complexSearch or falling back to keyless TheMealDB API queries).
- Configured [tests/services/apiService.test.js](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/tests/services/apiService.test.js) checking environment stubs, fetch calls, and fallback mapping outputs (now totaling 61 unit tests).
- Updated [.env.example](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/.env.example) to define external API environment keys.

### Changed
- Configured [src/App.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/App.jsx) search effect to load external recipes asynchronously in the background, combining and de-duplicating results with local recipes.
- Rendered search progress indicators next to Featured headers in [src/App.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/App.jsx).
- Appended spinner animations and loader colors to [src/App.css](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/App.css).

## [1.6.0] - 2026-07-06

### Added
- Created [src/services/voiceConfigService.js](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/services/voiceConfigService.js) managing customizable voice mapping structures and alarm chimes synced to localStorage.
- Added settings overlay tab inside [src/components/CookModeModal.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/components/CookModeModal.jsx) allowing customizable triggers, alarm chimes, and instant play preview tests.
- Implemented unit tests in [tests/services/voiceConfigService.test.js](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/tests/services/voiceConfigService.test.js) checking settings CRUD and transcript checking (now totaling 58 unit tests).

### Changed
- Configured [src/components/CookModeModal.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/components/CookModeModal.jsx) speech result processing to verify commands dynamically against active user configurations.
- Refactored Web Audio oscillator configurations to support square double-beeps and sweep frequencies.
- Appended overlay flex rules, drop menus, preview test buttons, and grid mapping styles to [src/App.css](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/App.css).

## [1.5.0] - 2026-07-06

### Added
- Created [src/services/plannerService.js](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/services/plannerService.js) managing weekly meal plan slots (Monday-Sunday for breakfast, lunch, and dinner) synced to localStorage.
- Built [src/components/PlannerDrawer.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/components/PlannerDrawer.jsx) drawer allowing slot planning, select dropdown fallbacks, resets, and bulk shopping list generation.
- Added unit tests in [tests/services/plannerService.test.js](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/tests/services/plannerService.test.js) checking planner slot updates and clear triggers (now totaling 55 unit tests).

### Changed
- Integrated planner states and CRUD handlers in [src/App.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/App.jsx) and mounted the weekly calendar drawer.
- Configured [src/components/RecipeCard.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/components/RecipeCard.jsx) and [src/components/FavoritesList.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/components/FavoritesList.jsx) to make items draggable.
- Appended weekly planner grid dimensions, slot shadows, select fallbacks, and drag transitions to [src/App.css](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/App.css).

## [1.4.0] - 2026-07-06

### Added
- Created [src/services/inventoryService.js](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/services/inventoryService.js) managing CRUD storage and expiration calculations for local fridge inventory items.
- Built [src/components/InventoryDrawer.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/components/InventoryDrawer.jsx) drawer allowing ingredient management, freshness alerts, and autofilling main search inputs.
- Implemented `scoreRecipeByInventory` in [src/utils/filterUtils.js](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/utils/filterUtils.js) to re-rank search results by expiring ingredients used.
- Created unit tests in [tests/services/inventoryService.test.js](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/tests/services/inventoryService.test.js) and added test coverage in [tests/utils/filterUtils.test.js](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/tests/utils/filterUtils.test.js) (now totaling 50 unit tests).

### Changed
- Integrated state trackers and re-ranking filters in [src/App.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/App.jsx) and mounted the drawer.
- Updated [src/components/RecipeCard.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/components/RecipeCard.jsx) to display warning banners for ingredients expiring soon.
- Appended drawer layouts, form variables, left-border tags, and card warnings to [src/App.css](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/App.css).

## [1.3.0] - 2026-07-06

### Added
- Created [src/utils/cookModeUtils.js](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/utils/cookModeUtils.js) to parse instruction text durations using RegEx.
- Built [src/components/CookModeModal.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/components/CookModeModal.jsx) walkthrough layout equipped with countdown timers, Web Audio beep chimes, screen flashing triggers, and browser Web Speech hands-free commands.
- Wired a new "👨‍🍳 Cook Mode" start action button in [src/components/RecipeCard.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/components/RecipeCard.jsx).
- Added 4 tests in [tests/utils/cookModeUtils.test.js](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/tests/utils/cookModeUtils.test.js) checking duration extractions.

### Changed
- Configured [src/components/RecipeList.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/components/RecipeList.jsx) to relay cook commands.
- Updated [src/App.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/App.jsx) to mount and manage `CookModeModal` states.
- Appended cook mode visual overlay, pulsing warnings, and responsive layout selectors to [src/App.css](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/App.css).

## [1.2.0] - 2026-07-06

### Added
- Created [src/utils/shoppingListUtils.js](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/utils/shoppingListUtils.js) to parse fractional/decimal units and consolidate ingredients by category (Produce, Dairy, Pantry, Spices).
- Built [src/components/ShoppingListModal.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/components/ShoppingListModal.jsx) overlay supporting checks, text copier, and print triggers.
- Appended checkboxes and bulk Select/Clear actions in [src/components/FavoritesList.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/components/FavoritesList.jsx).
- Added 10 unit tests in [tests/utils/shoppingListUtils.test.js](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/tests/utils/shoppingListUtils.test.js) checking division, normalization, and aggregation rules.

### Changed
- Updated [src/App.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/App.jsx) to coordinate list selection states and sync selections upon favorite removals.
- Appended styling selectors and print-only media overrides to [src/App.css](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/App.css) to format printed lists.

## [1.1.0] - 2026-07-06

### Added
- Created custom recipe CRUD operations in [src/services/recipeService.js](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/services/recipeService.js) (`getCustomRecipes()`, `addCustomRecipe()`, `deleteCustomRecipe()`) persisted via `localStorage`.
- Built [src/components/RecipeForm.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/components/RecipeForm.jsx) featuring title/time validation and dynamic inputs for ingredients and instructions.
- Integrated toast notification overlays for success/error alerts in [src/App.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/App.jsx).
- Added custom card deletion controls on [src/components/RecipeCard.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/components/RecipeCard.jsx) with cascaded favorite cleanups.
- Added 5 new unit tests in [tests/services/recipeService.test.js](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/tests/services/recipeService.test.js) covering custom recipe lifecycle validation and searches.

### Changed
- Wrapped `loadData` in `useCallback` inside [src/App.jsx](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/App.jsx) to address the exhaustive-deps linter warning.
- Appended styling selectors in [src/App.css](file:///C:/Users/marve/Desktop/AI-286-Builds/Build_25/src/App.css) for custom forms, toast alerts, card deletion triggers, and modal animation triggers.

## [1.0.0] - 2026-07-06

### Added
- Created Git repository and configured `.gitignore` to exclude agent instructions (`AGENTS.md`), build notes (`BUILD_NOTES.md`), and environment secrets.
- Configured VS Code workspace workspace settings for formatting and indentation in `.vscode/settings.json`.
- Created standard MIT License in `LICENSE` file.
- Setup package dependencies including React, Vite, and Vitest test runner.
- Added Recipe data validation model in `src/models/recipe.js`.
- Implemented level-based structured logging in `src/utils/logger.js`.
- Created search, strict ingredient matching, and dietary filter helpers in `src/utils/filterUtils.js`.
- Coded the Core Recipe service in `src/services/recipeService.js` supporting mock dataset retrieval and favorites persistence.
- Built interactive UI components: `RecipeCard`, `RecipeList`, `SearchFilters`, and `FavoritesList` sidebar.
- Added 24 unit tests covering models, services, and utilities.
- Cleaned up default Vite boilerplate files and logo assets.
