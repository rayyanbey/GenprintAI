# Product Catalog Components

This folder contains all the modular components for the Genprint AI Product Catalog page.

## Component Structure

```
ProductCatalogComponents/
├── index.ts                      # Barrel export file
├── ProductCatalog.tsx           # Main container component
├── ProductCatalogHeader.tsx     # Navigation header with search
├── ProductCatalogHero.tsx       # Hero section with title
├── ProductCard.tsx              # Reusable product card component
├── ApparelSection.tsx           # Apparel products section
├── AccessoriesSection.tsx       # Accessories products section
└── HomeLivingSection.tsx        # Home & Living products section
```

## Usage

### Import the complete product catalog:
```tsx
import ProductCatalog from '@/app/(components)/ProductCatalogComponents/ProductCatalog';

export default function ProductsPage() {
  return <ProductCatalog />;
}
```

### Import individual components (using barrel export):
```tsx
import { ProductCatalogHeader, ApparelSection } from '@/app/(components)/ProductCatalogComponents';

export default function CustomPage() {
  return (
    <>
      <ProductCatalogHeader />
      <ApparelSection />
    </>
  );
}
```

## Component Details

### ProductCatalogHeader
- Navigation menu with active "Products" link
- Logo
- Search bar with icon
- Shopping cart icon
- Responsive design

### ProductCatalogHero
- Page title: "Product Catalog"
- Description text
- Centered layout

### ProductCard (Reusable)
- Product image placeholder with gradient background
- Product title
- Product description
- Hover effects (scale on hover)
- TypeScript props interface

### ApparelSection
- 4 product cards in a grid
- Products: T-Shirts, Hoodies, Caps, Socks
- Uses ProductCard component

### AccessoriesSection
- 4 product cards in a grid
- Products: Phone Cases, Mugs, Tote Bags, Stickers
- Light gray background
- Uses ProductCard component

### HomeLivingSection
- 4 product cards in a grid
- Products: Pillows, Blankets, Posters, Coasters
- Uses ProductCard component

## Product Categories

### Apparel
- Custom T-Shirts
- Personalized Hoodies
- Design Your Own Caps
- Unique Socks

### Accessories
- Custom Phone Cases
- Personalized Mugs
- Design Your Own Tote Bags
- Unique Stickers

### Home & Living
- Custom Pillows
- Personalized Blankets
- Design Your Own Posters
- Unique Coasters

## Color Palette

The components use a consistent color scheme:
- Light Coral: `#f08080`
- Coral Pink: `#f4978e`
- Melon: `#f8ad9d`
- Apricot: `#fbc4ab`
- Light Orange: `#ffdab9`
- Primary CTA: `#ef4444` (red)

## Best Practices

1. **Modular**: Each component is self-contained
2. **Reusable**: ProductCard component is used across all sections
3. **Type-safe**: Full TypeScript support with interfaces
4. **Responsive**: Mobile-first design (2 cols mobile, 4 cols desktop)
5. **Accessible**: Semantic HTML and ARIA labels
6. **Maintainable**: Clean code with clear separation of concerns
7. **Consistent**: Same card design and spacing throughout
8. **Interactive**: Hover effects for better UX
