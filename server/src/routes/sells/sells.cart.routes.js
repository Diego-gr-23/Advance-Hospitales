const express = require('express');
const router = express.Router();

const { CART_SEARCH_TYPES } = require("../../config/consts");
const { searchStockByParameter } = require('../../modules/sells/sells.stock.module');
const { addItemToCart, editCart, deleteFromCart, decreaseFromCart, increaseFromCart, generateBIll } = require('../../modules/sells/sells.cart.module');

const { renderLoginPage, render500Page, renderSellsClientDashboard, initializeCart } = require('../../modules/utils/renders.common.utils.module');
const { searchClientByNit } = require('../../modules/sells/sells.client.module');

// renders shopping cart view
async function renderShoppingCart(req, res, message = "", error_message = "") {
    initializeCart(req);
    try {
        // check if cart is empty
        await initializeCart(req);
        res.render("users/sells/cart/shopping-cart-list.ejs", { name: req.session.user.id, message: message, error_message: error_message, shopping_cart: req.session.shopping_cart })
    } catch (error) {
        renderLoginPage(req, res, '', "No hemos podido recuperarnos de un error, " + error.message)
    }
}

// functions
// render items list for current session
function renderItemsSearched(req, res, message, error_message, data = [], avoid_building = false) {
    try {
        // initialize cart if empty
        initializeCart(req);
        res.render("users/sells/cart/add-item-cart", { name: req.session.user.id, message: message, error_message: error_message, filterTypes: CART_SEARCH_TYPES, data: data, building: req.session.user.location, avoid_building, form_uri: "/sells/stock/search" });
    } catch (error) {
        render500Page(res, "No hemos podido recuperar tu sesión. " + error);
    }
}

// function to search on db and render a page with the results, user or not building
// send no parameter to building to avoid filtering
async function fetchStockSearchUsingBuilding(building = -1) {
    return await searchStockByParameter('', "", building);
}


// TMP testing page to create a new sell
router.get("/stock/search/", async (req, res) => {
    initializeCart(req);
    // display all values by default
    let data = await fetchStockSearchUsingBuilding(req.session.user.location.id);
    renderItemsSearched(req, res, "", "", data);
});

// search items in cart
router.post("/stock/search/", async (req, res) => {
    initializeCart(req);
    try {
        let { searchType, searchId, avoid_building = false } = req.body;
        avoid_building = avoid_building === 'true';
        // check the building_id to use
        let TMP_BUILDING_ID = avoid_building ? -1 : req.session.user.location.id;
        // fetch promises to get data from stock
        searchStockByParameter(searchType, searchId, TMP_BUILDING_ID).then((data) => {
            renderItemsSearched(req, res, "Búsqueda completada", "", data, avoid_building);
            return data;
        }).catch((error) => {
            renderItemsSearched(req, res, "", error, [], avoid_building);
        });
    } catch (error) {
        render500Page(res, error);
    }
});

// add item to cart
router.post("/cart/add/", async (req, res) => {
    // check if cart is empty
    initializeCart(req);
    // recover deleted cart
    let data = await searchStockByParameter(CART_SEARCH_TYPES.ID, req.body.pledge_id, req.session.user.location.id).then((data) => {
        return data;
    }).catch((error) => {
        renderItemsSearched(req, res, "", error);
        return;
    });

    // async call to add to cart
    await addItemToCart(req, res).then((result) => {
        if (result.error) {
            throw new Error(result.message);
        }
        return result.message;
    }).then(message => {
        renderItemsSearched(req, res, message, '', data)
        return;
    }).catch((error) => {
        renderItemsSearched(req, res, "", error, data);
        return;
    });
});

// render a main page with the cart
router.get("/cart/list/", async (req, res) => {
    initializeCart(req);
    await renderShoppingCart(req, res);
})

// update a element from cart
router.post("/cart/edit/:pledge_id/:pledge_size", async (req, res) => {
    initializeCart(req);
    try {
        let { pledge_id, pledge_size } = req.params;
        let { extras_note, extras_price, quantity, extras_note_old, extras_price_old } = req.body;
        let json_object = { pledge_id: Number(pledge_id), pledge_size, quantity: Number(quantity), extras: {} }
        let _old_json_extras = {}
        if (extras_note != undefined && extras_price != undefined) {
            json_object.extras = { extras_note, extras_price: Number(extras_price) }
            _old_json_extras = { extras_note: extras_note_old, extras_price: Number(extras_price_old) }
        }
        let response = await editCart(json_object, req.session, _old_json_extras)
        if (response.error) {
            renderShoppingCart(req, res, '', response.message)
        } else {
            renderShoppingCart(req, res, response.message, '')
        }
    } catch (error) {
        render500Page(res, "No hemos podido recuperarnos de un error inesperado " + error.message);
    }
});

// remove a item from cart
router.get("/cart/remove/:pledge_id/:pledge_size/:with_extras", (req, res) => {
    initializeCart(req);
    try {
        let { pledge_id, pledge_size, with_extras } = req.params;
        let response;
        with_extras = with_extras === 'true';
        // get response
        if (with_extras) {
            let { extras_note, extras_price } = req.query;
            response = deleteFromCart(Number(pledge_id), pledge_size, req.session, { extras_note, extras_price: Number(extras_price) });
        } else {
            response = deleteFromCart(Number(pledge_id), pledge_size, req.session);
        }
        // check response status
        if (response.error) {
            renderShoppingCart(req, res, "", response.message);
        } else {
            renderShoppingCart(req, res, response.message, "");
        }
    } catch (error) {
        render500Page(res, "No hemos podido continuar con las operaciones del carro de compras " + error.message);
    }
});

// decrease by 1 a element from cart, if 0 -> delete
router.get("/cart/decrease-one/:pledge_id/:pledge_size/:with_extras", async (req, res) => {
    initializeCart(req);
    try {
        let { pledge_id, pledge_size, with_extras } = req.params;
        with_extras = with_extras === 'true';
        // check response status
        let response;
        if (with_extras) {
            let { extras_note, extras_price } = req.query;
            response = decreaseFromCart(Number(pledge_id), pledge_size, req.session, { extras_note, extras_price: Number(extras_price) });

        } else {
            response = decreaseFromCart(Number(pledge_id), pledge_size, req.session);
        }
        if (response.error) {
            renderShoppingCart(req, res, "", response.message);
        } else {
            renderShoppingCart(req, res, response.message, "");
        }
    } catch (error) {
        render500Page(res, "No hemos podido continuar con las operaciones del carro de compras " + error.message);
    }
});

// decrease by 1 a element from cart, if 0 -> delete
router.get("/cart/increase-one/:pledge_id/:pledge_size/:with_extras", async (req, res) => {
    initializeCart(req);
    try {
        let { pledge_id, pledge_size, with_extras } = req.params;
        with_extras = with_extras === 'true';
        let response;
        if (with_extras) {
            let { extras_note, extras_price } = req.query;
            response = await increaseFromCart(Number(pledge_id), pledge_size, req.session, { extras_note, extras_price: Number(extras_price) });
        } else {
            response = await increaseFromCart(Number(pledge_id), pledge_size, req.session);
        }
        // check response status
        if (response.error) {
            renderShoppingCart(req, res, "", response.message);
        } else {
            renderShoppingCart(req, res, response.message, "");
        }
    } catch (error) {
        render500Page(res, error.message);
    }
});

// find client and render a page with the cart + client
router.post("/cart/search-client/", async (req, res) => {
    initializeCart(req);
    try {
        // check if cart is empty
        initializeCart(req);
        // search for client
        let { client_nit } = req.body;
        await searchClientByNit(client_nit).then(client => {
            // check if client is empty
            if (client === undefined) {
                // redirect to add client page
                renderSellsClientDashboard(req, res, `No existe un usuario con NIT ${client_nit}, por favor ingresa los datos`, "")
            } else {
                req.session.shopping_cart.client = client;
                renderShoppingCart(req, res, "Usuario encontrado, se ha guardado, genera la factura ahora");
            }
        }).catch(error => {
            renderShoppingCart(req, res, "", error);
        });
    } catch (error) {
        render500Page(res, error.message);
    }
});


// generate a sell
router.get("/cart/checkout/", async (req, res) => {
    initializeCart(req);
    try {
        let response = await generateBIll(req.session.shopping_cart, req.session.user);
        if (response.error) {
            renderShoppingCart(req, res, "", response.message);
        } else {
            let bill_id = response.bill_id; // recover bill id -> forward to /sells/bills/detail/:bill_id
            // reset cart
            await initializeCart(req, true)
            res.redirect(`/sells/bills/detail/${bill_id}`);
        }
    } catch (error) {
        render500Page(res, error);
    }
});

// render a view to check stock in other buildings
router.get("/stock/check/", async (req, res) => {
    initializeCart(req);
    try {
        let _data = await fetchStockSearchUsingBuilding();
        renderItemsSearched(req, res, "", "", _data, true);
    } catch (error) {
        render500Page(res, error);
    }
});

module.exports = router;