---
title: "JavaScript Fundamentals"
tags: ["javascript", "programming", "basics"]
date: "2024-01-15"
description: "Core JavaScript concepts and syntax"
---

# JavaScript Fundamentals

JavaScript is a versatile programming language that runs in browsers and servers. Understanding its core concepts is essential for modern web development.

## Variables and Data Types

JavaScript supports various data types:
- **Primitive types**: string, number, boolean, null, undefined, symbol
- **Reference types**: objects, arrays, functions

```javascript
let message = "Hello World";
const age = 25;
const isActive = true;
```

## Functions

Functions are first-class citizens in JavaScript:

```javascript
// Function declaration
function greet(name) {
  return `Hello, ${name}!`;
}

// Arrow function
const add = (a, b) => a + b;
```

## Key Concepts

- **Hoisting**: Variable and function declarations are moved to the top
- **Closures**: Functions have access to outer scope variables
- **Prototype Chain**: Objects inherit from other objects

## Related Topics

This connects to [[async-programming]] and [[testing-strategies]] concepts.

See also: [[react/hooks-deep-dive]] for React-specific JavaScript patterns.

#javascript #fundamentals