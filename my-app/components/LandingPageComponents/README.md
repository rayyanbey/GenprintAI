# Landing Page Components

This folder contains all the modular components for the Genprint AI landing page.

## Component Structure

```
LandingPageComponents/
├── index.ts                      # Barrel export file
├── LandingPage.tsx              # Main container component
├── Header.tsx                   # Navigation header
├── HeroSection.tsx              # Hero banner with CTA
├── ProblemSolutionSection.tsx   # Problem & Solution content
├── FeaturedProductsSection.tsx  # Product showcase
├── DesignTemplatesSection.tsx   # Design template gallery
├── AIToolsSection.tsx           # AI tools feature cards
├── CTASection.tsx               # Call-to-action section
└── Footer.tsx                   # Footer with links and social
```

## Usage

### Import the complete landing page:
```tsx
import LandingPage from '@/app/(components)/LandingPageComponents/LandingPage';

export default function Page() {
  return <LandingPage />;
}
```

### Import individual components (using barrel export):
```tsx
import { Header, Footer, HeroSection } from '@/app/(components)/LandingPageComponents';

export default function CustomPage() {
  return (
    <>
      <Header />
      <HeroSection />
      <Footer />
    </>
  );
}
```

## Component Details

### Header
- Navigation menu
- Logo
- Auth buttons (Login, Start Designing)

### HeroSection
- Main headline
- Subtext/description
- Primary CTA button
- Gradient background with decorative patterns

### ProblemSolutionSection
- Two-column layout
- Problem statement
- Solution description

### FeaturedProductsSection
- Product grid (T-shirts, Mugs, Phone Cases)
- Product cards with gradients
- CTA button

### DesignTemplatesSection
- Template gallery grid
- Four categories: Abstract Art, Geometric Patterns, Nature Inspired, Minimalist Designs

### AIToolsSection
- Three feature cards
- Icons from lucide-react
- AI Image Generator, Image Upload, Text Customization

### CTASection
- Centered CTA
- "Ready to Create?" heading
- Primary button

### Footer
- Footer navigation links
- Social media icons
- Copyright notice

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
2. **Reusable**: Components can be used independently
3. **Type-safe**: Full TypeScript support
4. **Responsive**: Mobile-first design with Tailwind CSS
5. **Accessible**: Semantic HTML and ARIA labels
6. **Maintainable**: Clean code with clear separation of concerns
