const path = require('path');
const { CART_SEARCH_TYPES, STOCK_FILTER_BY_PLEDGE_ID_AND_BUILDING_QUERY, STOCK_FILTER_BY_PLEDGE_NAME_AND_BUILDING_QUERY, STOCK_FILTER_BY_PLEDGE_SIZE_AND_BUILDING_QUERY, STOCK_FILTER_BY_BUILDING_QUERY, STOCK_FILTER_ALL_QUERY, STOCK_FILTER_BY_PLEDGE_ID_NOT_BUILDING_QUERY, STOCK_FILTER_BY_PLEDGE_NAME_NOT_BUILDING_QUERY, STOCK_FILTER_BY_PLEDGE_SIZE_NOT_BUILDING_QUERY, STOCK_UPDATE_QUERY } = require('../../config/consts');
const { findStockByPK, updateStock } = require('../admin/admin.products.module');
const db_connection = require(path.join(__dirname, "../database/db-connection"));

// generic function to send typeof query, and search id, to return custom promise
// send building -1 to return all rows from stock from all buildings
function searchStockByParameter(searchType, searchId, building = -1) {
    // check if searchId is null -> return all rows from current building stock
    if (searchId == '' || searchId == undefined || searchType == undefined) {
        return searchStockByBuilding(building);
    }
    // check searchType in switch case
    switch (searchType) {
        case CART_SEARCH_TYPES.ID:
            return searchStockById(Number(searchId), Number(building));
        case CART_SEARCH_TYPES.NAME:
            return searchStockByName(searchId, Number(building));
        case CART_SEARCH_TYPES.SIZE:
            return searchStockBySize(searchId, Number(building));
        default:
            throw new Error("Tipo de búsqueda invalido");
    }
}

// search by ID in stock, and current session building
async function searchStockById(id, building = -1) {
    let connection = await db_connection();
    // check if building is -1, return all rows from stock otherwise return rows from stock from current building
    let TMP_QUERY_STOCK_ID = building === -1 ? STOCK_FILTER_BY_PLEDGE_ID_NOT_BUILDING_QUERY : STOCK_FILTER_BY_PLEDGE_ID_AND_BUILDING_QUERY;
    return new Promise((resolve, reject) => {
        connection.query(TMP_QUERY_STOCK_ID, [id, building], (error, result) => {
            if (error) {
                reject("No hemos podido filtrar stock por id: " + error); // Reject the Promise if there is an error
            } else {
                resolve(result);  // Resolve the Promise with the result
            }
        });
    });
}

// search by name in stock, and current session building
async function searchStockByName(name, building = -1) {
    let connection = await db_connection();

    // check if building is -1, return all rows from stock otherwise return rows from stock from current building
    let TMP_QUERY_STOCK_PLEDGE_NAME = building === -1 ? STOCK_FILTER_BY_PLEDGE_NAME_NOT_BUILDING_QUERY : STOCK_FILTER_BY_PLEDGE_NAME_AND_BUILDING_QUERY;

    return new Promise((resolve, reject) => {
        connection.query(TMP_QUERY_STOCK_PLEDGE_NAME, [`%${name}%`, building], (error, result) => {
            if (error) {
                reject("No hemos podido filtrar stock por nombre: " + error); // Reject the Promise if there is an error
            } else {
                resolve(result);  // Resolve the Promise with the result
            }
        });
    });
}

// search by size in stock, and current session building
async function searchStockBySize(size, building = -1) {
    let connection = await db_connection();
    // check if building is -1, return all rows from stock otherwise return rows from stock from current building
    let TMP_QUERY_STOCK_SIZE = building === -1 ? STOCK_FILTER_BY_PLEDGE_SIZE_NOT_BUILDING_QUERY : STOCK_FILTER_BY_PLEDGE_SIZE_AND_BUILDING_QUERY;

    return new Promise((resolve, reject) => {
        connection.query(TMP_QUERY_STOCK_SIZE, [size, building], (error, result) => {
            if (error) {
                reject("No hemos podido filtrar stock por talla: " + error); // Reject the Promise if there is an error
            } else {
                resolve(result);  // Resolve the Promise with the result
            }
        });
    });
}

// return all stock from current building
async function searchStockByBuilding(building = -1) {
    let connection = await db_connection();
    // check if building is -1, return all rows from stock
    let TMP_QUERY_STOCK_BUILDINGS = building === -1 ? STOCK_FILTER_ALL_QUERY : STOCK_FILTER_BY_BUILDING_QUERY;
    return new Promise((resolve, reject) => {
        connection.query(TMP_QUERY_STOCK_BUILDINGS, [building], (error, result) => {
            if (error) {
                reject("No hemos podido filtrar stock por edificio: " + error); // Reject the Promise if there is an error
            } else {
                resolve(result);  // Resolve the Promise with the result
            }
        });
    });
}

// function to edit stock by id, and building, reduce stock
async function decrease_stock(building_id, inventory_pledge_id, inventory_size_id, stock_quantity) {
    let connection = await db_connection();
    // get current stock from pledge
    let _db_stock = await findStockByPK(building_id, inventory_pledge_id, inventory_size_id);
    // check if stock is undefined or json is empty
    if (_db_stock == undefined || _db_stock == {}) {
        return { error: true, message: "No se pudo encontrar stock en la base de datos" }
    }
    // check if stock is less than stock_quantity
    if (_db_stock.stock - stock_quantity < 0) {
        return { error: true, message: "No hay suficiente stock para hacer la venta" }
    }
    // update
    let db_result = await updateStock(building_id, inventory_pledge_id, inventory_size_id, _db_stock.stock - stock_quantity,);
    if (db_result.affectedRows === 0) {
        return { error: true, message: "No se pudo actualizar el stock en la base de datos" }
    }
    return { error: false, message: "Actualizado correctamente", data: db_result };
}
// export functions
module.exports = { searchStockByParameter, decrease_stock }