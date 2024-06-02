const express = require('express');
const router = express.Router();
const { render500Page, renderOperativeDashboard, checkStockSession, renderProductionNewStockConfirmation } = require('../../modules/utils/renders.common.utils.module');
const { addItemToStockSession, removeStockInSession, confirmNewStockInSession } = require('../../modules/production/production.stock.module');
const { updateStock, findStockByPK } = require('../../modules/admin/admin.products.module');


/**
 * Creates and initialize a new object in session if needed, this is not pre created to save data, we do not need
 * to save all data always, just depending on session
 */
router.get("/stock/add/", (req, res) => {
    checkStockSession(req);
    try {
        let { pledge_id, pledge_size, quantity, pledge_name } = req.query;
        let response = addItemToStockSession(parseInt(pledge_id), pledge_size, quantity, pledge_name, req);
        if (response.status === 400) {
            return renderOperativeDashboard(req, res, response.message);
        }
        return renderOperativeDashboard(req, res, response.message);
    } catch (error) {
        render500Page(res, "Unable to add item to stock session, please try again later. " + error)
    }
});

/**
 * Render the stock review page, so the operative can see the items to be added to stock and confirm the added items or edit any
 */
router.get("/stock/review/", (req, res) => {
    checkStockSession(req);
    try {
        return renderProductionNewStockConfirmation(req, res);
    } catch (error) {
        render500Page(res, "Unable to review stock, please try again later. " + error)
    }
});

/**
 * Delete a item prom stack, expect pledge_id and pledge_size in params
 */
router.get("/stock/delete/:pledge_id/:pledge_size", (req, res) => {
    checkStockSession(req);
    try {
        let { pledge_id, pledge_size } = req.params;
        let response = removeStockInSession(parseInt(pledge_id), pledge_size, req);
        return renderProductionNewStockConfirmation(req, res, response.message, '');
    } catch (error) {
        render500Page(res, "Unable to delete item from stock, please try again later. " + error)
    }
});

/**
 * Increase the stock of a pledge, expect pledge_id and pledge_size in params by 1
 */
router.get("/stock/increase/:pledge_id/:pledge_size", (req, res) => {
    checkStockSession(req);
    try {
        let { pledge_id, pledge_size } = req.params;
        let response = addItemToStockSession(parseInt(pledge_id), pledge_size, 1, 'TEST', req);
        if (response.status === 400) {
            return renderProductionNewStockConfirmation(req, res, '', response.message);
        }
        return renderProductionNewStockConfirmation(req, res, response.message, '');
    } catch (error) {
        render500Page(res, "Unable to increase stock, please try again later. " + error)
    }
});

/**
 * Decrease the stock of a pledge, expect pledge_id and pledge_size in params by 1
 */
router.get("/stock/decrease/:pledge_id/:pledge_size", (req, res) => {
    checkStockSession(req);
    try {
        let { pledge_id, pledge_size } = req.params;
        let response = addItemToStockSession(parseInt(pledge_id), pledge_size, -1, 'TEST', req);
        if (response.status === 400) {
            return renderProductionNewStockConfirmation(req, res, '', response.message);
        }
        return renderProductionNewStockConfirmation(req, res, response.message, '');
    } catch (error) {
        render500Page(res, "Unable to increase stock, please try again later. " + error)
    }
});

router.get("/stock/confirm/", async (req, res) => {
    checkStockSession(req);
    try {
        let newItems = req.session.new_stock_items;
        let building_id = req.session.user.location.id;
        let response = await confirmNewStockInSession(newItems, building_id, req)
        if (response.status != 200) {
            return renderProductionNewStockConfirmation(req, res, '', response.message);
        }
        return renderProductionNewStockConfirmation(req, res, response.message, '');
    } catch (error) {
        render500Page(res, "Unable to confirm stock, please try again later. " + error)
    }

});


module.exports = router;

