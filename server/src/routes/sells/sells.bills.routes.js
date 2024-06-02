const express = require('express');
const { selectBillsBy, cancelBill } = require('../../modules/sells/sells.bills.module');
const { BILLS_SEARCH_TYPES } = require('../../config/consts');
const { renderSellsDashboard, render500Page, renderSellsBillsList, renderBillDetailView } = require('../../modules/utils/renders.common.utils.module');
const router = express.Router();

// common function to check any error or render bills list
function renderBillsEJS(req, res, _db_rows, message = '', error_message = '') {
    // check if error at _db_rows
    if (_db_rows.error) {
        renderSellsDashboard(req, res, '', _db_rows.message);
        return
    }
    // render list with bills
    renderSellsBillsList(req, res, message, error_message, _db_rows.bills)
}

// list all bills in DB
router.get("/bills/list/all/", async (req, res) => {
    try {
        // fetch from DB values calling sells.bills.module
        let _db_rows = await selectBillsBy(BILLS_SEARCH_TYPES.NO_FILTER, null)
        // check if error at _db_rows
        renderBillsEJS(req, res, _db_rows)
    } catch (error) {
        render500Page(res, `Error al listar todas las facturas ${error}`)
    }
});

// searches for an specific bill by id
router.get("/bills/list/:id", async (req, res) => {
    try {
        // fetch from DB values calling sells.bills.module
        let { id } = req.params; // recover query from parameter
        // check if id is valid
        if (!id) {
            renderSellsDashboard(req, res, '', 'ID invalido')
            return;
        }
        let _db_rows = await selectBillsBy(BILLS_SEARCH_TYPES.ID, id)
        renderBillsEJS(req, res, _db_rows)
    } catch (error) {
        render500Page(res, `Error al buscar la factura por id ${error}`)
    }
})

// searches for any bill(s) by key and values to filter
router.post("/bills/list/", async (req, res) => {
    try {
        // fetch from DB values calling sells.bills.module
        let { data_search, search_type } = req.body;  // recover values from body
        // check type search
        if (!search_type || !data_search) {
            renderSellsDashboard(req, res, '', 'El tipo de búsqueda debe ser seleccionado')
            return
        }
        let _db_rows = await selectBillsBy(search_type, data_search)
        renderBillsEJS(req, res, _db_rows)
    } catch (error) {
        render500Page(res, `Error al buscar factura ${error}`)
    }
})

// function to display info about a bill
router.get("/bills/detail/:id", async (req, res) => {
    try {
        let id = req.params.id;
        // check if id is valid
        if (!id) {
            renderSellsDashboard(req, res, '', 'ID invalido')
            return;
        }
        // render bill detail
        renderBillDetailView(req, res, '', '', id)
    } catch (error) {
        render500Page(res, `Error al desplegar información sobre factura ${error}`)
    }
})

// cancel a bill
router.get("/bills/cancel/:id", async (req, res) => {
    try {
        let id = req.params.id;
        // check if id is null or empty
        if (!id) {
            renderSellsDashboard(req, res, '', 'ID invalido')
            return;
        }
        // cancel bill
        let response = await cancelBill(id, req.session.user.location.id);
        // check if error
        if (response.error) {
            renderSellsDashboard(req, res, '', response.message)
            return
        }
        renderSellsDashboard(req, res, response.message, '')
    } catch (error) {
        render500Page(res, `Error al cancelar factura ${error}`)
    }
});

module.exports = router;

