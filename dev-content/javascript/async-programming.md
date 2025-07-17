---
title: "Async Programming in JavaScript"
tags: ["javascript", "async", "promises", "async-await"]
date: "2024-01-20"
description: "Mastering asynchronous JavaScript with promises and async/await"
---

# Async Programming in JavaScript

Asynchronous programming is crucial for handling operations that take time, like API calls, file operations, and timers.

## Promises

Promises represent eventual completion of an async operation:

```javascript
const fetchData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("Data loaded");
    }, 1000);
  });
};

fetchData()
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

## Async/Await

A cleaner syntax for handling promises:

```javascript
async function loadUserData(userId) {
  try {
    const user = await fetchUser(userId);
    const posts = await fetchUserPosts(userId);
    return { user, posts };
  } catch (error) {
    console.error("Failed to load user data:", error);
    throw error;
  }
}
```

## Common Patterns

### Promise.all for Parallel Operations
```javascript
const results = await Promise.all([
  fetchUser(1),
  fetchUser(2),
  fetchUser(3)
]);
```

### Error Handling
```javascript
const safeApiCall = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("API call failed:", error);
    return null;
  }
};
```

## Best Practices

1. Always handle errors in async code
2. Use `Promise.all()` for parallel operations
3. Avoid callback hell with async/await
4. Set appropriate timeouts for network calls

## Related Topics

This builds on [[fundamentals]] and connects to [[backend/api-design]] patterns.

For React applications, see [[react/hooks-deep-dive]] for async patterns with hooks.

#javascript #async #promises