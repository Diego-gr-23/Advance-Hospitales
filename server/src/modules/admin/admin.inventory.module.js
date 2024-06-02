const path = require('path')
const db_connection = require(path.join(__dirname, "../database/db-connection"));
const { INVENTORY_SELECT_QUERY, INVENTORY_DELETE_QUERY, INVENTORY_SELECT_BY_PK_QUERY, INVENTORY_UPDATE_QUERY, INVENTORY_INSERT_QUERY } = require('../../config/consts');


// deletes a product from inventory (product and size)
async function deleteProductFromInventory(pledge_id, pledge_size) {
    try {
        let connection = await db_connection();
        await new Promise((resolve, reject) => {
            connection.query(INVENTORY_DELETE_QUERY, [pledge_id, pledge_size], (err, result) => {
                if (err) {
                    reject(err)
                }
                resolve(result)
            });
        });
        return [true, "Producto eliminado con éxito"]
    } catch (error) {
        return [false, "Error eliminando producto: No se puede borrar un producto que ya ha sido usado en otros registros\nPara los productos " + pledge_id + " con talla " + pledge_size]
    }
}

// update a product from inventory (product and size)
async function updateProductFromInventory(pledge_id, pledge_size, new_price) {
    try {
        let connection = await db_connection();
        if (new_price < 0) {
            return [false, "Precio invalido, debe ser mayor a 0"]
        }
        await new Promise((resolve, reject) => {  // async call
            connection.query(INVENTORY_UPDATE_QUERY, [new_price, pledge_id, pledge_size], (err, result) => {
                if (err) {
                    reject(err)
                }
                resolve(result)
            });
        });
        return [true, "Producto " + pledge_id + " con talla " + pledge_size + " actualizado con éxito"]
    } catch (error) {
        return [false, "No se pudo actualizar el inventario, valores inválidos"]
    }

}

// fetches all inventory (products and sizes) from DB and generates a custom JSON
async function getAllInventory() {
    let sorted_data = [] // data to display at ejs
    try {
        let connection = await db_connection();
        let db_inventory = await new Promise((resolve, reject) => { // inventory as a single array
            connection.query(INVENTORY_SELECT_QUERY, (err, result) => {
                if (err) {
                    reject(err)
                }
                resolve(result)
            });
        });
        db_inventory.forEach(_inventory_row => { // restructure array to a custom display
            // check if sorted_data contains a name of the _inventory_row.name
            let _index = sorted_data.findIndex(_sorted_row => _sorted_row.name === _inventory_row.name);
            if (_index === -1) {
                sorted_data.push({ name: _inventory_row.name, Pledge_id: _inventory_row.Pledge_id, products: [] });
                _index = sorted_data.length - 1;
            }
            // append product to sorted_data at _index
            sorted_data[_index].products.push({
                Size_id: _inventory_row.Size_id,
                price: _inventory_row.price
            });
        });
        return sorted_data; // return custom JSON
    } catch (error) {
        throw new Error("Error getting inventory: " + error);
    }
}

// search inventory by primary key (double) into DB 
async function searchInventoryByPK(pledge_id, pledge_size) {
    try {
        let connection = await db_connection();
        db_data = await new Promise((resolve, reject) => {
            connection.query(INVENTORY_SELECT_BY_PK_QUERY, [pledge_id, pledge_size], (err, result) => {
                if (err) {
                    reject(err)
                }
                resolve(result)
            });
        });
        return [true, { Pledge_id: db_data[0].Pledge_id, Size_id: db_data[0].Size_id, price: db_data[0].price, name: db_data[0].name }]
    } catch (error) {
        return [false, "Error buscando producto: No se puede encontrar el producto " + pledge_id + " con talla " + pledge_size]
    }
}


// insert into DB by pledge ID multiple sizes and prices
// structure sizes:prices = {size: '', price: n}
async function insertInventory(pledge_id, sizes_prices) {
    try {
        let connection = await db_connection();
        // gen SQL insert VALUES
        const inventory_pledges = [];
        sizes_prices.forEach(size => {
            inventory_pledges.push([pledge_id, size.size, size.price]);
        });
        // insert into DB
        result = await new Promise((resolve, reject) => {
            // insert sizes
            connection.query(INVENTORY_INSERT_QUERY, [inventory_pledges], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
        return [true, "Prenda " + pledge_id + " insertada con éxito"];
    } catch (error) {
        return [false, "No se pudo insertar la prenda y sus tallas: " + error];
    }
}

module.exports = { getAllInventory, deleteProductFromInventory, updateProductFromInventory, searchInventoryByPK, insertInventory }