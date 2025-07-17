---
title: "JavaScript Performance Optimization"
tags: ["javascript", "performance", "optimization", "web-vitals"]
date: "2024-01-30"
description: "Techniques for optimizing JavaScript performance in web applications"
---

# JavaScript Performance Optimization

Performance optimization is crucial for creating fast, responsive web applications. Here are key strategies for optimizing JavaScript performance.

## Measurement First

Before optimizing, measure performance:

```javascript
// Performance timing
const start = performance.now();
// Your code here
const end = performance.now();
console.log(`Operation took ${end - start} milliseconds`);

// Memory usage
console.log(performance.memory.usedJSHeapSize);
```

## Code Optimization Techniques

### Avoid Unnecessary Computations

```javascript
// Bad: Recalculating in every iteration
function processItems(items) {
  const result = [];
  for (let i = 0; i < items.length; i++) {
    if (items[i].category === getExpensiveCategory()) {
      result.push(items[i]);
    }
  }
  return result;
}

// Good: Calculate once
function processItems(items) {
  const targetCategory = getExpensiveCategory();
  return items.filter(item => item.category === targetCategory);
}
```

### Debouncing and Throttling

```javascript
// Debounce: Wait for pause in events
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

// Throttle: Limit execution frequency
const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Usage
const debouncedSearch = debounce(handleSearch, 300);
const throttledScroll = throttle(handleScroll, 100);
```

## Memory Management

### Avoid Memory Leaks

```javascript
// Bad: Creates closure that prevents garbage collection
function createHandler() {
  const largeData = new Array(1000000).fill('data');
  
  return function handler() {
    // This closure holds reference to largeData
    console.log('handling...');
  };
}

// Good: Only reference what you need
function createHandler() {
  const largeData = new Array(1000000).fill('data');
  const summary = largeData.length; // Extract only needed info
  
  return function handler() {
    console.log(`handling ${summary} items...`);
  };
}
```

### Proper Event Cleanup

```javascript
class ComponentWithListeners {
  constructor() {
    this.handleScroll = this.handleScroll.bind(this);
    window.addEventListener('scroll', this.handleScroll);
  }
  
  destroy() {
    // Always clean up event listeners
    window.removeEventListener('scroll', this.handleScroll);
  }
  
  handleScroll() {
    // Handle scroll event
  }
}
```

## DOM Optimization

### Minimize DOM Access

```javascript
// Bad: Multiple DOM queries
function updateList(items) {
  const list = document.getElementById('list');
  list.innerHTML = '';
  
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item.name;
    list.appendChild(li); // DOM manipulation in loop
  });
}

// Good: Batch DOM operations
function updateList(items) {
  const list = document.getElementById('list');
  const fragment = document.createDocumentFragment();
  
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item.name;
    fragment.appendChild(li);
  });
  
  list.innerHTML = '';
  list.appendChild(fragment); // Single DOM operation
}
```

## Async Optimization

### Optimize Promise Chains

```javascript
// Bad: Sequential async operations
async function loadUserData(userId) {
  const user = await fetchUser(userId);
  const posts = await fetchUserPosts(userId);
  const comments = await fetchUserComments(userId);
  return { user, posts, comments };
}

// Good: Parallel async operations
async function loadUserData(userId) {
  const [user, posts, comments] = await Promise.all([
    fetchUser(userId),
    fetchUserPosts(userId),
    fetchUserComments(userId)
  ]);
  return { user, posts, comments };
}
```

## Bundle Optimization

### Code Splitting

```javascript
// Dynamic imports for code splitting
const loadFeature = async () => {
  const module = await import('./heavyFeature.js');
  return module.default;
};

// Lazy loading with React
const LazyComponent = React.lazy(() => import('./LazyComponent'));
```

## Performance Monitoring

```javascript
// Web Vitals monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## Related Topics

This builds on [[fundamentals]] and [[async-programming]] concepts.

For React performance, see [[react/performance-tips]].

Backend performance is covered in [[backend/caching-strategies]].

#javascript #performance #optimization #web-vitals