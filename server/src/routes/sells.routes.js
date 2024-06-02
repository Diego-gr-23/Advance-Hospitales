require("dotenv").config();
const express = require("express");
const router = express.Router();
const path = require("path");
const { ROLES } = require("../config/consts");
const { renderLoginPage, render500Page, renderSellsDashboard, initializeCart } = require("../modules/utils/renders.common.utils.module");

// MIDDLEWARES TO CHECK IF CURRENT USER BELONGS TO SELLS
router.use((req, res, next) => {
    try {
        if (req.session.user.role.NAME === ROLES.SELLS.NAME) {
            next();
        } else {
            render500Page(res, "No tienes permisos para acceder a esta sección");
        }
    } catch (error) {
        renderLoginPage(req, res, "", "La sesión ha expirado");
    }
});

// routes
// cart paths
router.use(require(path.join(__dirname, "sells/", "sells.cart.routes")));
// clients paths
router.use(require(path.join(__dirname, "sells/", "sells.clients.routes")));
// bills
router.use(require(path.join(__dirname, "sells/", "sells.bills.routes")));

// render main view of dashboard, with a view parameter display just x parameters
router.get("/dashboard/", async (req, res) => {
    await initializeCart(req);
    await renderSellsDashboard(req, res);
});

module.exports = router;
