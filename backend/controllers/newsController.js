// backend/controllers/newsController.js

const db = require('../config/db');

// Obtener noticias para la página principal
exports.getNews = async (req, res) => {
  const limit = parseInt(req.query.limit, 10);
  const hasLimit = Number.isInteger(limit) && limit > 0;

  const baseQuery = `
    SELECT id, title, date, images, information, sources, is_main, display_order
    FROM news
    ORDER BY display_order ASC, date DESC
  `.trim();

  try {
    const [rows] = hasLimit
      ? await db.query(`${baseQuery} LIMIT ?`, [limit])
      : await db.query(baseQuery);

    const normalizedRows = rows.map((news) => ({
      ...news,
      images: typeof news.images === 'string' ? news.images : JSON.stringify(news.images || []),
    }));

    res.json(normalizedRows);
  } catch (error) {
    console.error('Error al obtener las noticias:', error);
    res.status(500).json({ message: 'Error en el servidor al obtener las noticias' });
  }
};
