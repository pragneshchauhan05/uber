const mapsService = require("../services/maps.service");
const { validationResult } = require("express-validator");

module.exports = {
  getAddressCoordinate: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { address } = req.query;
      const coordinate = await mapsService.getAddressCoordinate(address);
      res.json(coordinate);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getDistanceTime: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { origin, destination } = req.query;
      const distanceTime = await mapsService.getDistanceTime(
        origin,
        destination,
      );
      res.json(distanceTime);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getSuggestion: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { input } = req.query;
      const suggestions = await mapsService.getSuggestion(input);
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
