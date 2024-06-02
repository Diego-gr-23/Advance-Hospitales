const path = require('path');
const { findStockByPK, updateStock } = require('../admin/admin.products.module');
const { checkStockSession } = require('../utils/renders.common.utils.module');
const db_connection = require(path.join(__dirname, "../database/db-connection"));

// object stored in session to save data
class NewProductStock {
    constructor(id, size, ammount, name) {
        this.id = id;
        this.size = size;
        this.ammount = ammount;
        this.name = name;
    }

    match(compare_product) {
        try {
            return compare_product.id === this.id && compare_product.size === this.size;
        } catch (error) {
            return false;
        }
    }
}

/**
 * Add current item to stock session, if already exists, sum the ammount, expect pledge_id, quantity and pledge_size in request 
 * @param {*} req all data in request
 * @returns operation http status and message
 */
function addItemToStockSession(pledge_id, pledge_size, quantity, pledge_name, req) {
    // check if we have the item in object session, if not create it or sum it if exists
    if (!pledge_id || !quantity || !pledge_size || !pledge_name) {
        console.log(`Invalid parameters for addItemToStockSession: ${pledge_id}, ${quantity}, ${pledge_size}, ${pledge_name}`);
        return { status: 400, message: 'Parámetros inválidos para la operación' }; // invalid operation, do not continue
    }
    // new product declaration, check if exist in session and add it
    let new_product = new NewProductStock(parseInt(pledge_id), pledge_size, parseInt(quantity), pledge_name);
    let index = searchStockInSession(req, new_product);
    if (index === -1) {
        req.session.new_stock_items.push(new_product);
    } else {
        req.session.new_stock_items[index].ammount += new_product.ammount;
        // if the ammount is 0, remove the item from the array
        if (req.session.new_stock_items[index].ammount <= 0) {
            removeStockInSession(pledge_id, pledge_size, req);
        }
    }
    return { status: 200, message: 'Operación exitosa' };
}

/**
 * Searches if a stock is already in session or not
 * @param {*} req all data in the request
 * @param {*} new_product new product to add
 * @returns 
 */
function searchStockInSession(req, new_product) {
    if (!new_product) {
        return -1; // do nothing
    }
    // iterate over array until we find the item with same id, and size
    for (let index = 0; index < req.session.new_stock_items.length; index++) {
        let vector_product = req.session.new_stock_items[index];
        if (new_product.match(vector_product)) {
            return index; // Return the index if a match is found
        }
    }
    return -1; // Return -1 if no match is found
}

/**
 * Remove stock in current new stock session, expect pledge_id and pledge_size in params
 * @param {*} pledge_id 
 * @param {*} pledge_size 
 * @param {*} req 
 * @returns 
 */
function removeStockInSession(pledge_id, pledge_size, req) {
    if (!pledge_id || !pledge_size) {
        return -1; // do nothing
    }
    // iterate over array until we find the item with same id, and size
    let index = searchStockInSession(req, new NewProductStock(parseInt(pledge_id), pledge_size, 0, ''));
    if (index !== -1) {
        req.session.new_stock_items.splice(index, 1);
        return { status: 200, message: 'Eliminado correctamente' };
    }
    return { status: 205, message: 'No se encontró el elemento a eliminar' };
}
/**
 * Confirm the new stock of each element
 * @param {*} newItems items in session
 * @param {*} building_id  building_id to update stock
 * @returns 
 */
async function confirmNewStockInSession(newItems, building_id, req) {
    if (!building_id || !newItems) { return { status: 405, message: "Parámetros inválidos enviados en la operación" } }
    if (newItems.length === 0) { return { status: 405, message: "No existen items" } }

    let connection = await db_connection();
    try {
        connection.beginTransaction(); // init transaction
        // update stock in each element in vector
        newItems.forEach(async item => {
            let current_stock = await findStockByPK(building_id, item.id, item.size);
            item.ammount += current_stock.stock;
            if (!current_stock) {
                throw new Error("Producto no encontrado, un atributo en el listado no es valido");
            }
            let result = await updateStock(building_id, item.id, item.size, item.ammount);
            if (result.affectedRows === 0) {
                throw new Error("No se pudo actualizar el stock en la base de datos");
            }
        });
        checkStockSession(req, true); // reset session stock
        connection.commit();
        return { status: 200, message: 'Se ha actualizado el stock en los productos previamente agregados' };
    } catch (error) {
        connection.rollback(); // abort operation    
        return { status: 500, message: error.message }
    }
}

module.exports = { NewProductStock, addItemToStockSession, removeStockInSession, confirmNewStockInSession }