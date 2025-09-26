const path = require('path');

const buildPublicUrl = (req, value) => {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/\\/g, '/');
  const prefixed = normalized.startsWith('public/')
    ? normalized
    : path.posix.join('public', normalized);
  const publicPath = prefixed.replace(/^public\//, 'public/');

  return `${req.protocol}://${req.get('host')}/${publicPath}`;
};

const formatUserForResponse = (req, dbUser = {}) => ({
  id: dbUser.id,
  name: dbUser.name,
  email: dbUser.email,
  role: dbUser.role,
  phone: dbUser.phone,
  birthDate: dbUser.birth_date,
  company: dbUser.company,
  website: dbUser.website,
  bio: dbUser.bio,
  profileImageUrl: buildPublicUrl(req, dbUser.profile_image),
  createdAt: dbUser.created_at,
  updatedAt: dbUser.updated_at,
});

module.exports = {
  formatUserForResponse,
};
