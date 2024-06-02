const path = require('path');
const { USER_WORKER_AREA_SELECT_QUERY, USER_SELECT_BY_ID_NO_PASS_QUERY, USER_SELECT_ALL_NO_PASS_QUERY, USER_REMOVE_ACCESS_QUERY, USER_GRANT_ACCESS_QUERY, USER_DELETE_QUERY, USER_INSERT_QUERY, USER_UPDATE_QUERY, USER_UPDATE_NO_PASS_QUERY } = require('../../config/consts');
const db_connection = require(path.join(__dirname, "../database/db-connection"));
const encrypt = require(path.join(__dirname, "../../modules/database/encrypter.module"))

// search all users on DB
async function searchAllUsers() {
    let connection = await db_connection();
    return new Promise((resolve, reject) => {
        connection.query(USER_SELECT_ALL_NO_PASS_QUERY, (error, result) => {
            if (error) {
                reject("No hemos podido encontrar el usuario con id " + id); // Reject the Promise if there is an error
            } else {
                resolve(result);  // Resolve the Promise with the result
            }
        });
    });
}


// list all worker areas and create JSON object
async function listWorkerAreas() {
    let connection = await db_connection();
    // try to select all worker areas and return array of dictionaries
    return await new Promise((resolve, reject) => {
        connection.query(USER_WORKER_AREA_SELECT_QUERY, (error, result) => {
            if (error) {
                reject("No hemos podido encontrar áreas de trabajo: " + error); // Reject the Promise if there is an error
            } else {
                resolve(result);  // Resolve the Promise with the result
            }
        });
    });
}

// CREATE A NEW USER
async function signup(password, name, Worker_area_id, authorized) {
    try {
        // check invalid dta
        if (password == '' || name == '' || Worker_area_id == '' || authorized == '') {
            throw new Error('No se han enviado datos validos');
        }
        // cast authorized to boolean
        authorized = authorized.toLowerCase();
        if (authorized != 'true' && authorized != 'false') {
            throw new Error('No se ha enviado un valor valido para autorizado');
        }
        authorized = authorized == 'true' ? true : false;
        // encrypt and create password
        password = encrypt(password); // encrypt password
        let connection = await db_connection();
        let fetched_data = await new Promise((resolve, reject) => {
            connection.query(USER_INSERT_QUERY, [password, name, Worker_area_id, authorized], (error, result) => {
                // error handling
                if (error) reject('No es posible insertar al usuario');
                // retrieve OUT variable value
                connection.query('SELECT @generated_id AS generated_key', (_error, _output_result) => {
                    if (_error) {
                        // Handle error fetching OUT variable
                        reject('No es posible obtener el ID generado');
                    }
                    result = _output_result[0].generated_key;
                    resolve(result);
                });
            })
        });
        // return success
        return [true, "Usuario creado, id: " + fetched_data];
    } catch (error) {
        // return error
        return [false, error];
    }
}

// search a user on DB by id at parameter, must be string
async function searchUserById(id) {
    let connection = await db_connection();

    return new Promise((resolve, reject) => {
        if (!id) { // check for id undefined or null
            reject("No es un ID valido");
        }
        connection.query(USER_SELECT_BY_ID_NO_PASS_QUERY, [id], (error, result) => {
            if (error) {
                reject("No hemos podido encontrar el usuario con id " + id); // Reject the Promise if there is an error
                return;
            }
            if (result.length == 0) {
                reject("No existe un usuario con id " + id);
                return;
            }
            resolve({ id: result[0].id, name: result[0].name, allowed: result[0].allowed, Worker_Area_id: result[0].Worker_Area_id });  // Resolve the Promise with the result
        });
    });
}

// disallow a user to access the system, send current session and objective id
// add authorize = TRUE if grant access, false if remove access
async function toggleAuthorizationToUser(id, session, authorize) {
    try {
        // check invalid dta
        if (id == '') {
            throw new Error('No se han enviado datos validos');
        }
        // check if current user wants to unauthorize himself
        if (session.user.id == id) {
            throw new Error('No puedes editar los permisos en ti mismo');
        }
        _query = authorize ? USER_GRANT_ACCESS_QUERY : USER_REMOVE_ACCESS_QUERY;
        let connection = await db_connection();
        let fetched_data = await new Promise((resolve, reject) => {
            connection.query(_query, [id], (error, result) => {
                // error handling
                if (error) reject('No es posible cambiar los permisos al usuario');
                resolve(result);
            })
        });
        // return success
        return [true, "Permisos actualizados correctamente."];
    } catch (error) {
        // return error
        return [false, error];
    }
}

// function to delete a user from DB
async function deleteUserById(id) {
    try {
        // check invalid dta as null or undefined
        if (!id) {
            throw new Error('No se han enviado datos validos');
        }
        let connection = await db_connection();

        let fetched_data = await new Promise((resolve, reject) => {
            connection.query(USER_DELETE_QUERY, [id], (error, result) => {
                // error handling
                if (error) {
                    reject('No es posible eliminar al usuario, es posible que el usuario ya sea parte del registro de otras transacciones');
                } else {
                    resolve(result);
                }
            })
        });
        // return success
        return [true, "Usuario eliminado correctamente. " + fetched_data[0]];
    } catch (error) {
        // return error
        return [false, error];
    }
};

// update user function, user contains structure from DB
async function updateUser(user, edit_password = false) {
    try {
        if (!user) { // undefined...
            throw new Error('No se han enviado datos validos');
        }
        // check invalid dta as null or undefined
        if (!user.id || (!user.password && edit_password) || !user.name || !user.Working_Area_id || user.allowed === undefined) {
            throw new Error('Campos incompletos');
        }
        let _query = edit_password ? USER_UPDATE_QUERY : USER_UPDATE_NO_PASS_QUERY;
        let _pool = [user.name, user.allowed, user.Working_Area_id, user.id]
        // encrypt and create password if updated
        if (edit_password) {
            user.password = encrypt(user.password); // encrypt password
            _pool.unshift(user.password); // append password to beginning
        }
        let connection = await db_connection();

        let fetched_data = await new Promise((resolve, reject) => {
            connection.query(_query, _pool, (error, result) => {
                // error handling
                if (error) {
                    reject('No es posible actualizar al usuario ' + error);
                    return
                }
                resolve(result);
            })
        });
        // return success
        return [true, `Usuario actualizado correctamente con ID ${user.id}`];
    } catch (error) {
        // return error
        return [false, error];
    }
};

module.exports = { listWorkerAreas, signup, searchUserById, searchAllUsers, toggleAuthorizationToUser, deleteUserById, updateUser }