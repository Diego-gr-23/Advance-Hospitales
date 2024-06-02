const path = require('path')
const db_connection = require(path.join(__dirname, "../database/db-connection"));
const { getBuildings } = require(path.join(__dirname, "./admin.products.module"));
const { BUILDING_INSERT_QUERY, BUILDING_UPDATE_QUERY, BUILDING_SEARCH_ID_QUERY, BUILDING_DELETE_QUERY } = require('../../config/consts');



// return all products from DB
async function listBuildings() {
    return await getBuildings()
}

// insert a new building to DB
async function insertBuilding(building_name, building_direction) {
    try {
        // Check valid inputs
        if (building_name === '' || building_direction === '') {
            return [false, 'Valores ingresados inválidos'];
        }
        let connection = await db_connection();
        // Perform the insert query
        const result = await new Promise((resolve, reject) => {
            connection.query(BUILDING_INSERT_QUERY, [building_name, building_direction], (error, result) => {
                if (error) {
                    reject("No se ha podido insertar el edificio: " + error);
                } else {
                    resolve(result);
                }
            });
        });
        // If the query was successful, return true
        return [true, "Edificio insertado correctamente"];
    } catch (error) {
        return [false, "No se ha podido insertar el edificio: " + error];
    }
}

// searches building by id
async function searchBuilding(building_id) {
    // use promises to send the result
    try {
        let connection = await db_connection();

        const result = await new Promise((resolve, reject) => {
            connection.query(BUILDING_SEARCH_ID_QUERY, [building_id], (error, _result) => {
                if (error) {
                    reject("No se ha podido encontrar el edificio con id " + building_id + " ERROR " + error);
                } else {
                    resolve(_result);
                }
            });
        });
        return [true, { id: result[0].id, name: result[0].name, direction: result[0].direction }];
    } catch (error) {
        return [false, "No se ha podido encontrar el edificio con id " + building_id + " ERROR " + error];
    }
}


// update a building into the DB
async function updateBuilding(building_id, building_name, building_direction) {
    try {
        if (typeof (building_id) == 'undefined' || typeof (building_name) == undefined || typeof (building_id) == 'undefined') {
            return [false, "Atributo/os no valido/os"]
        }

        let connection = await db_connection();

        const result = await new Promise((resolve, reject) => {
            connection.query(BUILDING_UPDATE_QUERY, [building_name, building_direction, building_id], (_error, _result) => {
                if (_error) {
                    reject("No se ha podido editar el edificio: " + _error)
                } else {
                    resolve(_result)
                }
            });
        });
        return [true, { message: "Edificio con id " + building_id + " editado correctamente " }]
    } catch (error) {
        return [false, "No se ha podido editar el edificio: " + error]
    }
}

// DELETE a building from DB
async function deleteBuilding(building_id) {
    try {
        if (typeof (building_id) == 'undefined') {
            return [false, "No se reconoce el id"]
        }
        // fetch result
        let connection = await db_connection();
        const result = await new Promise((resolve, reject) => {
            connection.query(BUILDING_DELETE_QUERY, [building_id], (_error, _result) => {
                if (_error) {
                    reject("No se pudo borrar el edificio seleccionado, este edificio es usado en otras consultas")
                } else {
                    resolve(_result)
                }
            })
        })
        return [true, { message: "Se ha borrado el edificio con id " + building_id, col_modified: result }]
    } catch (error) {
        return [false, "No se pudo borrar el edificio " + error]
    }
}

module.exports = { listBuildings, insertBuilding, updateBuilding, searchBuilding, deleteBuilding }