# Apply4Me Image Assets

## Directory Structure

### `/hero/`
- Main landing page hero images
- Student success and graduation themes
- High-resolution banner images

### `/testimonials/`
- Student profile photos
- Success story images
- Professional headshots

### `/features/`
- Feature illustration images
- Process flow visuals
- Icon-style graphics

### `/institutions/`
- University campus photos
- Institution building images
- Academic facility photos

### `/backgrounds/`
- Section background images
- Pattern overlays
- Gradient backgrounds

### `/students/`
- Student lifestyle photos
- Study group images
- Campus life photos

## Image Guidelines

### **Recommended Specifications:**
- **Hero Images**: 1920x1080px or larger
- **Testimonial Photos**: 400x400px (square)
- **Feature Images**: 600x400px
- **Background Images**: 1920x1080px or larger

### **Format Requirements:**
- Use WebP format when possible for better performance
- Fallback to JPG for compatibility
- PNG for images requiring transparency
- SVG for simple graphics and icons

### **Optimization:**
- Compress images to reduce file size
- Use Next.js Image component for automatic optimization
- Implement lazy loading for better performance

## Free Image Sources

### **Recommended Sites:**
1. **Unsplash** (unsplash.com)
   - Search terms: "students", "graduation", "university", "education"
   - High-quality, free commercial use

2. **Pexels** (pexels.com)
   - Great for diverse student photos
   - Campus and academic imagery

3. **Pixabay** (pixabay.com)
   - Educational illustrations
   - Student success themes

### **Search Keywords for Apply4Me:**
- "african students"
- "south african university"
- "graduation ceremony"
- "students studying"
- "university campus"
- "academic success"
- "diverse students"
- "education technology"
- "student applications"
- "scholarship students"

## Usage in Components

Images should be imported and used with Next.js Image component:

```jsx
import Image from 'next/image'

<Image
  src="/images/hero/student-success.jpg"
  alt="Students celebrating graduation"
  width={1920}
  height={1080}
  priority
  className="object-cover"
/>
```

## Attribution

When using images that require attribution, add credits to:
`/public/images/CREDITS.md`
