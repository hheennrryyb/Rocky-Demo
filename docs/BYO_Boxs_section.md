# BYO Box Section - Design & Logic Planning

## Overview
A flexible, schema-driven Shopify section that allows customers to build custom product boxes with configurable constraints and multi-step selection process.

## Core Requirements
- **Multi-page flow**: Box type selection → Product selection
- **Flexible constraints**: Different box types with varying selection rules
- **Real-time feedback**: Progress tracking and selection visualization
- **Cart integration**: Seamless checkout with bundled pricing
- **Scalable design**: Easy to add new box types and products

## Schema Structure

### Shopify Section Schema (Block-Based Configuration)
```json
{
  "name": "BYO Box Builder",
  "settings": [
    {
      "type": "header",
      "content": "Section Settings"
    },
    {
      "type": "text",
      "id": "section_title",
      "label": "Section Title",
      "default": "Build Your Own Box"
    },
    {
      "type": "textarea",
      "id": "section_description", 
      "label": "Section Description",
      "default": "Create your perfect combination of products"
    },
    {
      "type": "select",
      "id": "layout_style",
      "label": "Layout Style",
      "options": [
        { "value": "grid", "label": "Grid Layout" },
        { "value": "list", "label": "List Layout" }
      ],
      "default": "grid"
    }
  ],
  "blocks": [
    {
      "type": "box_configuration",
      "name": "Box Configuration",
      "settings": [
        {
          "type": "header",
          "content": "Box Details"
        },
        {
          "type": "text",
          "id": "box_name",
          "label": "Box Name",
          "default": "Custom Box"
        },
        {
          "type": "textarea",
          "id": "box_description",
          "label": "Box Description",
          "default": "Build your perfect selection"
        },
        {
          "type": "image_picker",
          "id": "box_image",
          "label": "Box Image"
        },
        {
          "type": "number",
          "id": "box_fee",
          "label": "Box Fee ($)",
          "default": 1.00
        },
        {
          "type": "checkbox",
          "id": "is_featured",
          "label": "Featured Box",
          "default": false
        },
        {
          "type": "header",
          "content": "Category 1"
        },
        {
          "type": "text",
          "id": "category_1_name",
          "label": "Category 1 Name",
          "default": "Bath Bombs"
        },
        {
          "type": "collection",
          "id": "category_1_collection",
          "label": "Category 1 Collection"
        },
        {
          "type": "text",
          "id": "category_1_label",
          "label": "Category 1 Display Label",
          "default": "Choose your bath bombs"
        },
        {
          "type": "number",
          "id": "category_1_min",
          "label": "Category 1 Minimum Items",
          "default": 1
        },
        {
          "type": "number", 
          "id": "category_1_max",
          "label": "Category 1 Maximum Items",
          "default": 6
        },
        {
          "type": "checkbox",
          "id": "category_1_allow_duplicates",
          "label": "Category 1 Allow Duplicates",
          "default": true
        },
        {
          "type": "select",
          "id": "category_1_sort",
          "label": "Category 1 Sort Order",
          "options": [
            { "value": "title", "label": "Title A-Z" },
            { "value": "title-desc", "label": "Title Z-A" },
            { "value": "price", "label": "Price Low-High" },
            { "value": "price-desc", "label": "Price High-Low" },
            { "value": "created", "label": "Newest First" },
            { "value": "created-desc", "label": "Oldest First" }
          ],
          "default": "title"
        },
        {
          "type": "header",
          "content": "Category 2 (Optional)"
        },
        {
          "type": "text",
          "id": "category_2_name",
          "label": "Category 2 Name"
        },
        {
          "type": "collection",
          "id": "category_2_collection",
          "label": "Category 2 Collection"
        },
        {
          "type": "text",
          "id": "category_2_label",
          "label": "Category 2 Display Label"
        },
        {
          "type": "number",
          "id": "category_2_min",
          "label": "Category 2 Minimum Items",
          "default": 0
        },
        {
          "type": "number",
          "id": "category_2_max", 
          "label": "Category 2 Maximum Items",
          "default": 3
        },
        {
          "type": "checkbox",
          "id": "category_2_allow_duplicates",
          "label": "Category 2 Allow Duplicates",
          "default": true
        },
        {
          "type": "select",
          "id": "category_2_sort",
          "label": "Category 2 Sort Order",
          "options": [
            { "value": "title", "label": "Title A-Z" },
            { "value": "title-desc", "label": "Title Z-A" },
            { "value": "price", "label": "Price Low-High" },
            { "value": "price-desc", "label": "Price High-Low" },
            { "value": "created", "label": "Newest First" },
            { "value": "created-desc", "label": "Oldest First" }
          ],
          "default": "title"
        },
        {
          "type": "header",
          "content": "Category 3 (Optional)"
        },
        {
          "type": "text",
          "id": "category_3_name",
          "label": "Category 3 Name"
        },
        {
          "type": "collection",
          "id": "category_3_collection",
          "label": "Category 3 Collection"
        },
        {
          "type": "text",
          "id": "category_3_label",
          "label": "Category 3 Display Label"
        },
        {
          "type": "number",
          "id": "category_3_min",
          "label": "Category 3 Minimum Items",
          "default": 0
        },
        {
          "type": "number",
          "id": "category_3_max",
          "label": "Category 3 Maximum Items", 
          "default": 2
        },
        {
          "type": "checkbox",
          "id": "category_3_allow_duplicates",
          "label": "Category 3 Allow Duplicates",
          "default": true
        },
        {
          "type": "select",
          "id": "category_3_sort",
          "label": "Category 3 Sort Order",
          "options": [
            { "value": "title", "label": "Title A-Z" },
            { "value": "title-desc", "label": "Title Z-A" },
            { "value": "price", "label": "Price Low-High" },
            { "value": "price-desc", "label": "Price High-Low" },
            { "value": "created", "label": "Newest First" },
            { "value": "created-desc", "label": "Oldest First" }
          ],
          "default": "title"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "BYO Box Builder",
      "blocks": [
        {
          "type": "box_configuration",
          "settings": {
            "box_name": "Bath Bomb Box",
            "box_description": "Choose your favorite bath bomb scents",
            "box_fee": 1.00,
            "category_1_name": "Bath Bombs",
            "category_1_label": "Choose 4-6 bath bombs",
            "category_1_min": 4,
            "category_1_max": 6,
            "category_1_allow_duplicates": true
          }
        },
        {
          "type": "box_configuration", 
          "settings": {
            "box_name": "Perfect Pair Gift Set",
            "box_description": "The perfect combination for daily care",
            "box_fee": 1.00,
            "category_1_name": "Everything Wash",
            "category_1_label": "Choose 1 Everything Wash",
            "category_1_min": 1,
            "category_1_max": 1,
            "category_1_allow_duplicates": false,
            "category_2_name": "Daily Oat Lotion",
            "category_2_label": "Choose 1 Daily Oat Lotion", 
            "category_2_min": 1,
            "category_2_max": 1,
            "category_2_allow_duplicates": false
          }
        }
      ]
    }
  ]
}
```

## Logic Flow

### Page 1: Box Configuration Selection
**State Management:**
- `selectedBoxConfig`: null | BoxConfiguration
- `availableBoxConfigs`: BoxConfiguration[]
- `categories`: Category[] // Global category definitions

**Logic:**
1. Render grid of available box configurations from schema
2. Display box name, description, category rules, and preview image
3. Show min/max constraints for each category in the box
4. On selection, store box configuration and transition to Page 2
5. Validate box availability and category product availability

### Page 2: Category-Based Product Selection
**State Management:**
```javascript
{
  selectedProducts: Map<categoryId, Map<productId, quantity>>,
  boxConfiguration: BoxConfiguration,
  categorySelections: Map<categoryId, {
    current: number,
    min: number, 
    max: number,
    isComplete: boolean,
    isOptional: boolean
  }>,
  categories: Category[],
  loadedProducts: Map<categoryId, Product[]>
}
```

**Core Logic:**
1. **Product Loading**: Fetch products for each category's collections
2. **Category-Based Selection Tracking**: 
   - Track selections per category independently
   - Validate against min/max constraints per category
   - Handle optional categories (min: 0)
3. **Progress Calculation**: 
   - Per-category progress: `current / min * 100` (for required categories)
   - Overall progress: Average of all category completion rates
4. **Flexible Validation**: 
   - Each category validates against its own min/max rules
   - Box is complete when all categories meet minimum requirements
   - Categories can exceed minimum up to their maximum

## Component Architecture

### 1. BYO Box Controller
- **Responsibility**: State management, page navigation, cart integration
- **Methods**: 
  - `selectBoxConfiguration(boxConfig)`
  - `addProductToCategory(categoryId, productId, quantity)`
  - `removeProductFromCategory(categoryId, productId)`
  - `validateCategorySelections(categoryId)`
  - `validateAllSelections()`
  - `calculateCategoryProgress(categoryId)`
  - `addToCart()`

### 2. Box Configuration Selector (Page 1)
- **Responsibility**: Display available box configurations
- **Data**: Box configuration metadata, images, descriptions, category rules
- **Features**:
  - Configuration cards showing category breakdowns
  - Min/max constraint previews
  - Pricing information with box fees
- **Events**: Box configuration selection

### 3. Category-Based Product Grid (Page 2)
- **Responsibility**: Display products organized by categories
- **Features**:
  - Category sections with individual progress bars
  - Product cards with images, names, prices within each category
  - Category-specific quantity selectors (+/- buttons)
  - Visual indicators for category completion status
  - Expandable/collapsible category sections
  - Different sorting options per category

### 4. Selection Summary Bar (Fixed Bottom)
- **Responsibility**: Show current selections across all categories
- **Features**:
  - Category-based progress indicators
  - Selected product thumbnails grouped by category
  - Per-category count displays (e.g., "Bath Bombs: 3/4-8")
  - Overall completion status
  - "Add to Cart" button (enabled when all minimums met)
  - Quick category navigation

### 5. Multi-Category Progress Indicator
- **Responsibility**: Visual feedback on selection progress across categories
- **Logic**: 
  - Individual progress bars per category
  - Color coding: Red (below minimum), Yellow (at minimum), Green (optimal range)
  - Optional category indicators
  - Overall completion percentage
  - Category labels with current/min/max counts

## Data Flow

### Selection Process
1. **Box Type Selection**: 
   ```
   User clicks box type → Store in state → Load products → Render Page 2
   ```

2. **Product Selection**:
   ```
   User clicks +/- → Update quantity → Validate constraints → Update UI
   ```

3. **Cart Integration**:
   ```
   Complete selection → Bundle products → Add box fee → Add to cart
   ```

### Validation Rules
- **Category Minimums**: Each category must meet its minimum selection requirement
- **Category Maximums**: Selections cannot exceed the maximum for any category
- **Optional Categories**: Categories with min: 0 are optional and can be skipped
- **Duplicate Policy**: Allow/disallow duplicates based on category configuration
- **Cross-Category Validation**: Validate the entire box configuration as a unit
- **Stock Validation**: Check product availability before adding to cart
- **Dynamic Constraints**: Rules can be adjusted per box configuration

## Cart Integration Strategy

### Bundle Structure
```javascript
{
  line_items: [
    {
      id: "byo-box-bath-bombs",
      title: "Bath Bomb Box (Custom Selection)",
      price: boxFee + totalProductPrices,
      quantity: 1,
      properties: {
        box_type: "bath_bombs",
        selected_products: [
          { id: "product1", quantity: 2, title: "Lavender Bath Bomb" },
          { id: "product2", quantity: 1, title: "Rose Bath Bomb" },
          // ...
        ]
      }
    }
  ]
}
```

### Cart Display Logic
- Show bundle as single line item
- Expand to show individual product selections
- Display box fee separately in properties
- Enable modification through "Edit Selection" flow

## Flexibility & Scalability

### Adding New Box Types
1. Update schema with new box configuration
2. Define product collections
3. Set selection constraints
4. Configure pricing rules

### Multi-Category Support
- Schema supports nested category definitions
- UI adapts to show category sections
- Progress tracking handles multiple progress bars
- Validation respects per-category limits

### Customization Points
- **Visual Design**: Configurable colors, layouts, imagery
- **Selection Rules**: Flexible constraint definitions
- **Pricing**: Configurable box fees and discount rules
- **Product Display**: Sortable, filterable product grids

## Technical Implementation Notes

### Performance Considerations
- **Lazy Loading**: Load products only when box type selected
- **State Optimization**: Use efficient data structures for selection tracking
- **DOM Updates**: Minimize re-renders with targeted updates

### Mobile Responsiveness
- **Touch-Friendly**: Large tap targets for quantity controls
- **Fixed Bar**: Collapsible on mobile, expandable on tap
- **Product Grid**: Responsive columns based on screen size

### Accessibility
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Readers**: Proper ARIA labels and announcements
- **Focus Management**: Logical tab order and focus indicators

## Implementation Roadmap

### Step 1: Foundation & Schema Implementation
**Objective**: Build the core structure and data layer
- **Shopify Section Schema**: Create the flexible category-based schema with all settings
- **Liquid Template Structure**: Build the two-page template system with conditional rendering
- **Data Layer**: Implement category loading, product fetching, and collection handling
- **Basic UI Framework**: Create the HTML structure and basic styling for both pages
- **Schema Validation**: Ensure all category and box configuration data loads correctly

**Deliverables**: 
- Functional section that loads in theme customizer
- Box configurations display on Page 1
- Products load and display by category on Page 2
- Basic navigation between pages works

### Step 2: Interactive Logic & State Management
**Objective**: Implement the complex selection logic and user interactions
- **State Management System**: Build the category-based selection tracking with Map structures
- **Validation Engine**: Implement min/max constraints, duplicate handling, and cross-category validation
- **Progress Tracking**: Create per-category and overall progress calculation
- **User Interactions**: Implement +/- buttons, quantity controls, and selection feedback
- **Dynamic UI Updates**: Real-time progress bars, completion indicators, and constraint messaging

**Deliverables**:
- Fully functional product selection with live validation
- Working progress indicators and completion tracking
- Selection summary bar with category breakdown
- Error handling and user feedback systems

### Step 3: Integration & Polish
**Objective**: Complete the cart integration and optimize the user experience
- **Cart Integration**: Implement bundling logic, line item properties, and checkout flow
- **Mobile Optimization**: Responsive design, touch interactions, and mobile-specific UX
- **Performance Optimization**: Lazy loading, efficient DOM updates, and state optimization
- **Edge Case Handling**: Out of stock products, empty categories, and error states
- **Testing & Refinement**: Cross-browser testing, accessibility improvements, and UX polish

**Deliverables**:
- Complete cart integration with proper bundling
- Mobile-responsive design with optimal UX
- Production-ready section with error handling
- Comprehensive testing and documentation
