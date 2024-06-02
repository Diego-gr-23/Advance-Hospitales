// wait for DOM loaded
$(document).ready(function () {
    // add event listener for update btn
    $('.edit-client-btn').click(async (event) => {
        // parameter to call backend to fetch data
        let _target_id = $(event.currentTarget).data('parameter');
        // get data using _target_id from DOM
        let _client_name = $(`#td_client_name_${_target_id}`).text().trim().toUpperCase();
        let _client_address = $(`#td_client__address_${_target_id}`).text().trim().toUpperCase();
        let _client_phone = $(`#td_client_phone_number_${_target_id}`).text().trim().toUpperCase();

        // display values into modal
        $('#client_nit_edit_form').val(_target_id);
        $('#client_name_edit_form').val(_client_name);
        $('#client_address_edit_form').val(_client_address);
        $('#client_phone_number_edit_form').val(_client_phone);

        $('#editClientModal').modal('show');

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