// wait for DOM loaded
$(document).ready(function () {
    // add event listener for update btn
    $('.edit-expense-type-btn').click(async (event) => {
        // parameter to call backend to fetch data
        let _target_id = $(event.currentTarget).data('parameter');
        // call backend to fetch data using promises
        await fetchExpenseTypeData(_target_id)
            .then((response) => {
                // display modal and fill data with object response
                $('#editExpenseTypeModal').modal('show');
                // Fill modal fields with object response
                $('#expenseTypeId').val(response.id);
                $('#expenseTypeName').val(response.name);
            })
            .catch((error) => {
                alert(`Error calling to API ${error}`)
            });
    });

    // function to fetch data from DB
    async function fetchExpenseTypeData(_target_id) {
        return new Promise(async (resolve, reject) => {
            try {
                const url = `/admin/finance/list/expense-type/${_target_id}`;
                let response = await fetch(url);
                if (!response.ok) {
                    reject(`Error calling to API ${response.status} ${response.statusText}`);
                }
                resolve(response.json());
            } catch (error) {
                reject(`Invalid call to API ${error}`)
            }
        });
    }
});