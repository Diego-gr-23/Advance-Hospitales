// wait for DOM loaded
$(document).ready(function () {
    // add event listener for update btn
    $('.edit-expense-btn').click(async (event) => {
        // parameter to call backend to fetch data
        let _target_id = $(event.currentTarget).data('parameter');
        // call backend to fetch data using promises
        await fetchExpenseTypeData(_target_id)
            .then((response) => {
                // display modal and fill data with object response
                $('#editExpenseModal').modal('show');
                // Fill modal fields with object response
                $('#expense_id').val(response.expense.id); // set id
                $('#expense_ammount').val(response.expense.ammount); // set amount
                // set date from fetched data
                // Set date from fetched data
                $('#expense_date').val(response.expense.date.substring(0, 10)); // Extract YYYY-MM-DD from the fetched date
                $('#worker_id').val(response.expense.worker_id)
                $('#worker_name').val(response.expense.worker_name)
                // fill the select with response.expenses_type and default select the response.expense.expense_type default
                response.expenses_type.forEach(_expense_type => {
                    $('#expense_type').append($('<option>', {
                        value: _expense_type.id,
                        text: _expense_type.name
                    }));
                    // Check if this option should be selected
                    if (_expense_type.id == response.expense.expense_type_id) {
                        $('#expense_type').val(_expense_type.id); // Set this option as selected
                    }
                })

            }).catch((error) => {
                alert(`Error calling to API ${error}`)
            });
    });

    // function to fetch data from DB
    async function fetchExpenseTypeData(_target_id) {
        return new Promise(async (resolve, reject) => {
            try {
                const url = `/admin/finance/list/expense/${_target_id}`;
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