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

// Obtener una noticia por ID
exports.getNewsById = async (req, res) => {
  const { id } = req.params;
  const newsId = Number(id);

  if (!Number.isInteger(newsId) || newsId <= 0) {
    return res.status(400).json({ message: 'ID de noticia inválido' });
  }

  const query = `
    SELECT id, title, date, images, information, sources, is_main, display_order
    FROM news
    WHERE id = ?
    LIMIT 1
  `.trim();

  try {
    const [rows] = await db.query(query, [newsId]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Noticia no encontrada' });
    }

    const news = rows[0];
    news.images = typeof news.images === 'string' ? news.images : JSON.stringify(news.images || []);

    res.json(news);
  } catch (error) {
    console.error('Error al obtener la noticia:', error);
    res.status(500).json({ message: 'Error en el servidor al obtener la noticia' });
  }
};
