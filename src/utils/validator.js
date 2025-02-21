const Joi = require('joi');
const { URL } = require('url');

module.exports = {
  validateRequest: (req, res, next) => {
    const schema = Joi.object({
      url: Joi.string().uri().required(),
      maxDepth: Joi.number().integer().min(1).max(5)
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    next();
  },

  checkBlacklist: (url) => {
    try {
      const hostname = new URL(url).hostname;
      return process.env.BLACKLISTED_DOMAINS
        .split(',')
        .some(domain => hostname.includes(domain));
    } catch {
      return true;
    }
  }
};