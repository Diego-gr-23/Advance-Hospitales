const path = require('path');
const { DEFAULT_BILL_NIT, BILLS_INSERT_QUERY, ROLES, EXTRA_BILL_DETAIL_INSERT_QUERY, BILLS_DETAIL_INSERT_QUERY,
    BILLS_DETAIL_INSERT_MULTIPLE_QUERY, BILLS_SELECT_BY_NIT_QUERY, BILLS_SEARCH_TYPES, BILLS_SELECT_BY_WORKER_ID_QUERY, BILLS_SELECT_BY_ID_QUERY,
    BILLS_SELECT_ALL_QUERY,
    BILLS_SELECT_DETAILED_QUERY,
    BILL_CANCEL_QUERY } = require('../../config/consts');

const { updateStock, findStockByPK } = require(path.join(__dirname, '../admin/admin.products.module.js'));
const db_connection = require(path.join(__dirname, "../database/db-connection"));

// insert n extra bill detail into DB
async function insertExtraBillDetail(detail, price) {
    let response = { error: false, message: "Extra insertado con éxito", extra_id: null };
    if (!detail || !price || typeof price !== 'number' || price < 0 || detail.length === 0) {
        return { error: true, message: "Datos incorrectos para insertar un extra del producto" };
    }
    // Insert the detail into the DB and return the last inserted ID
    try {
        let connection = await db_connection();
        const result = await new Promise((resolve, reject) => {
            connection.query(EXTRA_BILL_DETAIL_INSERT_QUERY, [detail, price], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
        // check if inserted
        if (result.affectedRows === 0) {
            return { error: true, message: "No se ha podido insertar el extra, revisa los datos e inténtalo de nuevo" };
        }
        response.extra_id = result.insertId;
        return response;
    } catch (error) {
        return { error: true, message: 'Error no recuperable al insertar extras' };
    }
}

// insert multiple extra bill detail into DB return IDS
async function insertMultipleExtraBillDetail(data) {
    let response = { error: false, message: "Extras insertados con éxito", extras_ids: [] };
    if (!data || data.length === 0) {
        return { error: true, message: "Datos inválidos para insertar multiples detalles extras" };
    }
    // insert extras
    let ids = [];

    let connection = await db_connection();
    try {
        await connection.beginTransaction();
        for (let i = 0; i < data.length; i++) {
            let _status_id = await insertExtraBillDetail(data[i].detail, data[i].price);
            if (_status_id.error) {
                response = _status_id;
                return; // exit function, error
            }
            ids.push(_status_id.extra_id);
        }
        response.extras_ids = ids;
    } catch (error) {
        response = { error: true, message: `Error inesperado:  ${error.message}` };
    } finally {
        if (response.error) {
            await connection.rollback();
        } else {
            await connection.commit();
        }
        return response;
    }
}


// function to insert a bill into DB
// send total, date, worker, client_nit, order_id
// worker is a json {id, role, name, location: {id, name}} -> return last inserted id or throw error
async function insertBill(total, date = new Date(), worker, client_nit = DEFAULT_BILL_NIT, order_id = null) {
    // Format the date as YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0]; // TODO centralize formatDate central function
    // TODO handle check empty cart and custom message 
    if (!total || !date || !worker || !client_nit) {
        throw new Error("No se han enviado todos los datos necesarios para realizar la factura");
    }
    if (!worker || worker.role.TAG !== ROLES.SELLS.TAG) {
        throw new Error("No se ha podido identificar al trabajador que realiza la factura o no tiene los permisos necesarios");
    }
    if (typeof total !== 'number' || total <= 0) {
        throw new Error("El total de la factura no puede ser menor o igual a 0");
    }

    let connection = await db_connection();
    try {
        // Use a promise to execute the query
        return await new Promise((resolve, reject) => {
            connection.query(BILLS_INSERT_QUERY, [client_nit, total, formattedDate, order_id, worker.id], (error, result) => {
                if (error) {
                    reject({ error: true, message: "No se ha podido insertar la factura, revisa que los datos del cliente y productos sean correctos" + error });
                } else {
                    resolve({ error: false, message: "Factura generada con éxito", bill_id: result.insertId });
                }
            });
        });
    } catch (error) {
        return { error: true, message: error.message };
    }
}

// insert a bill id into DB
async function insertBillDetail(unitary_price, quantity, bill_Id, inventory_pledge_id, inventory_size_id, extra_id = null) {
    // check if any parameter is undefined and if is number, is < 0
    if (!unitary_price || !quantity || !bill_Id || !inventory_pledge_id || !inventory_size_id) {
        throw new Error("No se han enviado todos los datos necesarios para insertar el detalle de factura");
    }
    if (typeof unitary_price !== 'number' || unitary_price <= 0 || typeof quantity !== 'number' || quantity <= 0) {
        throw new Error("El precio unitario y la cantidad deben ser números mayores a 0");
    }
    // try to insert the bill detail into the DB
    try {
        let connection = await db_connection();
        return await new Promise((resolve, reject) => {
            connection.query(BILLS_DETAIL_INSERT_QUERY, [unitary_price, quantity, bill_Id, inventory_pledge_id, inventory_size_id, extra_id], (error, result) => {
                if (error) {
                    reject({ error: true, message: "No se ha podido insertar el detalle de la factura, revisa que los datos del producto sean correctos" + error });
                } else {
                    resolve({ error: false, message: "Detalle de factura insertado con éxito", detail_id: result.insertId });
                }
            });
        });
    } catch (error) {
        return { error: true, message: error.message }
    }

}

// function to insert multiple bill details into DB
// send an array of objects with unitary_price, quantity, bill_id, inventory_pledge_id, inventory_size_id, extra_id
async function insertMultipleBillDetails(_data_rows) {
    try {
        let connection = await db_connection();
        return await new Promise((resolve, reject) => {
            connection.query(BILLS_DETAIL_INSERT_MULTIPLE_QUERY, [_data_rows], (error, result) => {
                if (error) {
                    reject({ error: true, message: "No se ha podido insertar los detalles de la factura, revisa que los datos de los productos sean correctos" + error });
                } else {
                    resolve({ error: false, message: "Detalles de factura insertados con éxito", affected_rows: result.affectedRows });
                }
            });
        });
    } catch (error) {
        return { error: true, message: error.message };
    }
}

// async function to select bills by ID, CLIENT NIT, WORKER ID OR TAKE ALL
// key = 'id', 'client_nit', 'worker_id', 'all'
// value = id, nit, id, null
async function selectBillsBy(key, value) {
    let connection = await db_connection();
    try {
        switch (key) {
            case BILLS_SEARCH_TYPES.NIT:
                return await selectBillByNIT(value);
            case BILLS_SEARCH_TYPES.WORKER:
                return await selectBillByWorkerId(value);
            case BILLS_SEARCH_TYPES.ID:
                return await selectBillsById(value);
            case BILLS_SEARCH_TYPES.NO_FILTER:
                return await selectAllBills();
            default:
                throw new Error("Tipo de búsqueda no soportado o no válido");
        }
    } catch (error) {
        return { error: true, message: error.message };
    }
}

// async function to select bills by NIT
async function selectBillByNIT(nit) {
    try {
        let connection = await db_connection();  // get global connection
        return await new Promise((resolve, reject) => { // wait for response and return it
            connection.query(BILLS_SELECT_BY_NIT_QUERY, [nit], (error, result) => {
                if (error) {
                    reject({ error: true, message: "No se ha podido buscar facturas por NIT" + error });
                } else {
                    resolve({ error: false, message: "Factura seleccionada con éxito", bills: result });
                }
            });
        });
    } catch (error) {
        return { error: true, message: error.message };
    }
}

// async function to select bills by Worker_id
async function selectBillByWorkerId(worker_id) {
    try {
        let connection = await db_connection();  // get global connection
        return await new Promise((resolve, reject) => { // wait for response and return it
            connection.query(BILLS_SELECT_BY_WORKER_ID_QUERY, [worker_id], (error, result) => {
                if (error) {
                    reject({ error: true, message: "No se ha podido buscar Facturas por ID de trabajador" + error });
                } else {
                    resolve({ error: false, message: "Factura seleccionada con éxito", bills: result });
                }
            });
        });
    } catch (error) {
        return { error: true, message: error.message };
    }
}

// search bills by ID on DB
async function selectBillsById(id) {
    try {
        let connection = await db_connection();
        return await new Promise((resolve, reject) => {
            connection.query(BILLS_SELECT_BY_ID_QUERY, [id], (error, result) => {
                if (error) {
                    reject({ error: true, message: "No se ha podido buscar facturas por ID" + error });
                } else {
                    resolve({ error: false, message: "Factura seleccionada con éxito", bills: result });
                }
            });
        });
    } catch (error) {
        return { error: true, message: error.message };
    }
}

// search all bills on DB, include the cancelled ones
async function selectAllBills() {
    try {
        let connection = await db_connection();
        return await new Promise((resolve, reject) => {
            connection.query(BILLS_SELECT_ALL_QUERY, (error, result) => {
                if (error) {
                    reject({ error: true, message: "No se ha podido buscar facturas" + error });
                } else {
                    resolve({ error: false, message: "Facturas seleccionadas con éxito", bills: result });
                }
            });
        });
    } catch (error) {
        return { error: true, message: error.message };
    }
}

// recover a JSON with bill data and bill details
async function getBillDetailed(bill_id) {
    try {
        let _bill = await selectBillsBy(BILLS_SEARCH_TYPES.ID, bill_id);
        // check if error
        if (_bill.error) {
            return { error: true, message: _bill.message };
        }
        // get bill details
        let connection = await db_connection();
        let _db_details = await new Promise((resolve, reject) => {
            connection.query(BILLS_SELECT_DETAILED_QUERY, [bill_id], (error, result) => {
                if (error) {
                    reject({ error: true, message: "No se ha podido recuperar los detalles de la factura" + error });
                }
                resolve({ error: false, message: "Detalles de factura recuperados con éxito", details: result });

            });
        });
        // check if error
        if (_db_details.error) {
            return _db_details;
        }
        return { error: false, message: "Detalles de factura recuperados con éxito", bill: _bill.bills[0], details: _db_details.details };
    } catch (error) {
        return { error: true, message: error.message }
    }
}

// set bill as cancelled, this function uses async
async function setBillAsCancelled(bill_id, is_cancelled = true) {
    if (!bill_id) throw new Error("No se ha enviado el ID de la factura a cancelar");
    try {
        let connection = await db_connection();
        let status = await new Promise((resolve, reject) => {
            connection.query(BILL_CANCEL_QUERY, [is_cancelled, bill_id], (error, result) => {
                if (error) {
                    reject({ error: true, message: "No se ha podido cancelar la factura" + error });
                }
                resolve({ error: false, message: "Factura cancelada con éxito " + result.affectedRows + " filas afectadas" });
            })
        });
        return status;
    } catch (error) {
        return { error: true, message: error.message }
    }
}

async function cancelBill(bill_id, building_id) {
    let bill_data = await getBillDetailed(bill_id);
    if (bill_data.error) {
        return { error: true, message: bill_data.message }
    }
    // check if bill is already cancelled
    if(bill_data.bill.cancelled) {
        return { error: false, message: "La factura ya ha sido cancelada" }
    }



    // begin transaction to restore stock from each item in bill and cancel bill
    let connection = await db_connection();
    connection.beginTransaction();
    try {
        // check current date - 7 days from bill date
        let bill_date = new Date(bill_data.date);
        if (bill_date.setDate(bill_date.getDate() + 7) < new Date()) {
            return { error: true, message: "No se puede cancelar una factura con más de 7 días de antigüedad" }
        }

        // restore stock from each item in bill
        let details = bill_data.details;

        details.forEach(async detail => {
            let current_stock = await findStockByPK(building_id, detail.id, detail.size);
            current_stock = current_stock.stock + detail.quantity;
            await updateStock(building_id, detail.id, detail.size, current_stock);
        });

        // update bill and set cancel
        let response = await setBillAsCancelled(bill_id);
        if (response.error) throw new Error(response.message);
        // OK
        connection.commit();
        return { error: false, message: "Factura cancelada con éxito" };
    } catch (error) {
        connection.rollback();
        return { error: true, message: error.message }
    }
}

module.exports = { insertBill, insertExtraBillDetail, insertBillDetail, insertMultipleExtraBillDetail, insertMultipleBillDetails, selectBillsBy, getBillDetailed, cancelBill }