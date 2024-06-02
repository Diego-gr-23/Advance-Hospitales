// required modules
require("dotenv").config();
const express = require("express");
const router = express.Router();
const path = require("path");

// common render
const { renderLoginPage } = require("../modules/utils/renders.common.utils.module")
const { searchBuilding } = require("../modules/admin/admin.building.module");

const { USER_SELECT_BY_PASS_ID_QUERY, ROLES } = require("../config/consts");
const db_connection = require(path.join(
  __dirname,
  "../modules/database/db-connection"
));
const encrypt = require(path.join(
  __dirname,
  "../modules/database/encrypter.module"
));

const { listWorkerAreas } = require("../modules/admin/admin.users.module");

// main view, implemente a landing page
router.get("/", (req, res) => {
  res.status(200).json({ message: "VALID CALL, NOT IMPLEMENTED MAIN PAGE" });
});

// login page, render a form to login
router.get("/login", (req, res) => {
  renderLoginPage(req, res);
});

// logout and destroy session
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect(302, "/login");
});

// searches for a user and generates a session user
async function getUserForSession(id, password) {
  let connection = await db_connection();
  return await new Promise((resolve, reject) => {
    connection.query(
      USER_SELECT_BY_PASS_ID_QUERY,
      [id, password],
      (_error, _result) => {
        // error handling
        if (_error || !_result || _result.length == 0) {
          reject("Credenciales invalidas");
        } else {
          resolve(_result[0]);
        }
      }
    );
  })
    .then((result) => {
      return {
        id: result.id,
        password: result.password,
        name: result.name,
        allowed: !!result.allowed,
        role: ROLES[result.Worker_Area_id],
      };
    })
    .catch((error) => {
      return {
        id: "",
        role: ROLES.UNKNOWN,
        error_message: error,
      };
    });
}

// login and redirect to different paths
router.post("/signin", async (req, res) => {
  try {
    // encrypt password
    let { id, password, current_building } = req.body; // retrieve data
    password = encrypt(password); // encrypt data to avoid decrypting access
    // check if selected location is valid
    if (current_building === null || current_building === undefined || current_building === '') {
      renderLoginPage(req, res, undefined, "No se ha seleccionado un edificio valido");
      return;
    }
    // execute query and search for data
    _user_session = await getUserForSession(id, password);
    // check if role is UNKNOWN
    if (_user_session.role == ROLES.UNKNOWN) {
      // not authorized
      renderLoginPage(req, res, undefined, _user_session.error_message);
      return;
    }
    // check if user is authorized
    if (!_user_session.allowed) {
      // not authorized
      renderLoginPage(req, res, undefined, "Tu usuario no esta autorizado");
      return;
    }
    // valid login, create session
    req.session.user = _user_session;
    // fetch data from building and set location
    let _building_db = await searchBuilding(Number(current_building));
    if (!_building_db[0]) {
      // building not found
      renderLoginPage(req, res, undefined, "No se ha encontrado el edificio seleccionado");
      return;
    }
    req.session.user.location = _building_db[1];
    req.session.user.id = _user_session.id; // Replace with the actual user ID
    req.session.user.username = _user_session.name;

    switch (_user_session.role.NAME) {
      case ROLES.ADMIN.NAME:
        return res.redirect(302, "/admin/dashboard/products"); // render admin dashboard
      case ROLES.PRODUCTION.NAME:
        return res.redirect(302, "/production/dashboard"); // render production dashboard
      case ROLES.SELLS.NAME:
        return res.redirect(302, "/sells/dashboard"); // render sells dashboard
      default:
        renderLoginPage(req, res, undefined, "No se reconoce tu usuario");
        break;
    }
  } catch (error) {
    // send to login
    renderLoginPage(req, res, undefined, error);
  }
});

// get areas of work
router.get("/user/get-areas", async (req, res) => {
  try {
    let areas_db = await listWorkerAreas();
    res.status(200).json({ areas: areas_db });
  } catch (error) {
    res.status(500).json({
      error: "No se ha podido obtener las areas de trabajo, " + error,
    });
  }
});

router.get("/user/goto-dashboard", (req, res) => {
  try {
    if (!req.session.user) {
      throw new Error("No se ha iniciado sesión");
    }
    switch (req.session.user.role.NAME) {
      case ROLES.ADMIN.NAME:
        return res.redirect(302, "/admin/dashboard/products"); // render admin dashboard
      case ROLES.PRODUCTION.NAME:
        return res.redirect(302, "/production/dashboard"); // render production dashboard
      case ROLES.SELLS.NAME:
        return res.redirect(302, "/sells/dashboard"); // render sells dashboard
      default:
        renderLoginPage(req, res, undefined, "No se reconoce tu usuario");
        break;
    }
  } catch (error) {
    renderLoginPage(req, res, undefined, error);
  }
});

module.exports = router;
