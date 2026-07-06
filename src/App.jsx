// src/App.jsx
// Main application component that coordinates layout, state, search filtering, and favorites.
// Connects to: src/components/SearchFilters.jsx, src/components/RecipeList.jsx, src/components/FavoritesList.jsx, src/services/recipeService.js, src/utils/logger.js
// Created: 2026-07-06

import React, { useState, useEffect } from 'react';
import SearchFilters from './components/SearchFilters.jsx';
import RecipeList from './components/RecipeList.jsx';
import FavoritesList from './components/FavoritesList.jsx';
import { getRecipes, searchRecipes, getFavorites, toggleFavorite } from './services/recipeService.js';
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

  // Load initial data
  useEffect(() => {
    logger.info('Initializing application data');
    const allRecipes = getRecipes();
    setRecipes(allRecipes);
    setFilteredRecipes(allRecipes);
    setFavorites(getFavorites());
  }, []);

  // Update filtered recipes when search parameters change
  useEffect(() => {
    const ingredients = searchQuery
      .split(',')
      .map(i => i.trim())
      .filter(i => i.length > 0);

    const filtered = searchRecipes(ingredients, activeFilters, strictSearch);
    setFilteredRecipes(filtered);
  }, [searchQuery, activeFilters, strictSearch]);

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

  return (
    <div className="app-container">
      {/* Header Bar */}
      <header className="app-header">
        <div className="header-logo">
          <span className="logo-emoji">🍳</span>
          <h1>FlavorFind</h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)} 
          className="open-favorites-btn"
          id="toggle-favorites-drawer"
        >
          ❤️ Saved ({favorites.length})
        </button>
      </header>

      {/* Hero Banner Section */}
      <section className="hero-banner">
        <div className="hero-content">
          <h2>Discover Delicious Recipes</h2>
          <p>Search by the ingredients in your kitchen and find matching meals instantly.</p>
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

      {/* Footer */}
      <footer className="app-footer">
        <p>© 2026 FlavorFind. Built with React and Vite.</p>
      </footer>
    </div>
  );
}
