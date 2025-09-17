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

router.get('/:id', async (req, res) => {
  const propertyId = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(propertyId) || propertyId <= 0) {
    return res.status(400).json({ message: 'ID de propiedad inválido' });
  }

  let connection;
  try {
    connection = await db.getConnection();

    const [propertyRows] = await connection.query(
      'SELECT * FROM properties WHERE id = ? AND status = ? LIMIT 1',
      [propertyId, 'disponible']
    );

    if (!Array.isArray(propertyRows) || propertyRows.length === 0) {
      return res.status(404).json({ message: 'Propiedad no encontrada' });
    }

    const property = propertyRows[0];

    let parsedFeatures = {};
    if (property.features) {
      try {
        const rawFeatures = typeof property.features === 'string' ? property.features : JSON.stringify(property.features);
        parsedFeatures = JSON.parse(rawFeatures) ?? {};
      } catch (error) {
        parsedFeatures = {};
      }
    }

    const images = [];
    if (property.main_image) {
      images.push(property.main_image);
    }
    for (let i = 1; i <= 15; i += 1) {
      const key = `thumbnail${i}`;
      if (property[key]) {
        images.push(property[key]);
      }
    }

    const uniqueImages = [...new Set(images.filter((src) => typeof src === 'string' && src.trim().length > 0))];

    const [similarProperties] = await connection.query(
      `SELECT id, title, price, category, listing_type, location, main_image
       FROM properties
       WHERE category = ? AND id != ? AND status = ?
       ORDER BY RAND()
       LIMIT 10`,
      [property.category, propertyId, 'disponible']
    );

    const sanitizedProperty = {
      ...property,
      features: parsedFeatures,
    };

    return res.json({
      property: sanitizedProperty,
      images: uniqueImages,
      similarProperties: Array.isArray(similarProperties) ? similarProperties : [],
    });
  } catch (error) {
    console.error('Error al obtener la propiedad:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
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
