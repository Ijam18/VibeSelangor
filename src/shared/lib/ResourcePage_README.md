# ResourcePage Documentation

## Overview

The ResourcePage is a comprehensive educational resource management system for VibeSelangor. It provides a beautiful, interactive interface for browsing, searching, and managing learning resources including tutorials, guides, code examples, and tools.

## Features

### 🎓 Resource Management
- **Browse Resources**: View all available learning resources
- **Search & Filter**: Filter by category, difficulty, and search terms
- **Sort Options**: Sort by newest, oldest, most viewed, highest rated, A-Z, Z-A
- **Featured Resources**: Highlight important resources with special badges

### 🎥 Video Integration
- **YouTube Integration**: Automatic YouTube video thumbnail and embed support
- **Video Modal**: Full-screen video player with resource information
- **Smart Detection**: Automatically detects YouTube URLs and provides play buttons

### 🔍 Advanced Search
- **Multi-field Search**: Search across title, description, and author
- **Category Filtering**: Filter by tutorial, guide, code, or tool
- **Difficulty Levels**: Beginner, intermediate, advanced filtering
- **Real-time Updates**: Live search as you type

### 👥 User Management
- **Admin Controls**: Add, edit, and manage resources
- **Role-based Access**: Only admins and owners can add resources
- **Real-time Sync**: Changes appear immediately across all clients

### 🎨 Beautiful UI
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Neo-Brutalist Style**: Consistent with VibeSelangor design system
- **Accessibility**: Full keyboard navigation and screen reader support

## Database Schema

### Resources Table

```sql
CREATE TABLE resources (
    id uuid PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    url text NOT NULL,
    category text DEFAULT 'tutorial' CHECK (category IN ('tutorial', 'guide', 'code', 'tool')),
    difficulty text DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    duration text,
    thumbnail text,
    tags text[],
    author text,
    published_at timestamptz DEFAULT now(),
    views int DEFAULT 0,
    rating numeric DEFAULT 0,
    is_featured boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
```

### RLS Policies

- **Public Read**: All users can view resources
- **Authenticated Insert**: Only authenticated users can add resources
- **Authenticated Update**: Only authenticated users can update resources

## Components

### ResourcePage.jsx
Main component that renders the entire resource management interface.

**Props:**
- `session`: User session object
- `currentUser`: Current user information

**State:**
- `resources`: Array of resource objects
- `loading`: Loading state
- `error`: Error state
- `searchTerm`: Search input value
- `selectedCategory`: Current category filter
- `selectedDifficulty`: Current difficulty filter
- `sortBy`: Current sort option
- `selectedVideo`: Currently selected video for modal
- `isVideoModalOpen`: Video modal visibility
- `isAddResourceModalOpen`: Add resource modal visibility
- `newResource`: Form data for new resource

### ResourceCard.jsx
Individual resource card component with hover effects and interactive elements.

**Features:**
- YouTube video detection and play button
- Difficulty level badges
- Category icons
- Author information
- View count and rating display
- Duration information
- Tag display
- External link support

### VideoModal.jsx
Full-screen video player modal with resource details.

**Features:**
- YouTube embed support
- Resource metadata display
- Responsive design
- Close functionality

### AddResourceModal.jsx
Form for adding new resources (admin-only).

**Fields:**
- Title (required)
- Description (required)
- URL (required)
- Category (tutorial, guide, code, tool)
- Difficulty (beginner, intermediate, advanced)
- Duration
- Thumbnail URL
- Tags (comma-separated)
- Author

## Service Layer

### resourceService.js
Comprehensive service layer for resource management operations.

**Methods:**

#### Read Operations
- `getResources(filters)`: Fetch resources with optional filters
- `getFeaturedResources()`: Get only featured resources
- `getResourcesByCategory(category)`: Get resources by category
- `getResourcesByDifficulty(difficulty)`: Get resources by difficulty
- `searchResources(searchTerm)`: Search across multiple fields
- `sortResources(sortBy)`: Sort resources by different criteria

#### Write Operations
- `addResource(resourceData)`: Create new resource
- `updateResource(id, resourceData)`: Update existing resource
- `deleteResource(id)`: Delete resource

#### Real-time
- `subscribeToChanges(callback)`: Subscribe to database changes

## Usage Examples

### Basic Usage
```jsx
import ResourcePage from './pages/ResourcePage';

function App() {
    return (
        <ResourcePage 
            session={session}
            currentUser={currentUser}
        />
    );
}
```

### Using the Service
```jsx
import { resourceService } from './lib/resourceService';

// Get all resources
const resources = await resourceService.getResources();

// Get featured resources
const featured = await resourceService.getFeaturedResources();

// Search resources
const results = await resourceService.searchResources('React');

// Add new resource (admin only)
const newResource = await resourceService.addResource({
    title: 'New Tutorial',
    description: 'Description here',
    url: 'https://example.com',
    category: 'tutorial',
    difficulty: 'beginner',
    author: 'Author Name'
});
```

### Real-time Updates
```jsx
import { resourceService } from './lib/resourceService';

// Subscribe to changes
const unsubscribe = resourceService.subscribeToChanges((payload) => {
    console.log('Resource changed:', payload);
    // Refresh your data or update UI
});

// Clean up
return () => unsubscribe();
```

## Styling

The ResourcePage uses the existing VibeSelangor design system with:

- **Color Scheme**: Selangor red, warm off-white background, charcoal text
- **Typography**: Plus Jakarta Sans for headings, Inter for body
- **Borders**: 2px solid charcoal borders with neo-brutalist shadows
- **Spacing**: Consistent 24px grid system
- **Animations**: Smooth transitions and hover effects

### Custom CSS Classes
- `.resource-header`: Main header section
- `.resource-stats`: Statistics cards
- `.resource-filters`: Search and filter controls
- `.resource-grid`: Main resource grid
- `.resource-card`: Individual resource cards
- `.resource-modal`: Video and add resource modals

## Responsive Design

### Desktop (≥ 1024px)
- 3-column grid layout
- Full-width search and filters
- Large video modals
- Hover effects on cards

### Tablet (768px - 1023px)
- 2-column grid layout
- Stacked search controls
- Medium-sized modals
- Touch-friendly interactions

### Mobile (< 768px)
- 1-column grid layout
- Full-width search and filters
- Full-screen modals
- Optimized touch targets

## Performance Optimizations

### Lazy Loading
- Images load on demand
- Video embeds only load when modal opens
- Search debouncing for better performance

### Caching
- Resource data cached in component state
- Real-time updates prevent unnecessary re-fetches
- Efficient filtering and sorting

### Bundle Size
- Tree-shaking for unused components
- Code splitting for modals
- Minimal dependencies

## Security

### RLS (Row Level Security)
- Public read access for all resources
- Authenticated write access only
- Proper permission checks for admin actions

### Input Validation
- URL validation for resource links
- Required field validation
- Sanitization of user input

### XSS Protection
- Safe HTML rendering
- Proper escaping of user content
- Secure iframe embedding for videos

## Testing

### Unit Tests
```jsx
import { testResourceService } from './lib/resourceService.test';

// Run all tests
const success = await testResourceService.runAllTests();
```

### Manual Testing
1. **Search Functionality**: Test search across all fields
2. **Filtering**: Verify category and difficulty filters work
3. **Sorting**: Test all sort options
4. **Video Modal**: Test YouTube integration
5. **Admin Features**: Test add resource functionality
6. **Real-time**: Test live updates across multiple tabs

## Troubleshooting

### Common Issues

#### Resources Not Loading
- Check Supabase connection
- Verify RLS policies are set correctly
- Check console for error messages

#### Video Not Playing
- Verify YouTube URL format
- Check if thumbnail URL is valid
- Ensure YouTube embed is allowed

#### Search Not Working
- Check search term formatting
- Verify database contains searchable data
- Check for case sensitivity issues

#### Real-time Updates Not Working
- Verify Supabase realtime is enabled
- Check channel subscription
- Ensure proper event handling

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('DEBUG', 'true');
```

## Future Enhancements

### Planned Features
- [ ] Resource ratings and reviews
- [ ] User progress tracking
- [ ] Resource categories management
- [ ] Bulk import/export
- [ ] Analytics dashboard
- [ ] Resource recommendations

### Performance Improvements
- [ ] Virtualization for long lists
- [ ] Image optimization
- [ ] Caching strategies
- [ ] CDN integration

## Contributing

### Code Style
- Follow existing component patterns
- Use TypeScript for type safety
- Maintain consistent naming conventions
- Add proper JSDoc comments

### Testing
- Write unit tests for new features
- Test responsive behavior
- Verify accessibility compliance
- Test with real data

### Documentation
- Update this README for new features
- Add inline code comments
- Document breaking changes
- Provide usage examples

## Support

For questions, issues, or feature requests:

1. Check the troubleshooting section
2. Review the code comments
3. Test with the provided test suite
4. Create an issue with detailed information

## License

This component is part of the VibeSelangor project and follows the same licensing terms.