const express = require('express');
const { renderSellsClientDashboard, render500Page, renderSellsClientListDashboard } = require('../../modules/utils/renders.common.utils.module');
const { searchClientByNit, listClients, insertClient, deleteClient, updateClient } = require('../../modules/sells/sells.client.module');
const router = express.Router();

// render clients view
router.get('/clients', (req, res) => {
    renderSellsClientDashboard(req, res);
});

// function to fetch all clients from DB
async function fetchClients() {
    // search for all clients on DB
    return await listClients().then(clients => {
        if (!clients) { // if empty result, -> message
            return { error: true, message: 'No se encontró un cliente con el NIT proporcionado' };
        }
        return { error: false, clients };
    }).catch(error => {
        return { error: true, message: 'Error al buscar los clientes ' + error };
    });
}


// search for a user by nit
router.post('/clients/search/', async (req, res) => {
    try {
        // recover USER data
        let { client_nit } = req.body;
        // check if client nit is empty
        if (!client_nit) {
            throw new Error('El NIT del cliente no puede estar vacío');
        }
        await searchClientByNit(client_nit).then(client => {
            if (!client) { // if empty result, -> message
                renderSellsClientDashboard(req, res, 'No se encontró un cliente con el NIT proporcionado', '');
                return;
            }
            renderSellsClientListDashboard(req, res, '', '', [client]);
        }).catch(error => {
            renderSellsClientDashboard(req, res, '', 'Error al buscar el cliente ' + error);
        });
    } catch (error) {
        render500Page(res, error);
    }
});

// list all users in DB
router.get('/clients/list/all', async (req, res) => {
    try {
        let _clients = await fetchClients();
        if (_clients.error) {
            renderSellsClientDashboard(req, res, '', _clients.message);
            return;
        }
        renderSellsClientListDashboard(req, res, '', '', _clients.clients);

    } catch (error) {
        render500Page(res, error);
    }
});

// create a new user
router.post('/clients/create', async (req, res) => {
    try {
        // recover data from request
        let { client_nit, client_name, client_address, client_phone_number } = req.body;
        // check if any is empty except client_address
        if (!client_nit || !client_name || !client_phone_number) {
            renderSellsClientDashboard(req, res, '', 'El NIT, nombre y número de teléfono del cliente son obligatorios');
            return;
        }
        // check if address is empty
        client_address = client_address === '' ? 'ciudad' : client_address;
        // try to insert into DB by calling a function from sells.client.module.js
        await insertClient(client_nit, client_name, client_address, client_phone_number).then(result => {
            renderSellsClientDashboard(req, res, 'Cliente creado exitosamente ', '');
        }).catch(error => {
            renderSellsClientDashboard(req, res, '', error);
        });
    } catch (error) {
        render500Page(res, error);
    }
});

// delete a user from database
router.get('/clients/delete/:nit', async (req, res) => {
    try {
        let { nit } = req.params; // recover data from request
        if (!nit) {
            renderSellsClientDashboard(req, res, '', 'El NIT del cliente es obligatorio');
            return;
        }
        // try to delete from DB by calling a function from sells.client.module.js
        let _response = await deleteClient(nit).then(result => {
            return { error: false, message: result };
        }).catch(error => {
            return { error: true, message: error };
        });
        // fetch all clients from DB to display on UI
        let _clients = await fetchClients();
        if (_clients.error) {
            renderSellsClientDashboard(req, res, '', _clients.message);
            return;
        }
        if (_response.error) { // abort operation
            renderSellsClientListDashboard(req, res, '', _response.message);
            return;
        }
        renderSellsClientListDashboard(req, res, 'Se ha borrado el cliente', '', _clients.clients);

    } catch (error) {
        render500Page(res, error);
    }
});

// edit a user from database
router.post('/clients/edit', async (req, res) => {
    try {
        // recover data from request
        let { client_nit, client_name, client_address, client_phone_number } = req.body;
        // check if any is empty except client_address
        if (!client_nit || !client_name || !client_phone_number) {
            renderSellsClientDashboard(req, res, '', 'El NIT, nombre y número de teléfono del cliente son obligatorios');
            return;
        }

        // check if address is empty
        client_address = client_address === '' ? 'ciudad' : client_address;
        let _update_status = await updateClient(client_nit, client_name, client_address, client_phone_number).then(result => {
            return { error: false, message: result };
        }).catch(error => {
            return { error: true, message: error };
        });

        let _clients = await fetchClients(); // find data to display on UI
        if (_clients.error) {
            renderSellsClientDashboard(req, res, '', _clients.message);
            return;
        }
        // check update status
        if (_update_status.error) {
            renderSellsClientListDashboard(req, res, '', _update_status.message, _clients.clients);
            return;
        }
        renderSellsClientListDashboard(req, res, 'Cliente actualizado exitosamente', '', _clients.clients);
    } catch (error) {
        render500Page(res, error);
    }
});

module.exports = router;

