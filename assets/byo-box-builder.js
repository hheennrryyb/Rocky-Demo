/**
 * BYO Box Builder JavaScript - Step 2 Enhanced Version
 * Advanced state management, validation engine, and user interactions
 */

class BYOBoxBuilder {
  constructor(sectionId) {
    this.sectionId = sectionId;
    this.section = document.getElementById(`BYOBox-${sectionId}`);
    
    if (!this.section) {
      console.warn(`BYO Box Builder section not found for ID: BYOBox-${sectionId}`);
      return;
    }

    // Check if we're on the product selection page
    this.isProductSelectionPage = this.section.querySelector('.byo-box-product-selection') !== null;

    // Enhanced state management
    this.state = {
      selectedProducts: new Map(), // categoryId -> Map(productId -> {quantity, price, title, image})
      categoryLimits: new Map(),   // categoryId -> {min, max, current, allowDuplicates, isOptional}
      boxConfiguration: null,      // Current box configuration
      totalPrice: 0,
      boxFee: 0,
      isValid: false,
      validationErrors: new Map(), // categoryId -> error message
      selectionHistory: [],        // For undo functionality
      isDirty: false              // Track if user has made changes
    };

    // Configuration
    this.config = {
      animationDuration: 300,
      debounceDelay: 100,
      maxUndoHistory: 10
    };

    this.init();
  }

  init() {
    try {
      // Initialize immediately but show loading during setup
      this.showContent();
      this.checkForURLParameter();
      this.loadBoxConfiguration();
      this.setupEventListeners();
      this.loadCategoryLimits();
      this.initializeValidationEngine();
      this.setupProgressTracking();
      this.updateAllUI();

      console.log('BYO Box Builder Enhanced (Step 2) initialized for section:', this.sectionId);
    } catch (error) {
      console.error('Error during BYO Box Builder initialization:', error);
      this.showContent(); // Show content even on error
      throw error;
    }
  }

  showContent() {
    const sectionId = this.sectionId.replace('BYOBox-', '');
    const loadingEl = this.section.querySelector(`#byo-box-loading-${sectionId}`);
    const contentEl = this.section.querySelector(`#byo-box-content-${sectionId}`);
    
    if (loadingEl) loadingEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'block';
  }

  checkForURLParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedBoxName = urlParams.get('selected_box');
    
    console.log('DEBUG: URL parameter selected_box =', selectedBoxName);
    
    if (selectedBoxName) {
      this.showProductSelection(selectedBoxName);
    } else {
      // Show box selection page
      this.showBoxSelection();
    }
  }

  showBoxSelection() {
    const sectionId = this.sectionId.replace('BYOBox-', '');
    const page1El = this.section.querySelector(`#byo-box-page-1-${sectionId}`);
    const page2El = this.section.querySelector('.byo-box-product-selection');
    
    if (page1El) page1El.style.display = 'grid';
    if (page2El) page2El.style.display = 'none';
    this.isProductSelectionPage = false;
  }

  showProductSelection(boxName) {
    const sectionId = this.sectionId.replace('BYOBox-', '');
    const page1El = this.section.querySelector(`#byo-box-page-1-${sectionId}`);
    const page2El = this.section.querySelector('.byo-box-product-selection');
    
    // Switch pages
    if (page1El) page1El.style.display = 'none';
    if (page2El) page2El.style.display = 'block';
    this.isProductSelectionPage = true;

    // Load box configuration
    const boxConfigData = this.section.querySelector(`[data-box-name="${boxName}"]`);
    if (boxConfigData) {
      this.loadSelectedBoxData(boxConfigData);
      this.showSelectedBoxCategories(boxConfigData);
      // Clear and reload categories for this specific box
      this.clearCategoryLimits();
      this.loadCategoryLimits();
    } else {
      console.error('Box configuration not found:', boxName);
    }
  }

  loadSelectedBoxData(boxConfigData) {
    const boxName = boxConfigData.dataset.boxName;
    const boxDescription = boxConfigData.dataset.boxDescription;
    const boxFee = parseFloat(boxConfigData.dataset.boxFee) || 0;
    const boxImage = boxConfigData.dataset.boxImage;

    // Update selected box info
    const titleEl = this.section.querySelector('.byo-box-selected-title');
    const descriptionEl = this.section.querySelector('.byo-box-selected-description');
    const feeEl = this.section.querySelector('.byo-box-fee-amount');
    const imageEl = this.section.querySelector('.byo-box-selected-image');

    if (titleEl) titleEl.textContent = boxName;
    if (descriptionEl) descriptionEl.textContent = boxDescription;
    if (feeEl) feeEl.textContent = boxFee.toFixed(2);
    
    if (imageEl && boxImage && boxImage !== 'null') {
      imageEl.src = boxImage;
      imageEl.alt = boxName;
      imageEl.style.display = 'block';
    }

    // Update state
    this.state.boxConfiguration = {
      name: boxName,
      fee: boxFee
    };
    this.state.boxFee = boxFee;

    console.log('DEBUG: Loaded box configuration:', this.state.boxConfiguration);
  }

  showSelectedBoxCategories(boxConfigData) {
    const mainCategoriesContainer = this.section.querySelector('.byo-box-product-selection .byo-box-categories');
    if (!mainCategoriesContainer) {
      console.error('Main categories container not found');
      return;
    }

    // Clear all existing categories from the main container
    console.log('DEBUG: Clearing existing categories from main container');
    mainCategoriesContainer.innerHTML = '';

    // Get categories for the selected box and add them to the main container
    const categoryDataElements = boxConfigData.querySelectorAll('.byo-box-category-data');
    console.log(`DEBUG: Found ${categoryDataElements.length} category data elements for selected box`);
    
    categoryDataElements.forEach((categoryData, index) => {
      const categorySection = categoryData.querySelector('.byo-box-category-section');
      if (categorySection) {
        // Clone the category section to maintain original structure
        const clonedCategorySection = categorySection.cloneNode(true);
        
        // Ensure the cloned section is visible and properly styled
        clonedCategorySection.style.display = 'block';
        clonedCategorySection.style.visibility = 'visible';
        
        // Add to main container
        mainCategoriesContainer.appendChild(clonedCategorySection);
        
        console.log(`DEBUG: Added category ${index + 1} (${categorySection.dataset.categoryId}) to main container`);
      } else {
        console.log(`DEBUG: No category section found in category data element ${index + 1}`);
      }
    });

    console.log(`DEBUG: Successfully populated main container with ${mainCategoriesContainer.children.length} categories`);
  }

  loadBoxConfiguration() {
    // Extract box configuration from DOM for better state management
    const boxNameEl = this.section.querySelector('.byo-box-summary-title');
    const boxFeeEl = this.section.querySelector('.byo-box-fee, [class*="box-fee"]');
    
    if (boxNameEl) {
      this.state.boxConfiguration = {
        name: boxNameEl.textContent?.trim() || '',
        fee: this.extractBoxFee(boxFeeEl?.textContent || '0')
      };
      this.state.boxFee = this.state.boxConfiguration.fee;
    }
  }

  setupEventListeners() {
    // Enhanced event delegation with better performance
    this.section.addEventListener('click', this.handleClick.bind(this));
    this.section.addEventListener('keydown', this.handleKeydown.bind(this));
    
    // Add visual feedback for interactions
    this.section.addEventListener('mouseenter', this.handleMouseEnter.bind(this), true);
    this.section.addEventListener('mouseleave', this.handleMouseLeave.bind(this), true);

    // Add window events for cleanup and state persistence
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    
    // Debounced resize handler for responsive updates
    this.debouncedResize = this.debounce(this.handleResize.bind(this), 250);
    window.addEventListener('resize', this.debouncedResize);
  }

  handleClick(e) {
    // Box selection button handling
    const boxSelectionBtn = e.target.closest('.byo-box-card-button');
    if (boxSelectionBtn) {
      e.preventDefault();
      this.handleBoxSelection(boxSelectionBtn);
      return;
    }

    // Quantity button handling
    const qtyBtn = e.target.closest('.byo-box-qty-btn');
    if (qtyBtn) {
      e.preventDefault();
      this.handleQuantityChange(qtyBtn);
      return;
    }

    // Add to cart button
    const addToCartBtn = e.target.closest('.byo-box-add-to-cart-btn');
    if (addToCartBtn && !addToCartBtn.disabled) {
      e.preventDefault();
      this.handleAddToCart();
      return;
    }

    // Product card selection (for accessibility)
    const productCard = e.target.closest('.byo-box-product-card');
    if (productCard && !e.target.closest('.byo-box-qty-btn')) {
      this.handleProductCardClick(productCard);
      return;
    }
  }

  handleKeydown(e) {
    // Keyboard accessibility for quantity controls
    if (e.target.matches('.byo-box-qty-btn')) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleQuantityChange(e.target);
      }
    }

    // Keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'z':
          if (this.state.selectionHistory.length > 0) {
            e.preventDefault();
            this.undoLastSelection();
          }
          break;
      }
    }
  }

  handleMouseEnter(e) {
    const productCard = e.target.closest('.byo-box-product-card');
    if (productCard) {
      this.showProductPreview(productCard);
    }
  }

  handleMouseLeave(e) {
    const productCard = e.target.closest('.byo-box-product-card');
    if (productCard) {
      this.hideProductPreview(productCard);
    }
  }

    loadCategoryLimits() {
    // Only load categories that are currently visible (not hidden)
    const categoryElements = this.section.querySelectorAll('.byo-box-category-section:not([style*="display: none"])');

    console.log('categoryElements (visible only):', categoryElements);
    
    if (categoryElements.length === 0) {
      console.log('No visible category sections found - likely on box selection page');
      return;
    }
    
    categoryElements.forEach(categoryEl => {
      const categoryId = categoryEl.dataset.categoryId;
      const counterEl = categoryEl.querySelector('.byo-box-category-counter .min-max-display');
      const titleEl = categoryEl.querySelector('.byo-box-category-title h4');
      const optionalEl = categoryEl.querySelector('.byo-box-category-optional');
      
      console.log(`DEBUG: Processing category element:`, {
        categoryId,
        hasCounter: !!counterEl,
        counterText: counterEl?.textContent,
        title: titleEl?.textContent?.trim(),
        hasOptional: !!optionalEl
      });
      
      if (counterEl && categoryId) {
        const { min, max } = this.parseMinMaxConstraints(counterEl.textContent);
        const isOptional = optionalEl !== null || min === 0;
        
        const categoryData = {
          min,
          max,
          current: 0,
          allowDuplicates: true, // Will be updated per product
          isOptional,
          name: titleEl?.textContent?.trim() || categoryId
        };
        
        console.log(`DEBUG: Adding category ${categoryId}:`, categoryData);
        
        this.state.categoryLimits.set(categoryId, categoryData);
        this.state.selectedProducts.set(categoryId, new Map());
        this.state.validationErrors.set(categoryId, null);
      } else {
        console.log(`DEBUG: Skipping category - missing counter or ID:`, { categoryId, hasCounter: !!counterEl });
      }
    });
    
    console.log(`Loaded ${this.state.categoryLimits.size} categories`);
  }

  clearCategoryLimits() {
    console.log('DEBUG: Clearing category limits');
    this.state.categoryLimits.clear();
    this.state.selectedProducts.clear();
    this.state.validationErrors.clear();
  }

  parseMinMaxConstraints(text) {
    let min = 0, max = 1;
    
    if (text.includes('(min:')) {
      const matches = text.match(/min:\s*(\d+).*?max:\s*(\d+)/);
      if (matches) {
        min = parseInt(matches[1]);
        max = parseInt(matches[2]);
      }
    } else if (text.includes('/')) {
      const parts = text.split('/')[1].trim();
      const num = parseInt(parts);
      if (!isNaN(num)) {
        min = max = num; // Exact number required
      }
    }
    
    return { min, max };
  }

  initializeValidationEngine() {
    // Set up validation rules and error messages
    this.validationRules = {
      categoryMinimum: (categoryId) => {
        const limits = this.state.categoryLimits.get(categoryId);
        return limits.current >= limits.min;
      },
      categoryMaximum: (categoryId) => {
        const limits = this.state.categoryLimits.get(categoryId);
        return limits.current <= limits.max;
      },
      duplicateProducts: (categoryId, productId) => {
        const categoryProducts = this.state.selectedProducts.get(categoryId);
        const productData = categoryProducts?.get(productId);
        const allowDuplicates = this.getCategoryAllowDuplicates(categoryId);
        
        return allowDuplicates || !productData || productData.quantity <= 1;
      },
      overallCompletion: () => {
        console.log('DEBUG: Overall completion check');
        console.log('DEBUG: Category limits:', this.state.categoryLimits);
        
        // Check if we have any categories loaded
        if (this.state.categoryLimits.size === 0) {
          console.log('DEBUG: No categories loaded, validation fails');
          return false;
        }
        
        // Check each category
        const results = Array.from(this.state.categoryLimits.entries()).map(([categoryId, limits]) => {
          const isValid = limits.isOptional || limits.current >= limits.min;
          console.log(`DEBUG: Category ${categoryId} (${limits.name}): current=${limits.current}, min=${limits.min}, optional=${limits.isOptional}, valid=${isValid}`);
          return { categoryId, isValid, limits };
        });
        
        const allValid = results.every(result => result.isValid);
        console.log('DEBUG: Overall validation result:', allValid);
        
        return allValid;
      }
    };

    this.errorMessages = {
      categoryMinimum: (categoryName, min) => `Please select at least ${min} ${categoryName.toLowerCase()}`,
      categoryMaximum: (categoryName, max) => `Cannot select more than ${max} ${categoryName.toLowerCase()}`,
      duplicateProducts: (productName) => `Duplicates not allowed for ${productName}`,
      overallIncomplete: 'Please complete all required categories'
    };
  }

  setupProgressTracking() {
    // Enhanced progress tracking with animations
    this.progressAnimations = new Map();
    
    // Initialize progress bars only if we have categories
    if (this.state.categoryLimits.size > 0) {
      this.state.categoryLimits.forEach((limits, categoryId) => {
        this.updateCategoryProgress(categoryId, true); // Initialize with animation
      });
    }
  }

  handleQuantityChange(button) {
    const action = button.dataset.action;
    const productCard = button.closest('.byo-box-product-card');
    
    if (!productCard) return;

    const productId = productCard.dataset.productId;
    const variantId = productCard.dataset.variantId;
    const categoryId = productCard.dataset.categoryId;
    const allowDuplicates = productCard.dataset.allowDuplicates === 'true';
    
    // Save current state for undo functionality
    this.saveStateToHistory();
    
    const result = this.updateProductQuantity(productId, variantId, categoryId, action, allowDuplicates, productCard);
    
    if (result.success) {
      this.state.isDirty = true;
      this.updateProductCard(productCard, result.newQuantity);
      this.updateCategoryProgress(categoryId);
      this.validateCategory(categoryId);
      this.updateSummary();
      this.announceChange(result.announcement);
    } else {
      this.showValidationError(categoryId, result.error);
    }
  }

  updateProductQuantity(productId, variantId, categoryId, action, allowDuplicates, productCard) {
    const qtyDisplay = productCard.querySelector('.byo-box-qty-display');
    const priceEl = productCard.querySelector('.byo-box-product-price');
    const titleEl = productCard.querySelector('.byo-box-product-title');
    const imageEl = productCard.querySelector('.byo-box-product-image img');
    
    if (!qtyDisplay) return { success: false, error: 'Invalid product card' };

    let currentQty = parseInt(qtyDisplay.dataset.quantity) || 0;
    const categoryProducts = this.state.selectedProducts.get(categoryId);
    const categoryLimits = this.state.categoryLimits.get(categoryId);
    
    if (!categoryProducts || !categoryLimits) {
      return { success: false, error: 'Category not found' };
    }

    // Calculate new quantity with enhanced validation
    let newQty = currentQty;
    let error = null;

    if (action === 'increase') {
      // Check category maximum
      if (categoryLimits.current >= categoryLimits.max) {
        error = this.errorMessages.categoryMaximum(categoryLimits.name, categoryLimits.max);
      }
      // Check duplicates
      else if (!allowDuplicates && currentQty > 0) {
        error = this.errorMessages.duplicateProducts(titleEl?.textContent || 'this product');
      }
      else {
        newQty = currentQty + 1;
      }
    } else if (action === 'decrease' && currentQty > 0) {
      newQty = currentQty - 1;
    }

    if (error) {
      return { success: false, error };
    }

    // Update state
    const qtyDiff = newQty - currentQty;
    if (qtyDiff !== 0) {
      if (newQty === 0) {
        categoryProducts.delete(productId);
      } else {
        const productPrice = this.parsePrice(priceEl?.textContent || '0');
        categoryProducts.set(productId, {
          quantity: newQty,
          price: productPrice,
          title: titleEl?.textContent?.trim() || '',
          image: imageEl?.src || '',
          productId: productId,
          variantId: variantId
        });
      }

      categoryLimits.current += qtyDiff;

      const announcement = this.createQuantityAnnouncement(
        titleEl?.textContent || 'Product', 
        newQty, 
        action
      );

      return { 
        success: true, 
        newQuantity: newQty, 
        quantityDiff: qtyDiff,
        announcement 
      };
    }

    return { success: false, error: 'No change in quantity' };
  }

  updateProductCard(productCard, quantity) {
    const qtyDisplay = productCard.querySelector('.byo-box-qty-display');
    const decreaseBtn = productCard.querySelector('.byo-box-qty-btn.decrease');
    const increaseBtn = productCard.querySelector('.byo-box-qty-btn.increase');
    
    // Animate quantity change
    this.animateQuantityChange(qtyDisplay, quantity);
    
    qtyDisplay.textContent = quantity;
    qtyDisplay.dataset.quantity = quantity;
    
    decreaseBtn.disabled = quantity === 0;
    
    // Enhanced visual feedback
    if (quantity > 0) {
      productCard.classList.add('selected');
      this.addSelectionRipple(productCard);
    } else {
      productCard.classList.remove('selected');
    }

    // Update button states with category limits
    const categoryId = productCard.dataset.categoryId;
    const categoryLimits = this.state.categoryLimits.get(categoryId);
    const allowDuplicates = productCard.dataset.allowDuplicates === 'true';
    
    if (categoryLimits) {
      console.log('DEBUG: Category limits:', categoryLimits);
      increaseBtn.disabled = 
        categoryLimits.current >= categoryLimits.max || 
        (!allowDuplicates && quantity > 0);
    }
  }

  validateCategory(categoryId) {
    const limits = this.state.categoryLimits.get(categoryId);
    if (!limits) {
      console.log(`DEBUG: Category ${categoryId} not found in limits`);
      return;
    }

    let error = null;

    console.log(`DEBUG: Validating category ${categoryId}: current=${limits.current}, min=${limits.min}, max=${limits.max}, optional=${limits.isOptional}, dirty=${this.state.isDirty}`);

    // Check minimum requirement (only show error if not optional and user has started selecting)
    if (!limits.isOptional && limits.current < limits.min && this.state.isDirty) {
      error = this.errorMessages.categoryMinimum(limits.name, limits.min);
      console.log(`DEBUG: Category ${categoryId} minimum error:`, error);
    }
    // Check maximum constraint
    else if (limits.current > limits.max) {
      error = this.errorMessages.categoryMaximum(limits.name, limits.max);
      console.log(`DEBUG: Category ${categoryId} maximum error:`, error);
    } else {
      console.log(`DEBUG: Category ${categoryId} validation passed`);
    }

    this.state.validationErrors.set(categoryId, error);
    this.displayCategoryValidation(categoryId, error);
  }

  displayCategoryValidation(categoryId, error) {
    const categoryEl = this.section.querySelector(`[data-category-id="${categoryId}"]`);
    if (!categoryEl) return;

    let errorEl = categoryEl.querySelector('.byo-box-category-error');
    
    if (error) {
      if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'byo-box-category-error';
        const headerEl = categoryEl.querySelector('.byo-box-category-header');
        if (headerEl) {
          headerEl.appendChild(errorEl);
        }
      }
      errorEl.textContent = error;
      errorEl.style.display = 'block';
      categoryEl.classList.add('has-error');
    } else {
      if (errorEl) {
        errorEl.style.display = 'none';
      }
      categoryEl.classList.remove('has-error');
    }
  }

  updateCategoryProgress(categoryId, animate = true) {
    const categoryEl = this.section.querySelector(`[data-category-id="${categoryId}"]`);
    const limits = this.state.categoryLimits.get(categoryId);
    
    console.log(`DEBUG: updateCategoryProgress - categoryId: ${categoryId}, categoryEl:`, categoryEl, 'limits:', limits);
    
    if (!categoryEl || !limits) {
      console.log(`DEBUG: Missing categoryEl or limits for ${categoryId}`);
      return;
    }

    // Update counter in category header
    const currentCountEl = categoryEl.querySelector('.current-count');
    if (currentCountEl) {
      currentCountEl.textContent = limits.current;
      console.log(`DEBUG: Updated counter for ${categoryId}: ${limits.current}`);
    } else {
      console.log(`DEBUG: No .current-count element found for ${categoryId}`);
    }

    // Update progress bar - use specific data attribute selector
    const progressFill = categoryEl.querySelector(`[data-progress-category="${categoryId}"]`);
    console.log(`DEBUG: Progress fill element for ${categoryId}:`, progressFill);
    
    if (!progressFill) {
      console.log(`DEBUG: No progress fill found with data-progress-category="${categoryId}"`);
      // Fallback to generic selector within this category
      const fallbackProgressFill = categoryEl.querySelector('.progress-fill');
      console.log(`DEBUG: Fallback progress fill:`, fallbackProgressFill);
      if (fallbackProgressFill) {
        // Add the data attribute for future use
        fallbackProgressFill.setAttribute('data-progress-category', categoryId);
        console.log(`DEBUG: Added data-progress-category="${categoryId}" to fallback element`);
      }
    }
    
    // Get the correct progress fill element (either found by data attribute or fallback)
    const targetProgressFill = progressFill || categoryEl.querySelector('.progress-fill');
    
    if (targetProgressFill) {
      // Simple progress calculation: current / max * 100
      const progressPercent = limits.max > 0 ? Math.min((limits.current / limits.max) * 100, 100) : 0;
      
      console.log(`DEBUG: Progress calculation for ${categoryId}: ${limits.current}/${limits.max} = ${progressPercent}%`);
      
      // Set width and ensure visibility
      targetProgressFill.style.width = `${progressPercent}%`;
      targetProgressFill.style.display = 'block';
      targetProgressFill.style.height = '100%';
      
      console.log(`DEBUG: Applied styles to progress fill:`, {
        width: targetProgressFill.style.width,
        display: targetProgressFill.style.display,
        height: targetProgressFill.style.height,
        backgroundColor: targetProgressFill.style.backgroundColor
      });
      
      // Simple color update
      this.updateProgressBarColor(targetProgressFill, limits);
    } else {
      console.log(`DEBUG: No progress-fill element found for ${categoryId}`);
    }

    // Update summary bar category count
    const summaryCategory = this.section.querySelector(`.byo-box-summary-category[data-category-id="${categoryId}"] .current`);
    if (summaryCategory) {
      summaryCategory.textContent = limits.current;
    }
  }

  updateProgressBarColor(progressFill, limits) {
    // Simple color logic based on completion status
    if (limits.current < limits.min) {
      // Not meeting minimum - red
      progressFill.style.backgroundColor = '#dc3545';
    } else if (limits.current >= limits.min && limits.current <= limits.max) {
      // Meeting requirements - green
      progressFill.style.backgroundColor = '#28a745';
    } else {
      // Over maximum - orange (shouldn't happen with proper validation)
      progressFill.style.backgroundColor = '#fd7e14';
    }
    
    console.log(`DEBUG: Progress bar color for current=${limits.current}, min=${limits.min}, max=${limits.max}: ${progressFill.style.backgroundColor}`);
  }

  updateSummary() {
    this.calculatePricing();
    this.updatePricingDisplay();
    this.updateSelectedProductsPreview();
    this.updateAddToCartButton();
  }

  calculatePricing() {
    let totalProductPrice = 0;

    this.state.selectedProducts.forEach(categoryProducts => {
      categoryProducts.forEach(product => {
        totalProductPrice += product.price * product.quantity;
      });
    });

    this.state.totalPrice = totalProductPrice + this.state.boxFee;
  }

  updatePricingDisplay() {
    const productsTotalEl = this.section.querySelector('.products-total');
    const totalPriceEl = this.section.querySelector('.total-price');
    
    const productsTotal = this.state.totalPrice - this.state.boxFee;
    
    if (productsTotalEl) {
      this.animateNumberChange(productsTotalEl, productsTotal, true);
    }
    if (totalPriceEl) {
      this.animateNumberChange(totalPriceEl, this.state.totalPrice, true);
    }
  }

  updateSelectedProductsPreview() {
    const previewContainer = this.section.querySelector('.byo-box-summary-products-scroll');
    if (!previewContainer) return;

    // Clear existing previews
    previewContainer.innerHTML = '';

    let hasProducts = false;

    // Add product thumbnails
    this.state.selectedProducts.forEach(categoryProducts => {
      categoryProducts.forEach(product => {
        if (product.quantity > 0) {
          hasProducts = true;
          const thumbEl = this.createProductThumbnail(product);
          previewContainer.appendChild(thumbEl);
        }
      });
    });

    // Show empty state if no products
    if (!hasProducts) {
      const emptyEl = document.createElement('div');
      emptyEl.className = 'byo-box-summary-empty';
      emptyEl.innerHTML = '<span>No products selected</span>';
      previewContainer.appendChild(emptyEl);
    }
  }

  createProductThumbnail(product) {
    const thumbEl = document.createElement('div');
    thumbEl.className = 'byo-box-summary-product-thumb';
    thumbEl.innerHTML = `
      <img src="${product.image}" alt="${product.title}" width="40" height="40">
      <span class="byo-box-summary-product-qty">${product.quantity}</span>
    `;
    return thumbEl;
  }

  updateAddToCartButton() {
    const addToCartBtn = this.section.querySelector('.byo-box-add-to-cart-btn');
    const btnText = addToCartBtn?.querySelector('.btn-text');
    const btnReady = addToCartBtn?.querySelector('.btn-ready');
    
    if (!addToCartBtn) return;

    // Check if all requirements are met
    const isValid = this.validationRules.overallCompletion();
    this.state.isValid = isValid;

    if (isValid) {
      addToCartBtn.disabled = false;
      addToCartBtn.classList.add('ready');
      if (btnText) btnText.style.display = 'none';
      if (btnReady) btnReady.style.display = 'inline';
    } else {
      addToCartBtn.disabled = true;
      addToCartBtn.classList.remove('ready');
      if (btnText) btnText.style.display = 'inline';
      if (btnReady) btnReady.style.display = 'none';
    }
  }



  calculateOverallProgress() {
    let totalProgress = 0;
    let requiredCategoryCount = 0;

    this.state.categoryLimits.forEach(limits => {
      if (!limits.isOptional) {
        const categoryProgress = Math.min((limits.current / limits.min) * 100, 100);
        totalProgress += categoryProgress;
        requiredCategoryCount++;
      }
    });

    return requiredCategoryCount > 0 ? totalProgress / requiredCategoryCount : 100;
  }

  // Animation Methods
  animateQuantityChange(element, newValue) {
    element.style.transform = 'scale(1.2)';
    element.style.color = 'rgb(var(--color-button))';
    
    setTimeout(() => {
      element.textContent = newValue;
      element.style.transform = 'scale(1)';
      element.style.color = '';
    }, 150);
  }

  animateNumberChange(element, newValue, isCurrency = false) {
    const currentValue = parseFloat(element.textContent.replace(/[^0-9.]/g, '')) || 0;
    const increment = (newValue - currentValue) / 10;
    let current = currentValue;
    let step = 0;

    const animate = () => {
      step++;
      current += increment;
      
      const displayValue = isCurrency 
        ? `$${Math.abs(current).toFixed(2)}` 
        : Math.round(current).toString();
      
      element.textContent = displayValue;
      
      if (step < 10) {
        requestAnimationFrame(animate);
      } else {
        const finalValue = isCurrency 
          ? `$${Math.abs(newValue).toFixed(2)}` 
          : newValue.toString();
        element.textContent = finalValue;
      }
    };

    if (Math.abs(newValue - currentValue) > 0.01) {
      requestAnimationFrame(animate);
    }
  }

  animateProgressBar(progressFill, targetPercent) {
    const currentPercent = parseFloat(progressFill.style.width) || 0;
    const increment = (targetPercent - currentPercent) / 20;
    let current = currentPercent;
    let step = 0;

    const animate = () => {
      step++;
      current += increment;
      progressFill.style.width = `${current}%`;
      
      if (step < 20) {
        requestAnimationFrame(animate);
      } else {
        progressFill.style.width = `${targetPercent}%`;
      }
    };

    if (Math.abs(targetPercent - currentPercent) > 0.1) {
      requestAnimationFrame(animate);
    }
  }

  addSelectionRipple(element) {
    const ripple = document.createElement('div');
    ripple.className = 'selection-ripple';
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  // Utility Methods
  saveStateToHistory() {
    const stateSnapshot = {
      selectedProducts: new Map(this.state.selectedProducts),
      categoryLimits: new Map(this.state.categoryLimits),
      timestamp: Date.now()
    };
    
    this.state.selectionHistory.push(stateSnapshot);
    
    if (this.state.selectionHistory.length > this.config.maxUndoHistory) {
      this.state.selectionHistory.shift();
    }
  }

  undoLastSelection() {
    if (this.state.selectionHistory.length === 0) return;
    
    const previousState = this.state.selectionHistory.pop();
    this.state.selectedProducts = previousState.selectedProducts;
    this.state.categoryLimits = previousState.categoryLimits;
    
    this.updateAllUI();
    this.announceChange('Last selection undone');
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  getCategoryAllowDuplicates(categoryId) {
    // Check if duplicates are allowed for this category
    const categoryEl = this.section.querySelector(`[data-category-id="${categoryId}"]`);
    const firstProduct = categoryEl?.querySelector('.byo-box-product-card');
    return firstProduct?.dataset.allowDuplicates === 'true';
  }

  extractBoxFee(text) {
    const match = text.match(/\$?([0-9.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  parsePrice(priceText) {
    const match = priceText.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  createQuantityAnnouncement(productTitle, quantity, action) {
    if (action === 'increase') {
      return `Added ${productTitle}. Current quantity: ${quantity}`;
    } else {
      return quantity === 0 
        ? `Removed ${productTitle}` 
        : `Decreased ${productTitle}. Current quantity: ${quantity}`;
    }
  }

  announceChange(message) {
    // Accessibility announcement
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }

  showValidationError(categoryId, error) {
    this.displayCategoryValidation(categoryId, error);
    
    // Clear error after delay
    setTimeout(() => {
      this.state.validationErrors.set(categoryId, null);
      this.displayCategoryValidation(categoryId, null);
    }, 3000);
  }

  updateAllUI() {
    // Only update product selection UI if we're on that page
    if (!this.isProductSelectionPage) {
      console.log('On box selection page, skipping product UI updates');
      return;
    }

    // Comprehensive UI update for product selection page
    this.state.categoryLimits.forEach((limits, categoryId) => {
      console.log('DEBUG: Updating category progress for:', categoryId);
      this.updateCategoryProgress(categoryId);
      this.validateCategory(categoryId);
    });
    
    // Update all product cards
    this.section.querySelectorAll('.byo-box-product-card').forEach(card => {
      const productId = card.dataset.productId;
      const categoryId = card.dataset.categoryId;
      const categoryProducts = this.state.selectedProducts.get(categoryId);
      const productData = categoryProducts?.get(productId);
      const quantity = productData?.quantity || 0;
      
      this.updateProductCard(card, quantity);
    });
    
    this.updateSummary();
  }

  handleProductCardClick(productCard) {
    // Alternative way to select products for accessibility
    const increaseBtn = productCard.querySelector('.byo-box-qty-btn.increase');
    if (increaseBtn && !increaseBtn.disabled) {
      this.handleQuantityChange(increaseBtn);
    }
  }

  showProductPreview(productCard) {
    // Enhanced product preview on hover
    productCard.style.transform = 'translateY(-2px)';
    productCard.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  }

  hideProductPreview(productCard) {
    productCard.style.transform = '';
    productCard.style.boxShadow = '';
  }

  handleBoxSelection(button) {
    const boxId = button.dataset.boxId;
    console.log('DEBUG: Box selection clicked, boxId =', boxId);
    
    if (!boxId) {
      console.error('No box ID found on button');
      return;
    }

    // Add loading state to button
    const originalText = button.innerHTML;
    button.innerHTML = 'Loading...';
    button.disabled = true;

    try {
      // Navigate to product selection page with URL parameter
      const currentUrl = new URL(window.location);
      currentUrl.searchParams.set('selected_box', boxId); // Don't double-encode
      
      console.log('DEBUG: Box ID being set:', boxId);
      console.log('DEBUG: Navigating to URL:', currentUrl.toString());
      
      // Use a small delay to show loading state
      setTimeout(() => {
        window.location.href = currentUrl.toString();
      }, 300);
    } catch (error) {
      console.error('Error navigating to product selection:', error);
      // Restore button state on error
      button.innerHTML = originalText;
      button.disabled = false;
      alert('Sorry, there was an error loading the product selection. Please try again.');
    }
  }

  handleAddToCart() {
    if (!this.state.isValid) {
      this.announceChange('Please complete all required selections before adding to cart');
      return;
    }

    // Show loading state
    const addToCartBtn = this.section.querySelector('.byo-box-add-to-cart-btn');
    if (addToCartBtn) {
      addToCartBtn.disabled = true;
      addToCartBtn.innerHTML = 'Adding to Cart...';
    }

    // Add individual products to cart (Shopify Ajax API doesn't support custom pricing)
    const itemsToAdd = [];
    const bundleContents = [];
    let bundleTitle = this.state.boxConfiguration?.name || 'Custom Box';
    
    // Add the BYO Box product first (this will show as $1 in cart)
    itemsToAdd.push({
      id: '42153738141780', // BYO Box variant ID
      quantity: 1,
      properties: {
        '_bundle_main': 'true',
        '_bundle_title': bundleTitle,
        '_bundle_type': 'byo_custom_box',
        '_created_at': new Date().toISOString(),
        '_custom_bundle': 'true'
      }
    });
    
    // Add each selected product individually
    this.state.selectedProducts.forEach(categoryProducts => {
      categoryProducts.forEach(product => {
        if (product.quantity > 0 && product.variantId) {
          bundleContents.push({
            title: product.title,
            quantity: product.quantity,
            variantId: product.variantId,
            price: product.price
          });
          
          // Add each product to cart with bundle reference
          itemsToAdd.push({
            id: product.variantId,
            quantity: product.quantity,
            properties: {
              '_bundle_component': 'true',
              '_bundle_title': bundleTitle,
              '_bundle_type': 'byo_custom_box',
              '_parent_bundle': '42153738141780',
              '_custom_bundle': 'true'
            }
          });
        } else if (product.quantity > 0 && !product.variantId) {
          console.error('Missing variant ID for product:', product.title);
        }
      });
    });

    if (itemsToAdd.length === 0) {
      this.announceChange('No products selected');
      this.restoreAddToCartButton();
      return;
    }

    // Add items to cart using Shopify Ajax API
    this.addItemsToCart(itemsToAdd)
      .then(() => {
        this.announceChange('Items added to cart successfully');
        // Clear dirty state since items were successfully added to cart
        this.state.isDirty = false;
        // Redirect to cart page
        window.location.href = '/cart';
      })
      .catch(error => {
        console.error('Error adding items to cart:', error);
        this.announceChange('Error adding items to cart. Please try again.');
        this.restoreAddToCartButton();
        alert('Sorry, there was an error adding items to your cart. Please try again.');
      });
  }

  async addItemsToCart(items) {
    try {
      // Use Shopify's Ajax API to add items to cart
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          items: items
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add items to cart');
      }

      return await response.json();
    } catch (error) {
      console.error('Cart API error:', error);
      throw error;
    }
  }

  restoreAddToCartButton() {
    const addToCartBtn = this.section.querySelector('.byo-box-add-to-cart-btn');
    if (addToCartBtn) {
      addToCartBtn.disabled = false;
      const btnText = addToCartBtn.querySelector('.btn-text');
      const btnReady = addToCartBtn.querySelector('.btn-ready');
      
      if (this.state.isValid) {
        addToCartBtn.classList.add('ready');
        if (btnText) btnText.style.display = 'none';
        if (btnReady) btnReady.style.display = 'inline';
      } else {
        addToCartBtn.classList.remove('ready');
        if (btnText) btnText.style.display = 'inline';
        if (btnReady) btnReady.style.display = 'none';
      }
    }
  }

  handleBeforeUnload(e) {
    if (this.state.isDirty) {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      return e.returnValue;
    }
  }

  handleResize() {
    // Handle responsive updates
    this.updateAllUI();
  }

  // Public API for external integration
  getState() {
    return {
      selectedProducts: this.state.selectedProducts,
      totalPrice: this.state.totalPrice,
      isValid: this.state.isValid,
      boxConfiguration: this.state.boxConfiguration
    };
  }

  reset() {
    this.state.selectedProducts.clear();
    this.state.categoryLimits.forEach(limits => {
      limits.current = 0;
    });
    this.state.validationErrors.clear();
    this.state.selectionHistory = [];
    this.state.isDirty = false;
    this.updateAllUI();
  }

  // Static method for back navigation
  static goBackToSelection() {
    try {
      const currentUrl = new URL(window.location);
      currentUrl.searchParams.delete('selected_box');
      console.log('Navigating back to box selection:', currentUrl.toString());
      window.location.href = currentUrl.toString();
    } catch (error) {
      console.error('Error navigating back to selection:', error);
      // Fallback to page reload
      window.location.reload();
    }
  }
}

// Enhanced initialization with error handling
document.addEventListener('DOMContentLoaded', () => {
  const byoBoxSections = document.querySelectorAll('.byo-box-builder[data-section-id]');
  
  byoBoxSections.forEach(section => {
    try {
      const sectionId = section.dataset.sectionId;
      const builder = new BYOBoxBuilder(sectionId);
      
      // Store reference for external access
      section.byoBoxBuilder = builder;
    } catch (error) {
      console.error('Failed to initialize BYO Box Builder:', error);
    }
  });
});

// Enhanced Shopify theme editor support
if (typeof window.Shopify !== 'undefined' && window.Shopify.designMode) {
  document.addEventListener('shopify:section:load', (event) => {
    if (event.detail.sectionId) {
      const section = document.querySelector(`#BYOBox-${event.detail.sectionId}`);
      if (section) {
        try {
          const builder = new BYOBoxBuilder(event.detail.sectionId);
          section.byoBoxBuilder = builder;
        } catch (error) {
          console.error('Failed to initialize BYO Box Builder in theme editor:', error);
        }
      }
    }
  });

  document.addEventListener('shopify:section:unload', (event) => {
    if (event.detail.sectionId) {
      const section = document.querySelector(`#BYOBox-${event.detail.sectionId}`);
      if (section && section.byoBoxBuilder) {
        // Cleanup
        section.byoBoxBuilder = null;
      }
    }
  });
} 