const path = require('path');
const { GET_ALL_EXPENSE_TYPE_QUERY, EXPENSE_TYPE_INSERT_QUERY, EXPENSE_INSERT_QUERY, EXPENSE_TYPE_READ_ID_QUERY, EXPENSE_TYPE_UPDATE_QUERY, EXPENSE_TYPE_DELETE_QUERY,
    EXPENSE_SELECT_PROCEDURE, EXPENSE_DELETE_QUERY, EXPENSE_UPDATE_QUERY, EXPENSE_SELECT_ID_QUERY, ROLES } = require('../../config/consts');
const { swapDatesIfPossible } = require('../utils/dates.utils.module');
const db_connection = require(path.join(__dirname, "../database/db-connection"));


// search all expenses type on DB and return fetched data, empty if null, error if invalid call
async function getAllExpenseType() {
    let connection = await db_connection();

    return new Promise((resolve, reject) => {
        connection.query(GET_ALL_EXPENSE_TYPE_QUERY, (error, result) => {
            if (error) {
                reject("No hemos podido encontrar los tipos de gastos en la BD " + id); // Reject the Promise if there is an error
            } else {
                resolve(result);  // Resolve the Promise with the result
            }
        });
    });
}

// find an expense by ID
async function findExpenseTypeById(_id) {
    let connection = await db_connection();

    return new Promise((resolve, reject) => {
        connection.query(EXPENSE_TYPE_READ_ID_QUERY, [_id], (error, result) => {
            // check valid id
            if (!_id) reject("No has ingresado un ID valido") // Reject if invalid id, ej. NaN, undefined...
            if (error) {
                reject("No hemos podido encontrar el gasto en la BD " + id); // Reject the Promise if there is an error
            } else {
                resolve({ id: result[0].id, name: result[0].name });  // Resolve the Promise with the result
            }
        });
    });
}

// inset an expense type into DB
async function insertExpenseType(_expense_name = '', _worker_id = '') {
    let connection = await db_connection();

    return new Promise((resolve, reject) => {
        // check if _expense_type is invalid
        if (!_expense_name) reject('No has ingresado un valor valido para el tipo de gasto')
        // check if user is invalid
        if (!_worker_id) reject('No es un usuario valido el que ha insertado el gasto')
        // check if a no admin is trying to insert the expense
        if (!_worker_id.includes(ROLES.ADMIN.TAG)) reject("No estas autorizado para ejecutar esta operación")
        // valid operation, continue to insert
        connection.query(EXPENSE_TYPE_INSERT_QUERY, [_expense_name], (error, result) => {
            if (error) {
                reject(`No se ha podido insertar el tipo de gasto, ${error}`)
            } else {
                resolve(`Se ha insertado el tipo de gasto ${_expense_name.toLowerCase()}`)
            }
        });
    });
}

// update expense type
async function updateExpenseType(_id = '', _name = '') {
    let connection = await db_connection();

    return new Promise((resolve, reject) => {
        // check if _id is invalid
        if (!_id) reject('No has ingresado un valor valido para el tipo de gasto')
        // check if _name is invalid
        if (!_name) reject('No has ingresado un valor valido para el tipo de gasto')
        // cast id to int
        _id = Number.parseInt(_id);

        // valid operation, proceed to insert
        connection.query(EXPENSE_TYPE_UPDATE_QUERY, [_name, _id], (error) => {
            if (error) {
                reject(`No se ha podido actualizar el tipo de gasto, ${error}`)
            } else {
                resolve(`Se ha actualizado el tipo de gasto ${_name.toLowerCase()}`)
            }
        });
    });
}

// DELETE EXPENSE TYPE
async function deleteExpenseType(_id = '') {
    let connection = await db_connection();

    return new Promise((resolve, reject) => {
        // check if _id is invalid
        if (!_id) reject('No has ingresado un valor valido para el tipo de gasto')
        // cast id to int
        _id = Number.parseInt(_id);
        // valid operation, proceed to insert
        connection.query(EXPENSE_TYPE_DELETE_QUERY, [_id], (error, result) => {
            if (error) {
                reject(`No puedes borrar valores que ya hayan sido usados en un registro de gastos`)
            } else {
                resolve(`Se ha borrado el tipo de gasto ${_id} | Registros afectados ${result.affectedRows}`)
            }
        });
    });
}


// insert into DB a new expense type
async function insertExpense(_amount = 0, _worker_id = '', _expense_type = '') {
    let connection = await db_connection();

    return new Promise((resolve, reject) => {
        // check if amount is > 0
        if (_amount < 0) reject('No puedes ingresar valores menores a 0')
        // check if _expense_type is invalid
        if (!_expense_type) reject('No has ingresado un valor valido para el tipo de gasto')
        // check if user is invalid
        if (!_worker_id) reject('No es un usuario valido el que ha insertado el gasto')
        // check if a no admin is trying to insert the expense
        if (!_worker_id.includes(ROLES.ADMIN.TAG)) reject("No estas autorizado para ejecutar esta operación")
        // valid operation, proceed to insert
        let _date = new Date();         // configure date to current date
        _amount = Number.parseFloat(_amount) // cast to double
        connection.query(EXPENSE_INSERT_QUERY, [_amount, _date, _worker_id, _expense_type], (error) => {
            if (error) {
                reject(`No se ha podido insertar gasto, ${error}`)
            } else {
                resolve(`Se ha insertado el gasto de Q${_amount} correctamente`)
            }
        });
    });
}

// list all expenses on DB
async function listExpensesByFilter(_init_date = null, _end_date = null) {
    // get dates 
    let _dates = swapDatesIfPossible(_init_date, _end_date);
    _init_date = _dates.init_date;
    _end_date = _dates.end_date;
    // call procedure to get dynamically data
    let connection = await db_connection();
    return new Promise((resolve, reject) => {
        // call procedure
        connection.query(EXPENSE_SELECT_PROCEDURE, [_init_date, _end_date], (error, result) => {
            if (error) {
                reject({ message: `No se puede filtrar por los valores dados ${_init_date} ${_end_date}`, error: error })
            } else {
                resolve(result[0]) // return rows on DB
            }
        });
    });
}

// delete a expense from DB
async function deleteExpenseById(_id) {
    let connection = await db_connection();
    return new Promise((resolve, reject) => {
        // check valid id
        if (!_id) reject("Id invalido")
        // try to delete
        connection.query(EXPENSE_DELETE_QUERY, [_id], (error, result) => {
            if (error) {
                reject("No hemos podido borrar el gasto en la BD " + id); // Reject the Promise if there is an error
            } else {
                resolve(`Se ha borrado el gasto con el id ${_id} | Cambios realizados: ${result.affectedRows}`);  // Resolve the Promise with the result
            }
        });
    });
}

// search a expense by ID
async function searchExpenseById(_id) {
    let connection = await db_connection();
    return new Promise((resolve, reject) => {
        if (!_id) reject("Datos inválidos") // Reject if invalid id
        connection.query(EXPENSE_SELECT_ID_QUERY, [_id], (error, result) => {
            if (error) reject("No se ha podido encontrar el gasto")
            else resolve(result[0])
        });
    });
};

// update a expense into DB log
async function updateExpense(_id, _amount, _worker_id, _expense_type, _date) {
    let connection = await db_connection();
    return new Promise((resolve, reject) => {
        if (!_worker_id || !_expense_type || !_id || !_amount || !_date) reject("Datos inválidos") // Reject if invalid worker_id
        if (_amount < 0) reject("No puedes ingresar valores menores a 0") // Reject if invalid amount
        if (!_worker_id.includes(ROLES.ADMIN.TAG)) reject("No estas autorizado para ejecutar esta operación") // Reject if invalid user
        // valid operation, proceed to insert
        connection.query(EXPENSE_UPDATE_QUERY, [_amount, _expense_type, _date, _id], (error, result) => {
            if (error) reject("No se ha podido actualizar el gasto")
            else resolve(`Se ha actualizado el gasto con el id ${_id} | Cambios realizados: ${result.affectedRows}`)
        });
    });
}

module.exports = {
    getAllExpenseType, insertExpense, insertExpenseType, findExpenseTypeById, updateExpenseType, deleteExpenseType,
    listExpensesByFilter, deleteExpenseById, updateExpense, searchExpenseById
}