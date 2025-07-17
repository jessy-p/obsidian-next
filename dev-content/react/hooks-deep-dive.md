---
title: "React Hooks Deep Dive"
tags: ["react", "hooks", "useState", "useEffect", "custom-hooks"]
date: "2024-02-01"
description: "Advanced patterns and best practices for React hooks"
---

# React Hooks Deep Dive

React hooks revolutionized how we write components. Understanding advanced patterns and best practices is essential for building scalable React applications.

## Core Hooks Mastery

### useState Advanced Patterns

```javascript
// Functional updates for complex state
const [state, setState] = useState({ count: 0, name: '' });

// Good: Functional update
const incrementCount = () => {
  setState(prev => ({ ...prev, count: prev.count + 1 }));
};

// Lazy initial state for expensive computations
const [data, setData] = useState(() => {
  return expensiveComputation();
});
```

### useEffect Advanced Usage

```javascript
// Cleanup subscriptions
useEffect(() => {
  const subscription = subscribeToData((data) => {
    setData(data);
  });
  
  return () => {
    subscription.unsubscribe();
  };
}, []);

// Conditional effects
useEffect(() => {
  if (shouldFetch) {
    fetchData();
  }
}, [shouldFetch, userId]);
```

## Custom Hooks

### Data Fetching Hook

```javascript
function useApi(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) throw new Error('API call failed');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [url]);
  
  return { data, loading, error };
}

// Usage
function UserProfile({ userId }) {
  const { data: user, loading, error } = useApi(`/api/users/${userId}`);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{user.name}</div>;
}
```

### Local Storage Hook

```javascript
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };
  
  return [storedValue, setValue];
}
```

## Advanced Patterns

### useReducer for Complex State

```javascript
const initialState = { count: 0, loading: false, error: null };

function counterReducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'DECREMENT':
      return { ...state, count: state.count - 1 };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

function Counter() {
  const [state, dispatch] = useReducer(counterReducer, initialState);
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
    </div>
  );
}
```

### useCallback and useMemo Optimization

```javascript
function ExpensiveList({ items, filter }) {
  // Memoize expensive calculations
  const filteredItems = useMemo(() => {
    return items.filter(item => item.category === filter);
  }, [items, filter]);
  
  // Memoize event handlers
  const handleItemClick = useCallback((itemId) => {
    // Handle click
  }, []);
  
  return (
    <div>
      {filteredItems.map(item => (
        <Item 
          key={item.id} 
          item={item} 
          onClick={handleItemClick}
        />
      ))}
    </div>
  );
}
```

## Context and Hooks

```javascript
// Context for global state
const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for theme
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

## Common Pitfalls

1. **Stale closures**: Use functional updates or add to dependencies
2. **Infinite loops**: Be careful with useEffect dependencies
3. **Unnecessary renders**: Use React.memo and useMemo appropriately
4. **Memory leaks**: Always clean up subscriptions and timeouts

## Related Topics

This builds on [[javascript/fundamentals]] and connects to [[state-management]] patterns.

For performance optimization, see [[performance-tips]].

Component patterns are covered in [[component-patterns]].

#react #hooks #state #patterns