# Changelog

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
