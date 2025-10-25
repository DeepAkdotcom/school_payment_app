# Design Guidelines: Language Learning Meal Planner

## Design Approach

**Selected System**: Material Design 3
**Justification**: This productivity app requires clear information hierarchy, strong component patterns for forms and lists, and intuitive interaction models. Material Design's elevation system and component library excel at organizing complex information while maintaining clarity for language learners.

**Core Principles**:
- Information clarity over decoration
- Progressive disclosure of complexity
- Consistent patterns for predictable interaction
- Offline-first visual feedback

---

## Typography System

**Font Stack**: Google Fonts via CDN
- **Primary**: Inter (headings, UI elements)
- **Secondary**: Open Sans (body text, descriptions)

**Hierarchy**:
- App Title/Headers: Inter 600, 28px / 1.75rem
- Section Headers: Inter 600, 20px / 1.25rem  
- Card Titles: Inter 500, 18px / 1.125rem
- Body Text: Open Sans 400, 16px / 1rem
- Secondary Text: Open Sans 400, 14px / 0.875rem
- Labels/Captions: Inter 500, 12px / 0.75rem uppercase with letter-spacing

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, and 8
- Component padding: p-4, p-6
- Section spacing: gap-6, gap-8
- Margins: m-2, m-4
- Grid gaps: gap-4

**Container Strategy**:
- Max width: max-w-7xl for main content area
- Sidebar width: w-64 (fixed on desktop)
- Mobile: Full width with p-4 horizontal padding
- Grid layouts: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 for meal cards

---

## Component Library

### Navigation Structure
**Sidebar Navigation** (Desktop):
- Fixed left sidebar (w-64) with app branding at top
- Navigation items with icons (Material Icons CDN)
- Items: Dashboard, Meal Plans, Shopping List, Preferences, Saved Recipes
- Offline status indicator at bottom
- Language selector dropdown

**Mobile Navigation**:
- Bottom tab bar with 4 primary actions
- Hamburger menu for secondary options

### Dashboard Layout
**No Hero Section** - Lead with functionality:
- Top bar: Current date, language learning streak, offline status badge
- Quick actions card (h-32): "Plan Today's Meal", "View Shopping List", "Add Recipe"
- Upcoming meals grid (2x2 on desktop, single column mobile)
- Weekly overview calendar with meal assignments

### Meal Planning Components
**Meal Cards**:
- Elevated cards (shadow-md) with rounded corners (rounded-lg)
- Image placeholder area (aspect-ratio-16/9) for meal photo
- Meal name: Inter 500, 18px
- Difficulty/time badges: Small pills with icons
- Ingredient count and dietary tags
- Translation toggle button (shows meal name in target language)

**Planning Interface**:
- Weekly calendar grid (7 columns on desktop, swipeable on mobile)
- Drag-and-drop zones for meal assignment
- Filter sidebar: Dietary preferences, difficulty, prep time, cuisine
- Search bar with autocomplete

### Shopping List Module
**List Structure**:
- Categorized accordion sections (Produce, Proteins, Dairy, Pantry, etc.)
- Each item: Checkbox, name in both languages, quantity, optional notes
- Bulk actions bar: "Check all in category", "Remove checked items"
- Share list button (generates shareable text format)

**Offline Indicator**:
- Persistent badge in top-right
- Visual feedback when syncing resumes
- Toast notifications for successful sync

### Forms & Inputs
**Dietary Preferences Setup**:
- Multi-step wizard layout
- Large checkbox cards for diet types (Vegetarian, Vegan, Gluten-free, etc.)
- Allergy input with tag system
- Cooking skill level slider
- Target language selector with flags

**Recipe Input**:
- Two-column layout (Instructions | Ingredients)
- Rich text editor for steps
- Ingredient parser with quantity, unit, item fields
- Photo upload zone (dotted border, h-48)

### Data Display
**Recipe Details**:
- Full-width layout with sticky header
- Image hero (h-64 on mobile, h-96 on desktop)
- Vocabulary callout cards: Highlight cooking terms with translations
- Tabbed interface: Instructions, Ingredients, Nutrition, Notes
- Print-friendly view toggle

**Meal History**:
- Timeline view with completed meals
- Filter by date range, meal type
- Mini cards showing meal photo, date, rating

---

## Interaction Patterns

**Loading States**:
- Skeleton screens for content loading
- Shimmer effect on placeholder cards
- Disabled state styling for offline-unavailable actions

**Feedback Mechanisms**:
- Checkmark animations for completed actions
- Snackbar notifications (bottom-center, auto-dismiss)
- Validation errors inline with form fields (red text, error icons)

**Gestures** (Mobile):
- Swipe to delete on shopping list items
- Pull to refresh on meal plan view
- Long-press for quick actions menu

---

## Accessibility Standards

- All interactive elements: min height 44px
- Form inputs: Consistent h-12 with clear labels
- Keyboard navigation: Visible focus rings (ring-2 ring-offset-2)
- Screen reader labels for icon-only buttons
- Color-independent status indicators (use icons + text)

---

## Images Section

**No Large Hero Image** - This is a utility app

**Image Usage**:
- Meal cards: Placeholder food photography (aspect-ratio-16/9, object-cover)
- Recipe details: Full-width featured image (h-96 max)
- Empty states: Illustrated graphics for empty shopping lists, no meal plans
- Onboarding: Step illustrations for app features

**Image Treatment**:
- Rounded corners on all images (rounded-lg)
- Subtle overlay gradient on card images for text legibility
- Lazy loading for performance
- Fallback colored backgrounds with food emojis when no image

---

## Responsive Breakpoints

- Mobile: < 768px (single column, bottom nav)
- Tablet: 768px - 1024px (2-column grids, collapsible sidebar)
- Desktop: > 1024px (full sidebar, 3-column grids)