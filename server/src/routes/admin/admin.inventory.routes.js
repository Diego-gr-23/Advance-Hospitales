const express = require('express');
const router = express.Router();

const { getAllInventory, deleteProductFromInventory, searchInventoryByPK, updateProductFromInventory } = require('../../modules/admin/admin.inventory.module');
const { renderLoginPage } = require('../../modules/utils/renders.common.utils.module');

// INVENTORY ROUTES
// display a view with all inventory (ej. products by sizes and allow edit or delete)
router.get("/load-inventory", (req, res) => {
    try {
        renderInventoryList(req, res)
    } catch (error) {
        renderLoginPage(req, res, '', 'No hemos podido cargar el inventario ' + error);
    }
})

// fetches all inventory from DB and render a page
async function renderInventoryList(req, res, message = '', error_message = '') {
    try {
        // get data from DB and generate custom JSON
        db_inventory = await getAllInventory();
        res.render("users/admin/products/list-inventory", { name: req.session.user.id, message: message, error_message: error_message, data: db_inventory });
    } catch (error) {
        renderLoginPage(req, res, '', 'No hemos podido cargar el inventario ' + error);
    }
}

// delete a product from inventory (product and size)
router.get("/load-inventory/delete/:pledge_id/:pledge_size", async (req, res) => {
    try {
        let { pledge_id, pledge_size } = req.params;
        _response = await deleteProductFromInventory(pledge_id, pledge_size);
        if (_response[0]) {
            renderInventoryList(req, res, _response[1], '');
        } else {
            renderInventoryList(req, res, '', _response[1]);
        }
    } catch (error) {
        renderLoginPage(req, res, '', 'No ha sido posible borrar del inventario con la prenda' + pledge_id);
    }
});

// return a JSON with the inventory data for PK
router.get("/load-inventory/search/:pledge_id/:pledge_size", async (req, res) => {
    try {
        let { pledge_id, pledge_size } = req.params;
        _fetched_data = await searchInventoryByPK(pledge_id, pledge_size);
        if (!_fetched_data[0]) {
            res.status(404).json({ error: _fetched_data[1] })
        }
        res.status(200).json(_fetched_data[1]);
    } catch (error) {
        res.status(500).json({ error: 'Oops, a error just ocurred ' + error })
    }
});

router.post("/load-inventory/update/", async (req, res) => {
    try {
        let { Pledge_id, Size_id, price } = req.body;
        _response = await updateProductFromInventory(Pledge_id, Size_id, price);
        if (_response[0]) {
            renderInventoryList(req, res, _response[1], '');
        } else {
            renderInventoryList(req, res, '', _response[1]);
        }
    } catch (error) {
        renderInventoryList(req, res, '', 'Oops, a error just ocurred ' + error);
    }
});

module.exports = router;

