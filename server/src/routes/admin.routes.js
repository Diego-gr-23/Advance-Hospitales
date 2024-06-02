require("dotenv").config();
const express = require("express");
const router = express.Router();
const path = require("path");

const { ROLES } = require("../config/consts");
const { renderLoginPage, render500Page } = require("../modules/utils/renders.common.utils.module");

// MIDDLEWARES TO CHECK IF CURRENT USER BELONGS TO ADMIN
router.use((req, res, next) => {
  try {
    if (req.session.user.role.NAME === ROLES.ADMIN.NAME) {
      next();
    } else {
      render500Page(res, "No tienes permisos para acceder a esta sección");
    }
  } catch (error) {
    renderLoginPage(req, res, "", "La sesión ha expirado");
  }
});

// routes
adminBuildingRouter = require(path.join(
  __dirname,
  "admin/",
  "admin.buildings.routes"
));

// buildings paths
router.use(adminBuildingRouter.router);
// products paths
router.use(require(path.join(__dirname, "admin/", "admin.products.routes")));
// users paths
router.use(require(path.join(__dirname, "admin/", "admin.users.routes")));
// finance paths
router.use(require(path.join(__dirname, "admin/", "admin.finance.routes")));
// reports path
router.use(require(path.join(__dirname, "admin/", "admin.reports.routes")));
// render main view of dashboard, with a view parameter display just x parameters
router.get("/dashboard/:view", async (req, res) => {
  try {
    let view = req.params.view;
    adminBuildingRouter.renderDashboard(req, res, "", "", view);
  } catch (error) {
    // render login 
    renderLoginPage(req, res, "", "No hemos podido encontrar el dashboard valido");
  }
});

module.exports = router;
