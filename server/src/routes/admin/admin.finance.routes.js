const express = require('express');
const path = require('path');
const router = express.Router();

const { getAllExpenseType, insertExpense, insertExpenseType, findExpenseTypeById, updateExpenseType,
    deleteExpenseType, listExpensesByFilter, deleteExpenseById, searchExpenseById, updateExpense } = require('../../modules/admin/admin.finance.module');
const { renderDashboard } = require('./admin.buildings.routes');
const { ADMIN_FINANCE_VIEW } = require('../../config/consts');
const { formatDate } = require('../../modules/utils/dates.utils.module');

// generic function to get a JSON with expenses
async function getExpensesType() {
    // search on DB for all expense type
    let _fetched_data = await getAllExpenseType();
    return _fetched_data;
}

// render the expense type view
async function renderExpenseTypeView(req, res, message, error) {
    try {
        let _expenses_type = await getExpensesType();
        res.render("users/admin/finance/expense-type-list", { message: message, error_message: error, name: req.session.user.id, data: { expenses_type: _expenses_type } });
    } catch (error) {
        renderDashboard(req, res, '', error, ADMIN_FINANCE_VIEW); // unexpected error        
    }
}

// render the list with expenses
async function renderExpenseListView(req, res, message, error_message, _init_date = null, _end_date = null) {
    try {
        // get dates
        let _expenses = await listExpensesByFilter(_init_date, _end_date);
        res.render("users/admin/finance/expense-list", { name: req.session.user.id, message: message, error_message: error_message, data: { expenses: _expenses, functions: { formatDate } } })
    } catch (error) {
        renderDashboard(req, res, '', error, ADMIN_FINANCE_VIEW); // unexpected error        
    }
}

// get data from a single expense type
router.get("/finance/list/expense-type/:id", async (req, res) => {
    try {
        let _id = req.params.id;
        let _expense_type = await findExpenseTypeById(_id);
        res.status(200).json(_expense_type);
    } catch (error) {
        renderDashboard(req, res, '', error, ADMIN_FINANCE_VIEW); // unexpected error        
    }
});

// displays a view with all expense type and allow it to edit it
router.get("/finance/list-all/expense-type", async (req, res) => {
    try {
        renderExpenseTypeView(req, res, '', '');
    } catch (error) {
        renderDashboard(req, res, '', error, ADMIN_FINANCE_VIEW); // unexpected error        
    }

});

// inserts a new expense type into DB and renders main view
router.post("/finance/insert/expense-type", async (req, res) => {
    // retrieve data from body
    try {
        let { expense_type } = req.body;
        await insertExpenseType(expense_type, req.session.user.id)
            .then((message) => { renderDashboard(req, res, message, '', ADMIN_FINANCE_VIEW) })
            .catch((error) => { renderDashboard(req, res, '', error, ADMIN_FINANCE_VIEW) })
    } catch (error) {
        renderDashboard(req, res, '', error, ADMIN_FINANCE_VIEW); // unexpected error
    }
})

// update expense type
router.post("/finance/update/expense-type", async (req, res) => {
    try {
        let { expense_id, expense_name } = req.body;
        // call function to update and await response
        await updateExpenseType(expense_id, expense_name)
            .then((result) => {
                renderExpenseTypeView(req, res, result, '');
            }).catch((error) => {
                renderExpenseTypeView(req, res, '', error);
            });
        return; // end of function
    } catch (error) {
        renderDashboard(req, res, '', error, ADMIN_FINANCE_VIEW); // unexpected error
    }
});

// delete expense type
router.get("/finance/delete/expense-type/:id", async (req, res) => {
    try {
        let _id = req.params.id; // get ID to delete
        // call function to delete and await response
        await deleteExpenseType(_id)
            .then((result) => {
                renderExpenseTypeView(req, res, result, '');
            }).catch((error) => {
                renderExpenseTypeView(req, res, '', error);
            });
        return; // end of function
    } catch (error) {
        renderDashboard(req, res, '', error, ADMIN_FINANCE_VIEW); // unexpected error
    }
});

// inserts a new expense into Db AND RENDER MAIN VIEW
router.post("/finance/insert/expense", async (req, res) => {
    // retrieve data from body
    try {
        let { expense_ammount, expense_type } = req.body;
        await insertExpense(expense_ammount, req.session.user.id, expense_type)
            .then((message) => { renderDashboard(req, res, message, '', ADMIN_FINANCE_VIEW) })
            .catch((error) => { renderDashboard(req, res, '', error, ADMIN_FINANCE_VIEW) })
        return;
    } catch (error) {
        renderDashboard(req, res, '', error, ADMIN_FINANCE_VIEW); // unexpected error
    }
});

// display a view with all expenses and allow it to edit it or delete it
router.post("/finance/list-all/expense", async (req, res) => {
    try {
        // get dates from request
        let { init_date, end_date } = req.body;
        renderExpenseListView(req, res, '', '', init_date, end_date);
    } catch (error) {
        renderDashboard(req, res, '', error, ADMIN_FINANCE_VIEW);
    }

});

// get data from an specific expense
router.get("/finance/list/expense/:id", async (req, res) => {
    try {
        let _id = req.params.id;
        let _expense = await searchExpenseById(_id);
        // get expenses type
        let _expenses_type = await getExpensesType();
        res.status(200).json({ expense: _expense, expenses_type: _expenses_type });
    } catch (error) {
        renderDashboard(req, res, '', error, ADMIN_FINANCE_VIEW);
    }
});

// delete a expense
router.get("/finance/delete/expense/:id", async (req, res) => {
    try {
        let id = req.params.id; // get id to delete
        await deleteExpenseById(id)
            .then((result) => {
                renderExpenseListView(req, res, result, '');
            }).catch((error) => {
                renderExpenseListView(req, res, '', error);
            });
    } catch (error) {
        renderDashboard(req, res, '', error, ADMIN_FINANCE_VIEW);
    }
});

// update an expense
router.post("/finance/update/expense/", async (req, res) => {
    try {
        let { expense_id, expense_ammount, expense_date, expense_type } = req.body;
        await updateExpense(expense_id, expense_ammount, req.session.user.id, expense_type, expense_date)
            .then(result => {
                // render page with message
                renderExpenseListView(req, res, result, '', null, null)
            }).catch(error => {
                renderExpenseListView(req, res, '', error, null, null)
            })
    } catch (error) {
        renderDashboard(req, res, '', error, ADMIN_FINANCE_VIEW);
    }
});

module.exports = router;

