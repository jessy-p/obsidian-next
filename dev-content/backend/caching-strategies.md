---
title: "Caching Strategies for Backend Systems"
tags: ["backend", "caching", "performance", "redis", "cdn"]
date: "2024-02-15"
description: "Comprehensive guide to implementing effective caching strategies"
---

# Caching Strategies for Backend Systems

Caching is essential for building performant, scalable applications. Understanding different caching strategies helps you choose the right approach for your use case.

## Types of Caching

### 1. Browser Cache
Client-side caching with HTTP headers:

```javascript
// Express.js cache headers
app.get('/api/static-data', (req, res) => {
  res.set({
    'Cache-Control': 'public, max-age=3600', // 1 hour
    'ETag': generateETag(data),
    'Last-Modified': new Date().toUTCString()
  });
  res.json(data);
});

// Conditional requests
app.get('/api/data', (req, res) => {
  const etag = generateETag(data);
  const ifNoneMatch = req.headers['if-none-match'];
  
  if (ifNoneMatch === etag) {
    return res.status(304).send(); // Not Modified
  }
  
  res.set('ETag', etag);
  res.json(data);
});
```

### 2. CDN Caching
Content Delivery Network for static assets:

```javascript
// CDN-friendly cache headers
app.use('/static', express.static('public', {
  maxAge: '1y', // 1 year for static assets
  etag: true,
  lastModified: true
}));

// Dynamic content with short TTL
app.get('/api/news', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
  res.json(newsData);
});
```

### 3. Application Cache
In-memory caching within your application:

```javascript
// Simple in-memory cache
class MemoryCache {
  constructor() {
    this.cache = new Map();
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  set(key, value, ttl = 3600000) { // 1 hour default
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  }
  
  delete(key) {
    this.cache.delete(key);
  }
}

const cache = new MemoryCache();

// Usage in API
app.get('/api/expensive-operation', async (req, res) => {
  const cacheKey = `expensive-${req.params.id}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return res.json(cached);
  }
  
  const result = await performExpensiveOperation(req.params.id);
  cache.set(cacheKey, result, 300000); // 5 minutes
  
  res.json(result);
});
```

## Redis Caching

### Basic Redis Operations

```javascript
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

// Cache wrapper function
const cacheWrapper = async (key, fetcher, ttl = 3600) => {
  try {
    // Try to get from cache
    const cached = await client.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // If not in cache, fetch data
    const data = await fetcher();
    
    // Store in cache
    await client.setex(key, ttl, JSON.stringify(data));
    
    return data;
  } catch (error) {
    console.error('Cache error:', error);
    // Fallback to direct fetch if cache fails
    return await fetcher();
  }
};

// Usage
app.get('/api/user/:id', async (req, res) => {
  try {
    const user = await cacheWrapper(
      `user:${req.params.id}`,
      () => User.findById(req.params.id),
      1800 // 30 minutes
    );
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Advanced Redis Patterns

```javascript
// Cache-aside pattern
class UserService {
  async getUser(id) {
    const cacheKey = `user:${id}`;
    
    // Try cache first
    const cached = await client.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Fetch from database
    const user = await User.findById(id);
    if (user) {
      // Store in cache
      await client.setex(cacheKey, 3600, JSON.stringify(user));
    }
    
    return user;
  }
  
  async updateUser(id, userData) {
    const user = await User.findByIdAndUpdate(id, userData, { new: true });
    
    // Invalidate cache
    await client.del(`user:${id}`);
    
    return user;
  }
}

// Write-through cache
class ProductService {
  async createProduct(productData) {
    const product = await Product.create(productData);
    
    // Immediately cache the new product
    await client.setex(
      `product:${product.id}`,
      3600,
      JSON.stringify(product)
    );
    
    return product;
  }
}
```

## Database Query Caching

### Query Result Caching

```javascript
// Sequelize with Redis caching
const cachedQuery = async (query, cacheKey, ttl = 3600) => {
  const cached = await client.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  const result = await query();
  await client.setex(cacheKey, ttl, JSON.stringify(result));
  
  return result;
};

// Usage
app.get('/api/products', async (req, res) => {
  const { category, page = 1, limit = 10 } = req.query;
  const cacheKey = `products:${category}:${page}:${limit}`;
  
  const products = await cachedQuery(
    () => Product.findAll({
      where: category ? { category } : {},
      limit: parseInt(limit),
      offset: (page - 1) * limit
    }),
    cacheKey,
    600 // 10 minutes
  );
  
  res.json(products);
});
```

## Cache Invalidation Strategies

### Time-Based Invalidation (TTL)

```javascript
// Set TTL based on data volatility
const getTTL = (dataType) => {
  switch (dataType) {
    case 'user_profile': return 3600; // 1 hour
    case 'product_list': return 600;  // 10 minutes
    case 'real_time_data': return 60; // 1 minute
    default: return 1800; // 30 minutes
  }
};
```

### Event-Based Invalidation

```javascript
// Invalidate cache on data changes
const EventEmitter = require('events');
const cacheInvalidator = new EventEmitter();

// Listen for data changes
cacheInvalidator.on('user_updated', async (userId) => {
  await client.del(`user:${userId}`);
  await client.del(`user:${userId}:posts`);
});

cacheInvalidator.on('product_created', async (productId) => {
  // Invalidate product lists
  const keys = await client.keys('products:*');
  if (keys.length > 0) {
    await client.del(keys);
  }
});

// Trigger invalidation
app.put('/api/user/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body);
  cacheInvalidator.emit('user_updated', req.params.id);
  res.json(user);
});
```

### Tag-Based Invalidation

```javascript
// Redis cache with tags
class TaggedCache {
  async set(key, value, tags = [], ttl = 3600) {
    await client.setex(key, ttl, JSON.stringify(value));
    
    // Store tags mapping
    for (const tag of tags) {
      await client.sadd(`tag:${tag}`, key);
    }
  }
  
  async invalidateTag(tag) {
    const keys = await client.smembers(`tag:${tag}`);
    if (keys.length > 0) {
      await client.del(keys);
      await client.del(`tag:${tag}`);
    }
  }
}

const taggedCache = new TaggedCache();

// Usage
app.get('/api/user/:id/posts', async (req, res) => {
  const cacheKey = `user:${req.params.id}:posts`;
  const cached = await client.get(cacheKey);
  
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  const posts = await Post.findAll({ where: { userId: req.params.id } });
  
  // Cache with tags
  await taggedCache.set(
    cacheKey,
    posts,
    [`user:${req.params.id}`, 'posts'],
    1800
  );
  
  res.json(posts);
});
```

## Performance Monitoring

### Cache Hit Ratio

```javascript
class CacheMonitor {
  constructor() {
    this.hits = 0;
    this.misses = 0;
  }
  
  recordHit() {
    this.hits++;
  }
  
  recordMiss() {
    this.misses++;
  }
  
  getHitRatio() {
    const total = this.hits + this.misses;
    return total > 0 ? (this.hits / total) * 100 : 0;
  }
  
  getStats() {
    return {
      hits: this.hits,
      misses: this.misses,
      hitRatio: this.getHitRatio(),
      total: this.hits + this.misses
    };
  }
}

const monitor = new CacheMonitor();

// Modified cache wrapper with monitoring
const monitoredCache = async (key, fetcher, ttl = 3600) => {
  const cached = await client.get(key);
  
  if (cached) {
    monitor.recordHit();
    return JSON.parse(cached);
  }
  
  monitor.recordMiss();
  const data = await fetcher();
  await client.setex(key, ttl, JSON.stringify(data));
  
  return data;
};
```

## Best Practices

1. **Cache at multiple levels** - Browser, CDN, application, database
2. **Choose appropriate TTL** - Balance freshness vs performance
3. **Handle cache failures gracefully** - Always have fallback to source
4. **Monitor cache performance** - Track hit ratios and response times
5. **Use cache keys consistently** - Avoid key collisions
6. **Consider cache warm-up** - Pre-populate critical data
7. **Implement proper invalidation** - Keep data consistent

## Related Topics

This connects to [[api-design]] and [[database-optimization]].

For frontend caching, see [[javascript/performance-optimization]].

System architecture is covered in [[architecture/scalability-patterns]].

#backend #caching #performance #redis #optimization