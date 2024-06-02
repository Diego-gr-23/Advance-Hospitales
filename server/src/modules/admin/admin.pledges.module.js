const path = require('path');
const { PLEDGE_SELECT_QUERY, PLEDGE_SELECT_BY_PK_QUERY, PLEDGE_UPDATE_QUERY, PLEDGE_DELETE_QUERY, PLEDGE_INSERT_QUERY, INVENTORY_INSERT_QUERY } = require('../../config/consts');
const { insertInventory } = require('./admin.inventory.module');
const db_connection = require(path.join(__dirname, "../database/db-connection"));

// get all pledges from DB
async function getPledges() {
    let connection = await db_connection();
    return new Promise((resolve, reject) => {
        connection.query(PLEDGE_SELECT_QUERY, (error, result) => {
            if (error) {
                reject("No hemos podido encontrar prendas: " + error); // Reject the Promise if there is an error
            } else {
                resolve(result);  // Resolve the Promise with the result
            }
        });
    });
}

// get pledge by id from DB
async function getPledgeById(pledge_id) {
    try {
        let connection = await db_connection();
        db_data = await new Promise((resolve, reject) => {
            connection.query(PLEDGE_SELECT_BY_PK_QUERY, [pledge_id], (error, result) => {
                if (error) {
                    reject("No hemos podido encontrar la prenda: " + error); // Reject the Promise if there is an error
                } else {
                    resolve(result);  // Resolve the Promise with the result
                }
            });
        });
        return [true, { id: db_data[0].id, name: db_data[0].name }]
    } catch (error) {
        return [false, error];
    }
}

// update a pledge on DB
async function updatePledge(pledge_id, pledge_name) {
    try {
        let connection = await db_connection();
        db_data = new Promise((resolve, reject) => {
            connection.query(PLEDGE_UPDATE_QUERY, [pledge_name, pledge_id], (error, result) => {
                if (error) {
                    reject("No hemos podido actualizar la prenda: " + error); // Reject the Promise if there is an error
                } else {
                    resolve(result);  // Resolve the Promise with the result
                }
            });
        });
        return [true, "Prenda actualizada para el id: " + pledge_id];
    } catch (error) {
        return [false, error];
    }
}

// delete a pledge from DB
async function deletePledge(pledge_id) {
    try {
        let connection = await db_connection();
        db_data = await new Promise((resolve, reject) => {
            connection.query(PLEDGE_DELETE_QUERY, [pledge_id], (error, result) => {
                if (error) {
                    reject("No se puede borrar un registro que ya esta siendo usado en otras consultas"); // Reject the Promise if there is an error
                } else {
                    resolve(result);  // Resolve the Promise with the result
                }
            });
        });
        return [true, "Prenda eliminada para el id: " + pledge_id];
    } catch (error) {
        return [false, error];
    }
}


// insert a pledge on DB
async function insertPledge(pledge_name) {
    // insert pledge
    try {
        let connection = await db_connection();
        // pledge name to uppercase
        pledge_name = pledge_name.toUpperCase();
        let pledge_id = await new Promise((resolve, reject) => {
            connection.query(PLEDGE_INSERT_QUERY, [pledge_name], (error, result) => {
                if (error) {
                    reject("No se pudo insertar la prenda: " + error);
                } else {
                    resolve(result.insertId);
                }
            });
        });
        return [true, pledge_id];
    } catch (error) {
        return [false, "No se pudo crear la prenda: " + error];
    }
}

// CREATE A PLEDGE USING TRANSACTIONS
// sizes: [{size: "S", price: 100}, {size: "M", price: 200}, {size: "L", price: 300}]
async function createPledge(pledge_name, sizes) {
    try {
        let connection = await db_connection();

        let fetched_data = await new Promise((resolve, reject) => {
            let aborted_transaction = false;
            let message = "";
            connection.beginTransaction(async (error) => {
                try {
                    if (error) { throw Error("Transacción imposible de iniciar") }  // invalid transaction
                    let _pledge_status = await insertPledge(pledge_name);
                    if (!_pledge_status[0]) { throw Error("No se pudo insertar la prenda") }  // invalid insert for pledge
                    let _inventory_status = await insertInventory(_pledge_status[1], sizes);
                    if (!_inventory_status[0]) { throw Error(_inventory_status[1]) }  // invalid insert for inventory
                    message = "Se ha insertado la prenda con éxito"
                } catch (error) {
                    aborted_transaction = true;
                    message = error;
                } finally {
                    if (aborted_transaction) {
                        connection.rollback();
                        reject([false, message]);
                    } else {
                        connection.commit();
                        resolve([true, message])
                    }
                }
            });
        });
        return fetched_data;
    } catch (error) {
        return [false, error];
    }
}


module.exports = { getPledges, getPledgeById, updatePledge, deletePledge, createPledge }