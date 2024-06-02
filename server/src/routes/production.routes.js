require("dotenv").config();
const express = require("express");
const router = express.Router();
const path = require("path");
const { ROLES } = require("../config/consts");
const { renderOperativeDashboard } = require("../modules/utils/renders.common.utils.module");
const { renderLoginPage, render500Page } = require(path.join(__dirname, "../modules/utils/renders.common.utils.module"));

// MIDDLEWARES TO CHECK IF CURRENT USER BELONGS TO PRODUCTION
router.use((req, res, next) => {
  try {
    if (req.session.user.role.NAME === ROLES.PRODUCTION.NAME) {
      next();
    } else {
      render500Page(res, "No tienes permisos para acceder a esta sección");
    }
  } catch (error) {
    renderLoginPage(req, res, "", "La sesión ha expirado");
  }
});

// routes for new stock entrances
router.use(require(path.join(__dirname, "production/", "production.stock.routes")));


// routes
// render main view of dashboard, with a view parameter display just x parameters
router.get("/dashboard/", (req, res) => {
  renderOperativeDashboard(req, res);
});

router.post("/dashboard/", (req, res) => {
  let { searchType, searchId } = req.body;
  renderOperativeDashboard(req, res, searchType, searchId);
});


module.exports = router;
