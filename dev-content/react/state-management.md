---
title: "React State Management"
tags: ["react", "state", "redux", "zustand", "context"]
date: "2024-02-05"
description: "Comprehensive guide to managing state in React applications"
---

# React State Management

State management is one of the most crucial aspects of React applications. Choosing the right approach depends on your application's complexity and requirements.

## Local State vs Global State

### When to Use Local State

```javascript
// Simple component state
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// Form state
function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  
  return (
    <form>
      <input 
        name="email" 
        value={formData.email} 
        onChange={handleChange} 
      />
      <input 
        name="password" 
        type="password"
        value={formData.password} 
        onChange={handleChange} 
      />
    </form>
  );
}
```

### When to Use Global State

- User authentication status
- Theme preferences
- Shopping cart contents
- Application configuration
- Data shared across many components

## Context API for Global State

```javascript
// User context
const UserContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const login = async (credentials) => {
    setLoading(true);
    try {
      const userData = await authenticateUser(credentials);
      setUser(userData);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
  };
  
  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook
function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
```

## Zustand for Simple Global State

```javascript
import { create } from 'zustand';

// Simple store
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

// Usage
function Counter() {
  const { count, increment, decrement, reset } = useStore();
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

// Async actions
const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  error: null,
  
  fetchUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      const user = await api.getUser(userId);
      set({ user, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  updateUser: async (userData) => {
    const currentUser = get().user;
    if (!currentUser) return;
    
    try {
      const updatedUser = await api.updateUser(currentUser.id, userData);
      set({ user: updatedUser });
    } catch (error) {
      set({ error: error.message });
    }
  }
}));
```

## Redux Toolkit for Complex State

```javascript
// Store slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk
export const fetchTodos = createAsyncThunk(
  'todos/fetchTodos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getTodos();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const todosSlice = createSlice({
  name: 'todos',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {
    addTodo: (state, action) => {
      state.items.push(action.payload);
    },
    toggleTodo: (state, action) => {
      const todo = state.items.find(item => item.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    removeTodo: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { addTodo, toggleTodo, removeTodo } = todosSlice.actions;
export default todosSlice.reducer;
```

## State Management Best Practices

### 1. Choose the Right Tool

- **Local state**: useState, useReducer
- **Simple global state**: Context API, Zustand
- **Complex global state**: Redux Toolkit
- **Server state**: React Query, SWR

### 2. Normalize State Structure

```javascript
// Bad: Nested objects
const state = {
  posts: [
    { id: 1, title: 'Post 1', author: { id: 1, name: 'John' } },
    { id: 2, title: 'Post 2', author: { id: 1, name: 'John' } }
  ]
};

// Good: Normalized structure
const state = {
  posts: {
    byId: {
      1: { id: 1, title: 'Post 1', authorId: 1 },
      2: { id: 2, title: 'Post 2', authorId: 1 }
    },
    allIds: [1, 2]
  },
  authors: {
    byId: {
      1: { id: 1, name: 'John' }
    },
    allIds: [1]
  }
};
```

### 3. Separate Concerns

```javascript
// Separate data fetching from UI state
const useDataState = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  return { data, loading, error, setData, setLoading, setError };
};

const useUIState = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  return { isModalOpen, selectedItem, setIsModalOpen, setSelectedItem };
};
```

## Performance Considerations

### Prevent Unnecessary Re-renders

```javascript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Expensive rendering logic */}</div>;
});

// Use useMemo for expensive calculations
const MemoizedList = ({ items, filter }) => {
  const filteredItems = useMemo(() => {
    return items.filter(item => item.category === filter);
  }, [items, filter]);
  
  return <div>{/* Render filtered items */}</div>;
};
```

## Related Topics

This builds on [[hooks-deep-dive]] and connects to [[performance-tips]].

For component patterns, see [[component-patterns]].

Backend state synchronization is covered in [[backend/api-design]].

#react #state #redux #context #zustand