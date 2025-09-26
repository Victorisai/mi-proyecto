const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const { formatUserForResponse } = require('../utils/userFormatter');

const deleteFileIfExists = async (filePath) => {
  if (!filePath) {
    return;
  }

  const absolutePath = path.join(process.cwd(), filePath);
  try {
    await fs.promises.unlink(absolutePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('No se pudo eliminar el archivo antiguo:', error.message);
    }
  }
};

exports.getProfile = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Usuario no autenticado.' });
  }

  let connection;

  try {
    connection = await db.getConnection();
    const [rows] = await connection.query(
      `SELECT id, name, email, phone, birth_date, role, profile_image, bio, company, website, created_at, updated_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No se encontró el usuario solicitado.' });
    }

    const user = rows[0];
    res.json({ user: formatUserForResponse(req, user) });
  } catch (error) {
    console.error('Error al obtener el perfil del usuario:', error);
    res.status(500).json({ message: 'Ocurrió un error al obtener tu información.' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

exports.updateProfile = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Usuario no autenticado.' });
  }

  const {
    name,
    phone,
    birthDate,
    bio,
    company,
    website,
  } = req.body;

  const hasFile = Boolean(req.file);
  const normalizedFilePath = hasFile ? req.file.path.replace(/\\/g, '/') : null;

  let connection;

  try {
    connection = await db.getConnection();

    const [existingRows] = await connection.query(
      'SELECT profile_image FROM users WHERE id = ? LIMIT 1',
      [userId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ message: 'No se encontró el usuario solicitado.' });
    }

    const updates = [];
    const values = [];

    const pushUpdate = (column, value) => {
      if (typeof value === 'undefined') {
        return;
      }
      updates.push(`${column} = ?`);
      values.push(value === '' ? null : value);
    };

    pushUpdate('name', name?.trim());
    pushUpdate('phone', phone?.trim());
    pushUpdate('birth_date', birthDate || null);
    pushUpdate('bio', bio?.trim());
    pushUpdate('company', company?.trim());
    pushUpdate('website', website?.trim());

    if (hasFile) {
      updates.push('profile_image = ?');
      values.push(normalizedFilePath);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No se detectaron cambios para actualizar.' });
    }

    updates.push('updated_at = NOW()');
    values.push(userId);

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await connection.query(sql, values);

    const [updatedRows] = await connection.query(
      `SELECT id, name, email, phone, birth_date, role, profile_image, bio, company, website, created_at, updated_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [userId]
    );

    const updatedUser = updatedRows[0];

    if (hasFile) {
      const previousImage = existingRows[0]?.profile_image;
      if (previousImage && previousImage !== normalizedFilePath) {
        await deleteFileIfExists(previousImage);
      }
    }

    res.json({
      message: 'Perfil actualizado correctamente.',
      user: formatUserForResponse(req, updatedUser),
    });
  } catch (error) {
    console.error('Error al actualizar el perfil del usuario:', error);
    res.status(500).json({ message: 'Ocurrió un error al actualizar tu perfil.' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
