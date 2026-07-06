// src/App.jsx
// Main application component coordinating layout, state, recipe searches, custom recipe form modal, and favorites.
// Connects to: src/components/*, src/services/recipeService.js, src/utils/logger.js
// Created: 2026-07-06

import React, { useState, useEffect, useCallback } from 'react';
import SearchFilters from './components/SearchFilters.jsx';
import RecipeList from './components/RecipeList.jsx';
import FavoritesList from './components/FavoritesList.jsx';
import RecipeForm from './components/RecipeForm.jsx';
import { 
  getRecipes, 
  searchRecipes, 
  getFavorites, 
  toggleFavorite, 
  addCustomRecipe, 
  deleteCustomRecipe 
} from './services/recipeService.js';
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
  
  // Notification Toast state
  const [toast, setToast] = useState(null);

  // Helper to trigger transient success/error messages
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load data (wrapped in useCallback to prevent re-creation)
  const loadData = useCallback(() => {
    logger.info('Refreshing application dataset');
    const allRecipes = getRecipes();
    setRecipes(allRecipes);
    setFavorites(getFavorites());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update filtered recipes when search parameters change
  useEffect(() => {
    const ingredients = searchQuery
      .split(',')
      .map(i => i.trim())
      .filter(i => i.length > 0);

    const filtered = searchRecipes(ingredients, activeFilters, strictSearch);
    setFilteredRecipes(filtered);
  }, [searchQuery, activeFilters, strictSearch, recipes]);

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
            </h2>
          </div>
          <RecipeList 
            recipes={filteredRecipes} 
            favorites={favorites} 
            onToggleFav={handleToggleFav} 
            onDelete={handleDeleteRecipe}
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
      />

      {/* Create Custom Recipe Modal Form */}
      <RecipeForm
        onSubmit={handleCreateRecipe}
        onClose={() => setIsFormOpen(false)}
        isOpen={isFormOpen}
      />

      {/* Footer */}
      <footer className="app-footer">
        <p>© 2026 FlavorFind. Built with React and Vite.</p>
      </footer>
    </div>
  );
}
