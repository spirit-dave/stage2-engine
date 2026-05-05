# SOLUTION.md — Stage 4B: System Optimization & Data Ingestion

## Overview

This stage focuses on improving the performance and scalability of the existing Insighta Labs+ system under increased load.

The system currently handles:
- Millions of records
- Hundreds to thousands of queries per minute
- Concurrent CLI and web usage
- Large CSV uploads (up to 500,000 rows)

The goal was to optimize query performance, improve cache efficiency through normalization, and implement a robust CSV ingestion pipeline — while keeping the system simple and maintainable.

---

# 1. Query Performance Optimization

## Approach

### 1. Database Indexing

Indexes were added to frequently queried fields:
- age
- gender
- country_id
- age_group

**Reasoning:**
These fields are commonly used in filters. Indexing avoids full table scans and significantly improves query performance.

---

### 2. In-Memory Caching

An in-memory cache (`node-cache`) was introduced at the API layer.

- Cache key is generated from query filters
- Cached responses are reused for repeated queries
- TTL set to 60 seconds

**Reasoning:**
A large portion of queries are repeated. Caching reduces redundant database calls and improves latency.

---

### 3. Query Restructuring

- Pagination enforced using `limit` and `offset`
- Dynamic filtering applied only when necessary
- Avoided unnecessary computations

**Reasoning:**
Prevents loading large datasets into memory and ensures efficient query execution.

---

## Result

- Reduced database load
- Faster response times
- Improved performance under repeated queries

---

# 2. Query Normalization

## Problem

Different user inputs can represent the same query intent:

- "Nigerian females between ages 20 and 45"
- "Women aged 20–45 living in Nigeria"

Without normalization, these produce different cache keys, reducing cache efficiency.

---

## Approach

A deterministic normalization function was introduced before caching and querying.

### Normalization Rules

- Convert `gender` to lowercase
- Convert `country_id` to uppercase
- Standardize `age_group`
- Convert numeric values to numbers
- Structure age filters into `{ gte, lte }`

### Example

**Before:**
```json
{ "gender": "Female", "country_id": "ng", "min_age": "20", "max_age": "45" }

**After:**
{ "gender": "female", "country_id": "NG", "age": { "gte": 20, "lte": 45 } }