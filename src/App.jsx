// src/App.jsx
// Main application component coordinating layout, state, recipe searches, custom recipe form modal, favorites, and shopping list.
// Connects to: src/components/*, src/services/recipeService.js, src/utils/logger.js
// Created: 2026-07-06

import React, { useState, useEffect, useCallback, useRef } from 'react';
import SearchFilters from './components/SearchFilters.jsx';
import RecipeList from './components/RecipeList.jsx';
import FavoritesList from './components/FavoritesList.jsx';
import RecipeForm from './components/RecipeForm.jsx';
import ShoppingListModal from './components/ShoppingListModal.jsx';
import CookModeModal from './components/CookModeModal.jsx';
import InventoryDrawer from './components/InventoryDrawer.jsx';
import PlannerDrawer from './components/PlannerDrawer.jsx';
import { 
  getRecipes, 
  searchRecipes, 
  getFavorites, 
  toggleFavorite, 
  addCustomRecipe, 
  deleteCustomRecipe 
} from './services/recipeService.js';
import { 
  getInventory, 
  addInventoryItem, 
  deleteInventoryItem 
} from './services/inventoryService.js';
import { 
  getMealPlan, 
  planMeal, 
  unplanMeal, 
  clearMealPlan 
} from './services/plannerService.js';
import { scoreRecipeByInventory } from './utils/filterUtils.js';
import { searchExternalRecipes, fetchRecipeById } from './services/apiService.js';
import { 
  generateShareLink, 
  parseShareParameters, 
  clearQueryParams 
} from './utils/sharingUtils.js';
import { logger } from './utils/logger.js';
import './App.css';

export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [strictSearch, setStrictSearch] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
  const [isCookModeOpen, setIsCookModeOpen] = useState(false);
  const [activeCookRecipe, setActiveCookRecipe] = useState(null);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [mealPlan, setMealPlan] = useState({});
  const [isSearchingExternal, setIsSearchingExternal] = useState(false);
  
  // Printing and Sharing States
  const [printData, setPrintData] = useState(null);
  
  // Shopping list selection state (array of recipe IDs)
  const [selectedRecipesForList, setSelectedRecipesForList] = useState([]);
  
  // Notification Toast state
  const [toast, setToast] = useState(null);

  // Helper to trigger transient success/error messages
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Load data (wrapped in useCallback to prevent re-creation)
  const loadData = useCallback(() => {
    logger.info('Refreshing application dataset');
    const allRecipes = getRecipes();
    setRecipes(allRecipes);
    setFavorites(getFavorites());
    setInventory(getInventory());
    setMealPlan(getMealPlan());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Hook for parsing incoming shared recipe links on startup
  const hasParsedRef = useRef(false);
  useEffect(() => {
    if (hasParsedRef.current) return;

    const parsed = parseShareParameters();
    if (parsed) {
      hasParsedRef.current = true;
      if (parsed.type === 'custom') {
        try {
          addCustomRecipe(parsed.data);
          loadData();
          showToast(`✨ Added shared recipe: "${parsed.data.name}"!`);
          clearQueryParams();
        } catch (err) {
          showToast(`Failed to import shared recipe: ${err.message}`, 'error');
        }
      } else if (parsed.type === 'reference') {
        const targetId = parsed.data;
        const allLocal = getRecipes();
        const found = allLocal.find(r => r.id === targetId);
        if (found) {
          handleStartCooking(found);
          showToast(`👨‍🍳 Started Cook Mode for shared recipe!`);
          clearQueryParams();
        } else {
          logger.info('Fetching shared external recipe details', { targetId });
          fetchRecipeById(targetId)
            .then(fetchedRecipe => {
              if (fetchedRecipe) {
                handleStartCooking(fetchedRecipe);
                showToast(`👨‍🍳 Started Cook Mode for shared recipe!`);
                clearQueryParams();
              } else {
                showToast('Failed to load shared recipe details.', 'error');
              }
            })
            .catch(err => {
              logger.error('Failed to import referenced sharing recipe', { error: err.message });
            });
        }
      }
    }
  }, [loadData, showToast]);

  // Hook for triggering printable layouts
  useEffect(() => {
    if (printData) {
      window.print();
      setPrintData(null);
    }
  }, [printData]);

  // Synchronize selection state with favorites
  useEffect(() => {
    setSelectedRecipesForList(prev => prev.filter(id => favorites.includes(id)));
  }, [favorites]);

  // Update filtered recipes when search parameters or inventory change
  useEffect(() => {
    let active = true;

    const ingredients = searchQuery
      .split(',')
      .map(i => i.trim())
      .filter(i => i.length > 0);

    // 1. Initial Local Search
    const localFiltered = searchRecipes(ingredients, activeFilters, strictSearch);
    
    const rankAndSetRecipes = (recipeList) => {
      const scored = recipeList.map(recipe => {
        const { score, matchingExpiringItems } = scoreRecipeByInventory(recipe, inventory);
        return {
          ...recipe,
          fridgeScore: score,
          matchingExpiringItems
        };
      });
      const sorted = [...scored].sort((a, b) => b.fridgeScore - a.fridgeScore);
      if (active) {
        setFilteredRecipes(sorted);
      }
    };

    // Set local results immediately
    rankAndSetRecipes(localFiltered);

    // 2. Fetch External Recipes Async (only if a search query is present)
    const rawQuery = searchQuery.trim();
    if (rawQuery.length > 0) {
      setIsSearchingExternal(true);
      searchExternalRecipes(rawQuery)
        .then(externalRecipes => {
          if (!active) return;
          
          // Apply dietary filters to external recipes
          const filteredExternal = externalRecipes.filter(recipe => {
            if (strictSearch) {
              return activeFilters.every(filter => recipe.dietary.includes(filter));
            } else if (activeFilters.length > 0) {
              return activeFilters.some(filter => recipe.dietary.includes(filter));
            }
            return true;
          });

          // Combine with local recipes, ensuring no duplicate IDs
          const localIds = new Set(localFiltered.map(r => r.id));
          const deduplicatedExternal = filteredExternal.filter(r => !localIds.has(r.id));
          
          rankAndSetRecipes([...localFiltered, ...deduplicatedExternal]);
        })
        .catch(err => {
          logger.error('Async external search failed', { error: err.message });
        })
        .finally(() => {
          if (active) {
            setIsSearchingExternal(false);
          }
        });
    } else {
      setIsSearchingExternal(false);
    }

    return () => {
      active = false;
    };
  }, [searchQuery, activeFilters, strictSearch, recipes, inventory]);

  // Handle toggling favorites
  const handleToggleFav = (id) => {
    const updated = toggleFavorite(id);
    setFavorites(updated);
  };

  // Handle dietary filter clicks
  const handleFilterToggle = (filterValue) => {
    setActiveFilters(prev => 
      prev.includes(filterValue) 
        ? prev.filter(f => f !== filterValue) 
        : [...prev, filterValue]
    );
  };

  // Handle custom recipe additions
  const handleCreateRecipe = (recipeData) => {
    try {
      addCustomRecipe(recipeData);
      loadData();
      setIsFormOpen(false);
      showToast('Recipe created successfully!');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  // Handle custom recipe deletions
  const handleDeleteRecipe = (id) => {
    try {
      deleteCustomRecipe(id);
      loadData();
      showToast('Recipe deleted successfully.');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  // Handle selecting a recipe for the shopping list
  const handleToggleSelectRecipe = (id) => {
    setSelectedRecipesForList(prev =>
      prev.includes(id) ? prev.filter(recipeId => recipeId !== id) : [...prev, id]
    );
  };

  // Handle starting Cook Mode
  const handleStartCooking = (recipe) => {
    setActiveCookRecipe(recipe);
    setIsCookModeOpen(true);
  };

  // Handle adding an item to the fridge inventory
  const handleAddItemToInventory = (item) => {
    try {
      const updated = addInventoryItem(item);
      setInventory(updated);
      showToast(`${item.name} added to fridge.`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle deleting an item from the fridge inventory
  const handleDeleteItemFromInventory = (id) => {
    try {
      const updated = deleteInventoryItem(id);
      setInventory(updated);
      showToast('Item removed from fridge.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle autofilling search query from fridge items
  const handleAutofillSearch = (ingredientNames) => {
    setSearchQuery(ingredientNames.join(', '));
    setIsInventoryOpen(false);
    showToast('Autofilled search query from fridge!');
  };

  // Handle sharing a recipe link
  const handleShareRecipe = (recipe) => {
    const link = generateShareLink(recipe);
    if (link) {
      navigator.clipboard.writeText(link)
        .then(() => showToast('Recipe link copied to clipboard!'))
        .catch(() => showToast('Failed to copy link.', 'error'));
    }
  };

  // Handle printing a recipe
  const handlePrintRecipe = (recipe) => {
    setPrintData({ type: 'recipe', data: recipe });
  };

  // Handle planning a meal in the weekly calendar
  const handlePlanMeal = (day, mealType, recipeId) => {
    try {
      const updatedPlan = planMeal(day, mealType, recipeId);
      setMealPlan(updatedPlan);
      const recipeName = recipes.find(r => r.id === recipeId)?.name || 'Recipe';
      showToast(`Planned "${recipeName}" for ${day} ${mealType}.`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle clearing a planned meal slot
  const handleUnplanMeal = (day, mealType) => {
    try {
      const updatedPlan = unplanMeal(day, mealType);
      setMealPlan(updatedPlan);
      showToast(`Cleared ${day} ${mealType} slot.`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle resetting the entire weekly plan
  const handleClearPlan = () => {
    try {
      const updatedPlan = clearMealPlan();
      setMealPlan(updatedPlan);
      showToast('Weekly meal plan reset.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle compiling shopping list from planned recipes
  const handleGeneratePlannerList = (plannedIds) => {
    setSelectedRecipesForList(plannedIds);
    setIsPlannerOpen(false);
    setIsShoppingListOpen(true);
    showToast('Shopping list compiled from planned meals!');
  };

  return (
    <div className="app-container">
      {/* Header Bar */}
      <header className="app-header">
        <div className="header-logo">
          <span className="logo-emoji">🍳</span>
          <h1>FlavorFind</h1>
        </div>
        <div className="header-actions">
          <button
            onClick={() => setIsFormOpen(true)}
            className="create-recipe-btn"
            id="toggle-create-recipe"
          >
            ➕ Create Recipe
          </button>
          <button
            onClick={() => setIsInventoryOpen(true)}
            className="open-inventory-btn"
            id="toggle-inventory-drawer"
          >
            🥦 My Fridge ({inventory.length})
          </button>
          <button
            onClick={() => setIsPlannerOpen(true)}
            className="open-planner-btn"
            id="toggle-planner-drawer"
          >
            📅 Planner ({Object.values(mealPlan).filter(Boolean).length})
          </button>
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="open-favorites-btn"
            id="toggle-favorites-drawer"
          >
            ❤️ Saved ({favorites.length})
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification ${toast.type}`} role="alert" id="app-toast">
          {toast.message}
        </div>
      )}

      {/* Hero Banner Section */}
      <section className="hero-banner">
        <div className="hero-content">
          <h2>Discover Delicious Recipes</h2>
          <p>Search by the ingredients in your kitchen, toggle strict filters, or build your own custom culinary guide.</p>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="main-content">
        <div className="search-section-wrapper">
          <SearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            strictSearch={strictSearch}
            onStrictChange={setStrictSearch}
            activeFilters={activeFilters}
            onFilterToggle={handleFilterToggle}
          />
        </div>

        <section className="recipes-section">
          <div className="section-header">
            <h2>
              {searchQuery || activeFilters.length > 0 
                ? `Results (${filteredRecipes.length})` 
                : 'Featured Recipes'}
              {isSearchingExternal && (
                <span className="search-external-spinner" id="external-search-indicator">
                  ⏳ Searching external APIs...
                </span>
              )}
            </h2>
          </div>
          <RecipeList 
            recipes={filteredRecipes} 
            favorites={favorites} 
            onToggleFav={handleToggleFav} 
            onDelete={handleDeleteRecipe}
            onCook={handleStartCooking}
            onShare={handleShareRecipe}
            onPrint={handlePrintRecipe}
          />
        </section>
      </main>

      {/* Floating Favorites Sidebar Drawer */}
      <FavoritesList
        recipes={recipes}
        favorites={favorites}
        onToggleFav={handleToggleFav}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        selectedItems={selectedRecipesForList}
        onToggleSelect={handleToggleSelectRecipe}
        onGenerateList={() => {
          setIsSidebarOpen(false);
          setIsShoppingListOpen(true);
        }}
      />

      {/* Create Custom Recipe Modal Form */}
      <RecipeForm
        onSubmit={handleCreateRecipe}
        onClose={() => setIsFormOpen(false)}
        isOpen={isFormOpen}
      />

      {/* Consolidated Shopping List Modal */}
      <ShoppingListModal
        isOpen={isShoppingListOpen}
        onClose={() => setIsShoppingListOpen(false)}
        selectedRecipes={recipes.filter(r => selectedRecipesForList.includes(r.id))}
        onCopySuccess={showToast}
      />

      {/* Fullscreen Cook Mode walkthrough overlay */}
      <CookModeModal
        isOpen={isCookModeOpen}
        onClose={() => setIsCookModeOpen(false)}
        recipe={activeCookRecipe}
      />

      {/* Collapsible Fridge Inventory Drawer */}
      <InventoryDrawer
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        inventory={inventory}
        onAddItem={handleAddItemToInventory}
        onDeleteItem={handleDeleteItemFromInventory}
        onAutofillSearch={handleAutofillSearch}
      />

      {/* Weekly Meal Planner Drawer */}
      <PlannerDrawer
        isOpen={isPlannerOpen}
        onClose={() => setIsPlannerOpen(false)}
        recipes={recipes}
        favorites={favorites}
        mealPlan={mealPlan}
        onPlanMeal={handlePlanMeal}
        onUnplanMeal={handleUnplanMeal}
        onClearPlan={handleClearPlan}
        onGenerateShoppingList={handleGeneratePlannerList}
      />

      {/* Printable Sheet overlay */}
      {printData && (
        <div id="print-section" className="print-friendly print-only">
          {printData.type === 'recipe' && (
            <div className="print-recipe-page">
              <h1>{printData.data.name}</h1>
              <div className="print-meta-row">
                <span>⏱️ Prep: {printData.data.prepTime} mins</span>
                <span>🔥 Cook: {printData.data.cookTime} mins</span>
                <span>👥 Servings: {printData.data.servings}</span>
                <span>📈 Difficulty: {printData.data.difficulty}</span>
              </div>
              
              {printData.data.imageUrl && (
                <img src={printData.data.imageUrl} alt={printData.data.name} className="print-recipe-image" />
              )}
              
              <div className="print-section-block">
                <h3>🛒 Ingredients</h3>
                <ul>
                  {printData.data.ingredients.map((ing, idx) => (
                    <li key={idx}>
                      <span className="print-checkbox">☐</span> {ing}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="print-section-block">
                <h3>👨‍🍳 Instructions</h3>
                <ol>
                  {printData.data.instructions.map((step, idx) => (
                    <li key={idx}>
                      <span className="print-checkbox">☐</span> {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <p>© 2026 FlavorFind. Built with React and Vite.</p>
      </footer>
    </div>
  );
}
