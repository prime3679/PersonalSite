---
title: "Framer Motion vs CSS Animations: Why I Switched"
slug: "framer-motion-vs-css"
excerpt: "CSS animations are great, but Framer Motion makes React apps feel magical. Here's why I made the switch."
publishedAt: "2025-11-04"
tags: ["react", "animations", "ux"]
---

# Framer Motion vs CSS Animations: Why I Switched

For years, I animated everything with CSS. It's fast, it's simple, and it works everywhere.

Then I tried **Framer Motion**, and I can't go back.

## What CSS Does Well

CSS animations are perfect for simple transitions:

```css
.button {
  transition: background-color 0.3s ease;
}

.button:hover {
  background-color: blue;
}
```

**Pros:**
- ✅ Fast (GPU accelerated)
- ✅ Simple syntax
- ✅ No JavaScript required
- ✅ Works everywhere

**Cons:**
- ❌ Limited control (can't respond to scroll, gestures, etc.)
- ❌ No exit animations (how do you animate on unmount?)
- ❌ Keyframes are verbose
- ❌ Hard to orchestrate (staggered animations, sequences)

## What Framer Motion Adds

Framer Motion is a React animation library that makes complex animations feel simple.

### 1. Declarative Syntax

Instead of keyframes, you declare what you want:

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
>
  Hello, world!
</motion.div>
```

This feels more "React-y" than managing CSS classes.

### 2. Exit Animations

With CSS, you can't animate on unmount. With Framer Motion, you can:

```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Modal content
    </motion.div>
  )}
</AnimatePresence>
```

The element fades out smoothly when removed from the DOM.

### 3. Scroll-Driven Animations

Want to fade content as the user scrolls? With CSS, you need IntersectionObserver + JavaScript. With Framer Motion:

```tsx
const { scrollYProgress } = useScroll();
const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.3]);

<motion.div style={{ opacity }}>
  Fades as you scroll
</motion.div>
```

### 4. Staggered Animations

CSS can't easily stagger child animations. Framer Motion makes it trivial:

```tsx
<motion.ul
  initial="hidden"
  animate="visible"
  variants={{
    visible: { transition: { staggerChildren: 0.1 } }
  }}
>
  {items.map(item => (
    <motion.li
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

Each list item appears 0.1s after the previous one. Beautiful.

### 5. Gesture Support

Drag, hover, tap—all built in:

```tsx
<motion.div
  drag
  dragConstraints={{ left: 0, right: 300 }}
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
>
  Drag me!
</motion.div>
```

### 6. Layout Animations

The holy grail: animating between layout changes.

```tsx
<motion.div layout>
  {isExpanded ? <FullContent /> : <Preview />}
</motion.div>
```

The element smoothly morphs between states. This is **hard** to do with CSS.

## The Trade-offs

**Bundle Size:**
- CSS: ~0 KB (it's just CSS)
- Framer Motion: ~35 KB (gzipped)

For a personal site or app where animation quality matters, 35 KB is worth it.

**Performance:**
- Both are GPU-accelerated
- Both can hit 60 FPS
- Framer Motion has slightly more overhead (but it's negligible)

**Learning Curve:**
- CSS: Everyone knows it
- Framer Motion: Need to learn the API (but it's intuitive)

## When to Use Each

**Use CSS animations for:**
- Simple hover effects
- Transitions between states
- Sites where bundle size is critical
- Non-React projects

**Use Framer Motion for:**
- Complex orchestrations (staggered, sequenced animations)
- Exit animations
- Scroll-driven effects
- Gesture interactions
- Layout animations
- React apps where UX matters

## My Landing Page Example

On my redesigned landing page (`/v2`), I use Framer Motion for:

1. **Hero entrance:** Elements fade in with staggered timing
2. **Scroll parallax:** Hero fades/scales as you scroll
3. **Viewport reveals:** Case studies appear when scrolled into view
4. **Hover effects:** Combined with CSS for hybrid approach

The result feels **polished and intentional**, not just "animated because I could."

## Conclusion

CSS animations are great for simple transitions. But when you want your React app to feel **magical**, Framer Motion is worth the bundle size.

The API is intuitive, the performance is solid, and the results speak for themselves.

---

*Try hovering over cards on my [landing page](/v2) to see Framer Motion in action.*
