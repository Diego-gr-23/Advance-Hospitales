const path = require('path');
const { STOCK_SELECT_QUERY, BUILDING_SELECT_EXCLUDE_DIR, SIZE_SELECT_ALL_QUERY, STOCK_SELECT_BY_PK_QUERY, STOCK_UPDATE_QUERY } = require('../../config/consts');
const { getPledges } = require(path.join(__dirname, "./admin.pledges.module"));
const db_connection = require(path.join(__dirname, "../database/db-connection"));


// custom JSON generator and returner to display into mage
async function loadProducts() {
    _data = { stockable_pile: [], summary: { buildings: 0, pledges: 0, building_list: [], pledges_list: [] } }
    // get buildings
    _data.summary.building_list = await getBuildings();
    _data.summary.buildings = _data.summary.building_list.length;
    // get products
    _data.summary.pledges_list = await getPledges();
    _data.summary.pledges = _data.summary.pledges_list.length;
    // stockable info
    _data.stockable_pile = await generateProductsJSON(_data.summary.building_list, _data.summary.pledges_list);
    return _data;
}

// get buildings from DB
async function getBuildings() {
    let connection = await db_connection();

    return new Promise((resolve, reject) => {
        connection.query(BUILDING_SELECT_EXCLUDE_DIR, (error, result) => {
            if (error) {
                reject("No hemos podido encontrar edificios: " + error); // Reject the Promise if there is an error
            } else {
                resolve(result);  // Resolve the Promise with the result
            }
        });

    });
}

// Generate JSON with products and all custom data
async function generateProductsJSON(_buildings, _pledges) {
    try {

        // Map pledges to an array of promises for fetching stock availability
        const pledgePromises = _pledges.map(async _pledge => {
            const _pledge_node = { id: _pledge.id, name: _pledge.name, locations: [] };

            // Map buildings to an array of promises for fetching stock availability
            const locationPromises = _buildings.map(async _building => {
                try {
                    const stockAvailability = await getStockByBuildingAndPledge(_pledge.id, _building.id);
                    return { id: _building.id, name: _building.name, availability: stockAvailability };
                } catch (error) {
                    throw new Error(error);
                }
            });

            _pledge_node.locations = await Promise.all(locationPromises);

            return _pledge_node;
        });

        // Wait for all pledges' promises to resolve
        const pledgeNodes = await Promise.all(pledgePromises);

        return pledgeNodes;
    } catch (error) {
        throw new Error('Unable to generate products JSON: ' + error);
    }
}

// find stock by 3PK id on DB
async function findStockByPK(building_id, pledge_id, size_id) {
    try {
        // try to cast numbers
        building_id = Number(building_id);
        pledge_id = Number(pledge_id);
        let connection = await db_connection();
        data = await new Promise((resolve, reject) => {
            connection.query(STOCK_SELECT_BY_PK_QUERY, [pledge_id, size_id, building_id], (_error, _result) => {
                if (_error) {
                    reject("No se pudo encontrar datos para los datos proporcionados, llaves invalidas. " + _error);
                } else {
                    resolve(_result)
                }
            });
        });
        return { pname: data[0].pname, bname: data[0].bname, stock: data[0].stock }
    } catch (error) {
        throw new Error("Cannot get data from DB to stock by PK " + error)
    }
}

// update the stock on db
async function updateStock(building_id, pledge_id, size_id, stock) {
    try {
        console.log("Updating stock for pledge: " + pledge_id + " size: " + size_id + " stock: " + stock + " building: " + building_id);
        let connection = await db_connection();
        // check invalid stock
        if (stock < 0) throw new Error("Stock no puede ser negativo")
        data = await new Promise((resolve, reject) => {
            connection.query(STOCK_UPDATE_QUERY, [stock, building_id, pledge_id, size_id], (_error, _result) => {
                if (_error) {
                    reject("No se pudo actualizar los datos para el stock" + _error);
                } else {
                    resolve(_result)
                }
            });
        });
        return { message: "Se ha actualizado el stock", affectedRows: data.affectedRows }
    } catch (error) {
        throw new Error(error)
    }
}

// get sizes list FROM DB
async function getSizes() {
    let connection = await db_connection();
    return new Promise((resolve, reject) => {
        connection.query(SIZE_SELECT_ALL_QUERY, (error, result) => {
            if (error) {
                reject("No hemos podido encontrar tallas: " + error); // Reject the Promise if there is an error
            } else {
                resolve(result);  // Resolve the Promise with the result
            }
        });
    });
}

// Define a function to get stock availability
async function getStockByBuildingAndPledge(_pledge_id, _building_id) {
    let connection = await db_connection();
    return new Promise((resolve, reject) => {
        connection.query(STOCK_SELECT_QUERY, [_building_id, _pledge_id], (error, result) => {
            if (error) {
                reject("Unable to get stock availability: " + error);
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = { loadProducts, getBuildings, getSizes, findStockByPK, updateStock, getStockByBuildingAndPledge }