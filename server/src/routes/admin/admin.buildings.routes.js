const express = require('express');
const router = express.Router();
const { listBuildings, insertBuilding, searchBuilding, updateBuilding, deleteBuilding } = require('../../modules/admin/admin.building.module');
const { listWorkerAreas } = require('../../modules/admin/admin.users.module');
const { getSizes } = require('../../modules/admin/admin.products.module');
const { getAllExpenseType } = require('../../modules/admin/admin.finance.module');
const { ADMIN_USER_VIEW, ADMIN_FINANCE_VIEW, ADMIN_PRODUCTS_VIEW } = require('../../config/consts');
const { render500Page } = require('../../modules/utils/renders.common.utils.module');


// / BUILDINGS
// insert a new building
router.post("/insert-building", async (req, res) => {
    try {
        let { building_name, building_direction } = req.body;
        // check for valid inputs
        if (building_name === '') {
            renderDashboard(req, res, '', 'Valores ingresados inválidos');
            return;
        }
        _response = await insertBuilding(building_name, building_direction);
        if (_response[0]) {
            renderDashboard(req, res, _response[1], '');
        } else {
            renderDashboard(req, res, '', _response[1]);
        }
    } catch (error) {
        render500Page(res, "Oops, an unexpected error just ocurred " + error);
    }
});

// edit a building into DB
router.get("/edit-building/:building_id", async (req, res) => {
    try {
        let building_id = req.params.building_id;
        // get data
        db_data = await searchBuilding(building_id);
        if (db_data[0]) {
            res.render('users/admin/modals/building-edit-modal', { building: db_data[1], name: req.session.user.id });
        } else {
            throw new Error("No se ha podido encontrar el edificio con id " + building_id + " ERROR " + error);
        }
    } catch (error) {
        render500Page(res, "Ha ocurrido un error inesperado al recuperar datos para editar el edificio " + error);
    }
})

// update a building into DB
router.post("/update-building", async (req, res) => {
    try {
        let { building_id, building_name, building_direction } = req.body;
        // check for valid inputs
        if (building_id === '' || building_name === '') {
            renderDashboard(req, res, '', 'Valores ingresados inválidos');
            return;
        }
        // forward request
        _response = await updateBuilding(building_id, building_name, building_direction);
        if (_response[0]) {
            renderDashboard(req, res, _response[1].message, '');
        } else {
            renderDashboard(req, res, '', _response[1].message);
        }
    } catch (error) {
        render500Page(res, "Ha ocurrido un error al intentar aplicar los cambios en el edificio " + error);
    }
})

// delete a building from DB
router.get("/delete-building/:building_id", async (req, res) => {
    try {
        let building_id = req.params.building_id;
        // check valid input
        if (building_id === '') {
            renderDashboard(req, res, '', 'Valores ingresados inválidos');
            return;
        }
        // get data
        db_result = await deleteBuilding(building_id);
        if (db_result[0]) {
            renderDashboard(req, res, db_result[1].message, '')
        } else {
            throw new Error("No se ha podido encontrar el edificio con id " + building_id + " ERROR " + error);
        }
    } catch (error) {
        renderDashboard(req, res, '', "Ha ocurrido un error al borrar el edificio, error: " + error)
    }
})

// render dashboard for admins
async function renderDashboard(req, res, message, error_message, view) {
    try {
        view = typeof (view) == 'undefined' ? ADMIN_PRODUCTS_VIEW : view
        // check view to call different JSONs
        _data = {}
        if (view == ADMIN_PRODUCTS_VIEW) {
            _data = { buildings: [], sizes: [] }
            _data.buildings = await listBuildings();  // get buildings list
            _data.sizes = await getSizes();  // get sizes list
        } else if (view == ADMIN_USER_VIEW) { 
            _data = { worker_areas: [] }
            _data.worker_areas = await listWorkerAreas();  // get worker areas list
        } else if (view == ADMIN_FINANCE_VIEW) {
            _data = { expenses_type: [] }
            _data.expenses_type = await getAllExpenseType();
        }
        // load buildings for sub-view
        res.render('users/admin/admin-view', { name: req.session.user.id, data: _data, message: message, error_message: error_message, view: view })
        // res.status(200).json({ name: req.session.user.id, data: _data, message: message, error_message: error_message, view: view })
    } catch (error) {
        render500Page(res, "Error en la sesión " + error)
    }
}


module.exports = { router, renderDashboard };