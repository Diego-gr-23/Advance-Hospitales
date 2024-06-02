const { DEFAULT_BILL_NIT, BILLS_SEARCH_TYPES, CART_SEARCH_TYPES } = require("../../config/consts");
const { getBuildings } = require("../admin/admin.products.module");
const { selectBillsBy, getBillDetailed } = require("../../modules/sells/sells.bills.module");
const { formatDate } = require("./dates.utils.module");
const { searchClientByNit } = require("../sells/sells.client.module");
const { searchStockByParameter } = require("../sells/sells.stock.module");

/**
 * Initialize shopping cart if necessary, this function is called by sells module to initialize cart
 * @param {*} req 
 * @param {*} reset_cart 
 * @returns 
 */
async function initializeCart(req, reset_cart = false) {
    try {
        // Check if the object has any keys
        if (req.session.shopping_cart === undefined || reset_cart) {
            req.session.shopping_cart = { client: {}, items: [] }
            // search default user
            _db_user = await searchClientByNit(DEFAULT_BILL_NIT);
            req.session.shopping_cart.client = _db_user;
        }
        return { error: false, message: "Carrito inicializado" }
    } catch (error) {
        return { error: true, message: "No se pudo inicializar el carrito. " + error }
    }
}

/**
 * multiuse function to render login page
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} message 
 * @param {*} error_message 
 */
async function renderLoginPage(req, res, message = "", error_message = "") {
    // fetch current locations to select
    let _buildings = await getBuildings();
    res.render("login", { message: message, error_message: error_message, buildings: _buildings });
}

// render a 500 page internal server error
function render500Page(res, error_message = "") {
    res.render("500", { error_message: error_message });
}

// render sells dashboard
async function renderSellsDashboard(req, res, message, error_message) {
    try {
        // initialize cart
        if (await initializeCart(req).error) {
            renderLoginPage(req, res, "", "No se pudo inicializar el carrito de compras.");
            return;
        }
        let data = await selectBillsBy(BILLS_SEARCH_TYPES.WORKER, req.session.user.id);
        if (data.error) {
            renderLoginPage(req, res, "", data.message);
        } else {
            res.render("users/sells/sells-view", { name: req.session.user.id, message: message, error_message: error_message, bills: data.bills, formatDate: formatDate, search_types: BILLS_SEARCH_TYPES });
        }
    } catch (error) {
        render500Page(res, "No hemos podido recuperar tu sesión. " + error);
    }
}

// render sub page for sells, clients actions
function renderSellsClientDashboard(req, res, message, error_message) {
    try {
        res.render('users/sells/clients/sells-client-view.ejs', { name: req.session.user.id, message, error_message })
    } catch (error) {
        render500Page(res, "No hemos podido recuperar tu sesión. " + error);
    }
}

// render a sub page for clients, list client/clients into a table, and allow actions
function renderSellsClientListDashboard(req, res, message, error_message, clients = []) {
    try {
        res.render('users/sells/clients/sells-client-list-view.ejs', { name: req.session.user.id, message, error_message, clients, DEFAULT_BILL_NIT: DEFAULT_BILL_NIT })
    } catch (error) {
        render500Page(res, "No hemos podido recuperar tu sesión. " + error);
    }
}

// render table with bills
function renderSellsBillsList(req, res, message, error_message, bills = []) {
    try {
        res.render('users/sells/bills/sells-bills-list-view.ejs', { name: req.session.user.id, message, error_message, bills, formatDate: formatDate })
    } catch (error) {
        render500Page(res, 'No se pudo generar el listado de facturas ' + error)
    }
}

// render a bill with the detail of bill_id
async function renderBillDetailView(req, res, message, error_message, bill_id) {
    try {
        let _db_response = await getBillDetailed(bill_id)
        // check any error message from method
        if (_db_response.error) {
            renderSellsDashboard(req, res, '', _db_response.message)
            return
        }
        db_bill = { bill: _db_response.bill, details: _db_response.details }
        res.render('users/sells/bills/sells-bill-detail-view.ejs', { name: req.session.user.id, message, error_message, db_bill, formatDate: formatDate })
    } catch (error) {
        render500Page(res, 'No se pudo generar el listado de facturas ' + error)
    }
}

async function renderOperativeDashboard(req, res, message = '', error_message = '') {
    return renderOperativeDashboard(req, res, '', '', message, error_message);
}

/**
 * Common function to render operative dashboard, this function searches for all stock so operative can set + stock in current building by session
 * @param {*} req 
 * @param {*} res 
 * @param {*} message 
 * @param {*} error_message 
 */
async function renderOperativeDashboard(req, res, searchType, searchId, message = '', error_message = '') {
    try {
        let db_data = await findStockAllItems(searchType, searchId, req.session.user.location.id);
        if (db_data.error) {
            return render500Page(res, "No hemos podido recuperar los datos de stock. " + db_data.message);
        }
        return res.render("users/production/production-view", {
            name: req.session.user.id,
            message: message,
            error_message: error_message,
            products: db_data.data,
            filterTypes: CART_SEARCH_TYPES,
            avoid_building: true,            // no filter 'cause this is just a re implement of an existing function
            building: req.session.user.location,
            form_uri: "/production/dashboard" // POST reference by ejs
        });
    } catch (error) {
        render500Page(res, "No hemos podido recuperar tu sesión. " + error);
    }
}


/**
 * Find stock by parameter and render view of operative so is able to save values
 * @param {*} searchType type to search | ENUM
 * @param {*} searchId  the id to search
 * @param {*} avoid_building true or false to search in all buildings
 */
async function findStockAllItems(searchType, searchId, building_id) {
    // fetch promises to get data from stock
    return await searchStockByParameter(searchType, searchId, building_id).then((data) => {
        return { error: false, data: data, message: "Búsqueda completada" };
    }).catch((error) => {
        return { error: true, data: [], message: error };
    });
}

/**
 * Render production new stock confirmation
 */
async function renderProductionNewStockConfirmation(req, res, message = '', error_message = '') {
    try {
        checkStockSession(req);
        return res.render("users/production/production-new-stock-confirmation", { name: req.session.user.id, message: message, error_message: error_message, stock_session: req.session.new_stock_items });
    } catch (error) {
        render500Page(res, "Error al renderizar el nuevo stock . " + error);
    }
}

/**
 * Initialize stock session to save new values by operative
 * @param {*} req 
 */
function checkStockSession(req, reset = false) {
    if (!req.session.new_stock_items || reset) {
        req.session.new_stock_items = [];
    }
}

module.exports = {
    renderLoginPage, render500Page, renderSellsDashboard, renderSellsClientDashboard, renderSellsClientListDashboard,
    renderSellsBillsList, renderBillDetailView, initializeCart, renderOperativeDashboard, renderOperativeDashboard, checkStockSession, renderProductionNewStockConfirmation
};