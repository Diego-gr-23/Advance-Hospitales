const express = require('express');
const path = require('path');
const router = express.Router();

const { ADMIN_USER_VIEW } = require('../../config/consts');
const { deleteUserById, signup, searchUserById, toggleAuthorizationToUser, searchAllUsers, updateUser } = require('../../modules/admin/admin.users.module');
adminBuildingRouter = require(path.join(__dirname, 'admin.buildings.routes'));

// render view of usersListPage
function renderUserListPage(_users_db, res, req, message = '', error_message = '', current_view = '') {
    res.render('users/admin/users/user-list', { users: _users_db, name: req.session.user.name, message: message, error_message: error_message, current_view: current_view })
}

// generic function to search a user by id
async function searchUsersArrayMiddleFunction(search_all = true, id = '') {
    try {
        // search by user
        // extract JSON data from request body
        if (search_all) {
            return searchAllUsers();
        }
        // empty user, search all users
        let _db_user = await searchUserById(id);
        return [_db_user];
    } catch (error) {
        return [];
    }
}

// req, res to get data, id to execute operation, and true or false to auth or remove authorization
async function executeToggleGrants(req, res, authorize = false) {
    try {
        let { id } = req.params; // id to remove
        let { current_view } = req.query; // recover current view to render page again
        // call unauthorize function
        let _response = await toggleAuthorizationToUser(id, req.session, authorize);
        // check if success
        let db_user = await searchUsersArrayMiddleFunction(search_all = current_view === '', id = current_view);
        if (!_response[0]) {
            // render page with error message
            renderUserListPage(db_user, res, req, '', _response[1], current_view = current_view);
            return;
        } else {
            // render page with success message
            renderUserListPage(db_user, res, req, _response[1], '', current_view = current_view);
            return;
        }
    } catch (error) {
        // render dashboard and display error message if any
        adminBuildingRouter.renderDashboard(req, res, '', "No se pudo procesar la búsqueda de usuarios, " + error, ADMIN_USER_VIEW);
    }
}

// register a new user | admin must be auth
// generates ID automatically
router.post("/user/create", async (req, res) => {
    // extract JSON data from request body
    let { password, name, Worker_area_id, authorized } = req.body;
    // call signup function
    let [success, data] = await signup(password, name, Worker_area_id, authorized);
    // check if success
    if (!success) {
        // render page with error
        adminBuildingRouter.renderDashboard(req, res, '', data, ADMIN_USER_VIEW);
        return;
    }
    // render page with success message
    adminBuildingRouter.renderDashboard(req, res, data, '', ADMIN_USER_VIEW);
});

router.get("/user/search", async (req, res) => {
    try {
        // search by user
        let { user } = req.query;
        let db_user = await searchUsersArrayMiddleFunction(search_all = user === '', id = user);
        // check if db_user is empty array
        if (db_user.length == 0) {
            adminBuildingRouter.renderDashboard(req, res, "No existe un usuario con el ID proporcionado", '', ADMIN_USER_VIEW);
            return;
        }
        renderUserListPage(db_user, res, req, '', '', current_view = user);
    } catch (error) {
        adminBuildingRouter.renderDashboard(req, res, '', "No se pudo procesar la búsqueda de usuarios, " + error, ADMIN_USER_VIEW);
    }
});

// get info from a user as JSON
router.get("/user/get/:id", async (req, res) => {
    try {
        // extract JSON data from request body
        let { id } = req.params; // id to remove
        let _db_user = await searchUserById(id);
        res.status(200).json({ user: _db_user });
    } catch (error) {
        res.status(500).json({ error: "No se ha podido obtener el usuario, " + error });
    }
});

router.get("/user/search/all", async (req, res) => {
    try {
        let users_db = await searchUsersArrayMiddleFunction(search_all = true);
        // check if users_db is empty array
        if (users_db.length == 0) {
            adminBuildingRouter.renderDashboard(req, res, "No se encontraron usuarios", '', ADMIN_USER_VIEW);
            return;
        }
        // valid search, render all fetched users
        renderUserListPage(users_db, res, req, current_view = '');
    } catch (error) {
        adminBuildingRouter.renderDashboard(req, res, '', "No se pudieron buscar todos los usuarios, " + error, ADMIN_USER_VIEW);
    }
});

router.get("/user/delete/:id", async (req, res) => {
    try {
        // extract JSON data from request body
        let { id } = req.params; // id to remove
        let { current_view } = req.query; // recover current view to render page again
        let _response = await deleteUserById(id);  // call delete function
        // check if success
        let db_user = await searchUsersArrayMiddleFunction(search_all = current_view === '', id = current_view);
        if (!_response[0]) {
            // render page with error message
            renderUserListPage(db_user, res, req, '', _response[1], current_view = current_view);
            return;
        } else {
            // render page with success message
            renderUserListPage(db_user, res, req, _response[1], '', current_view = current_view);
            return;
        }
    } catch (error) {
        // render dashboard and display error message if any
        adminBuildingRouter.renderDashboard(req, res, '', "Error inesperado para eliminar usuarios, " + error, ADMIN_USER_VIEW);
    }

});

// update multiple data from a user
router.post("/user/update/", async (req, res) => {
    try {
        // extract JSON data from request body
        let { id, password, name, Working_Area_id, allowed, current_view, update_password } = req.body;
        allowed = !!allowed;                // convert to boolean
        update_password = !!update_password; // convert to boolean
        // create user object
        let user = { id, password, name, Working_Area_id, allowed };
        let _response = await updateUser(user, update_password);
        let db_user = await searchUsersArrayMiddleFunction(search_all = current_view === '', id = current_view);
        // check if success
        if (!_response[0]) {
            // render page with error message
            renderUserListPage(db_user, res, req, '', _response[1], current_view = current_view);
            return;
        } else {
            // render page with success message
            renderUserListPage(db_user, res, req, _response[1], '', current_view = current_view);
            return;
        }
    } catch (error) {
        adminBuildingRouter.renderDashboard(req, res, '', "Error no definido para actualizar usuario, " + error, ADMIN_USER_VIEW);
    }
});

// authorize user
router.get("/user/auth/:id", async (req, res) => {
    // extract JSON data from request body
    executeToggleGrants(req, res, true);
});

// unauthorize user
router.get("/user/unauth/:id", async (req, res) => {
    // extract JSON data from request body
    executeToggleGrants(req, res, false);
});



module.exports = router;

