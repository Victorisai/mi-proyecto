// backend/routes/propertiesRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/properties
router.get('/', async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();

    const {
      listing_type: listingTypeParam,
      search,
      category,
      location,
      min_price: minPriceParam,
      max_price: maxPriceParam,
      limit
    } = req.query;

    const listingType = normalizeListingType(listingTypeParam);
    const searchTerm = typeof search === 'string' ? search.trim() : '';
    const categoryFilter = typeof category === 'string' ? category.trim() : '';
    const locationFilter = typeof location === 'string' ? location.trim() : '';
    const minPrice = parseNumericValue(minPriceParam);
    const maxPrice = parseNumericValue(maxPriceParam);
    const limitValue = parseLimit(limit);

    const conditions = ['status = ?'];
    const params = ['disponible'];

    if (listingType) {
      conditions.push('listing_type = ?');
      params.push(listingType);
    }

    if (searchTerm) {
      conditions.push('(title LIKE ? OR description LIKE ?)');
      const likeTerm = `%${searchTerm}%`;
      params.push(likeTerm, likeTerm);
    }

    if (categoryFilter) {
      conditions.push('category = ?');
      params.push(categoryFilter);
    }

    if (locationFilter) {
      conditions.push('location = ?');
      params.push(locationFilter);
    }

    if (minPrice !== null) {
      conditions.push('price >= ?');
      params.push(minPrice);
    }

    if (maxPrice !== null) {
      conditions.push('price <= ?');
      params.push(maxPrice);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    let propertiesQuery = `SELECT id, title, price, category, listing_type, location, main_image FROM properties ${whereClause} ORDER BY created_at DESC`;

    const queryParams = [...params];

    if (limitValue !== null) {
      propertiesQuery += ' LIMIT ?';
      queryParams.push(limitValue);
    }

    const [properties] = await connection.query(propertiesQuery, queryParams);

    if (limitValue !== null) {
      return res.json(properties);
    }

    const [priceRows] = await connection.query(
      'SELECT MIN(price) AS min_price, MAX(price) AS max_price FROM properties WHERE status = ?' + (listingType ? ' AND listing_type = ?' : ''),
      listingType ? ['disponible', listingType] : ['disponible']
    );

    const [locationRows] = await connection.query(
      'SELECT DISTINCT location FROM properties WHERE status = ? ORDER BY location ASC',
      ['disponible']
    );

    const minPriceAvailable = priceRows[0]?.min_price ?? 0;
    let maxPriceAvailable = priceRows[0]?.max_price ?? 0;

    if (maxPriceAvailable <= minPriceAvailable) {
      maxPriceAvailable = minPriceAvailable + 1000;
    }

    res.json({
      properties,
      total: properties.length,
      filters: {
        priceRange: {
          min: minPriceAvailable,
          max: maxPriceAvailable
        },
        locations: locationRows
          .map((row) => row.location)
          .filter((value) => typeof value === 'string' && value.trim().length > 0)
      }
    });
  } catch (error) {
    console.error('Error al obtener las propiedades:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

function parseNumericValue(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function parseLimit(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const numericValue = Number(value);
  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    return null;
  }
  return numericValue;
}

function normalizeListingType(value) {
  if (value === 'renta') {
    return 'renta';
  }
  if (value === 'venta') {
    return 'venta';
  }
  return 'venta';
}

module.exports = router;
