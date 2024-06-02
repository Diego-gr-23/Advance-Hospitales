const express = require('express');
const router = express.Router();
const { getPledges, getPledgeById, updatePledge, deletePledge, createPledge } = require('../../modules/admin/admin.pledges.module');

// PLEDGES ROUTES
router.get("/load-pledges", (req, res) => {
    renderPledgesList(req, res)
});

// render page and fetch data
async function renderPledgesList(req, res, message = '', error_message = '') {
    // get pledges list
    db_data = await getPledges();
    // res.status(200).json({ data: db_data, message: message, error_message: error_message });
    res.render("users/admin/products/list-pledges", { name: req.session.user.id, message: message, error_message: error_message, data: db_data });
}

// searches on DB for pledge by id and return JSON as async function
router.get("/load-pledges/search/:id", async (req, res) => {
    let pledge_id = req.params.id;
    db_data = await getPledgeById(pledge_id);
    if (db_data[0]) {
        res.status(200).json(db_data[1]);
    } else {
        res.status(400).json({ error_message: db_data[1] });
    }
});

// update a pledge into DB
router.post("/load-pledges/update/", async (req, res) => {
    try {
        let { Pledge_id, Pledge_name } = req.body;
        if (Pledge_name == '' || Pledge_name == undefined) {
            renderPledgesList(req, res, '', 'El nombre no puede estar vacío');
            return; // exit method if invalid
        }
        // valid operation GOTO db
        _fetch_data = await updatePledge(Pledge_id, Pledge_name);
        if (_fetch_data[0]) {
            renderPledgesList(req, res, _fetch_data[1], '');
        } else {
            renderPledgesList(req, res, '', _fetch_data[1]);
        }
    } catch (error) {
        renderPledgesList(req, res, '', _fetch_data[1]);
    }
});

// delete a pledge into DB
router.get("/load-pledges/delete/:id", async (req, res) => {
    try {
        let pledge_id = req.params.id;
        // check for valid inputs
        if (pledge_id == '' || pledge_id == undefined) {
            renderPledgesList(req, res, '', 'Valores ingresados inválidos');
            return; // exit method if invalid
        }
        // valid operation GOTO db
        _fetch_data = await deletePledge(pledge_id);
        if (_fetch_data[0]) {
            renderPledgesList(req, res, _fetch_data[1], '');
        } else {
            renderPledgesList(req, res, '', _fetch_data[1]);
        }
    } catch (error) {
        renderPledgesList(req, res, '', _fetch_data[1]);
    }
});

// create a new pledge and automatically insert inventory to DB using transactions
router.post("/load-pledges/create/", async (req, res) => {
    try {
        let { name, sizes } = req.body;
        _result = await createPledge(name, sizes);
        // res.status(200).json({ result: _result });
        if (_result[0]) {
            res.status(200).json({ message: _result[1] });
        } else {
            res.status(400).json({ error_message: _result[1] });
        }
    } catch (error) {
        res.status(400).json({ message: error });
    }
});

module.exports = router;

