$(document).ready(function () {

    // function to catch event on form
    $('.stock-search-form').submit(async function (e) {
        e.preventDefault();
        alert("Buscando...");
    });

    $('#pledge-create-form').submit(async function (e) {
        try {
            e.preventDefault();
            let form = $(this);
            // deserialize data and restructure for JSON operations
            let _data = { name: "", sizes: [] }
            _data.name = form.find('input[name="new_pledge_name"]').val();
            // get all checked checkboxes
            form.find('input[type="checkbox"]:checked').each(function () {
                let key = $(this).val();
                let price = parseFloat($(`#price-product${key}`).val());
                // cast price to number
                _data.sizes.push({ size: key, price: price });
            });
            // fetch the url by post and await for response
            _response = await postData(_data);
            alert(_response.message);
        } catch (error) {
            alert("Operación fallida: Es posible que los valores ya existan");
        }
    });

    // execute POST request to create a pledge
    async function postData(form_data) {
        return new Promise(async (resolve, reject) => {
            const url = `/admin/load-pledges/create/`;
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(form_data)
                });
                if (!response.ok) {
                    reject(`Operación fallida${response.json().message}`);
                }
                const data = await response.json();
                resolve(data);
            } catch (error) {
                reject(error);
            }
        });
    }

    // Add click event listener to the button
    $(".display-modal").click((e) => {
        let recover_id = e.currentTarget.getAttribute('data-modal-data');
        // get values from $("#pledge_id_{recover_id}")
        let pledge_id = $(`#tr_pledge_id_${recover_id}`).text().trim();
        let pledge_name = $(`#tr_pledge_name_${recover_id}`).text().trim();
        let pledge_size = $(`#tr_pledge_size_${recover_id}`).text().trim();
        let pledge_price = $(`#tr_pledge_price_${recover_id}`).text().trim();

        // set values to modal
        $('#pledge_id').val(Number(pledge_id));
        $('#pledge_name').val(pledge_name);
        $('#pledge_size').val(pledge_size);
        $('#pledge_price').val(pledge_price);

        $('#exampleModal').modal('show');
    });

    // display extras on click
    $("#addExtras").change((e) => {
        // toggle hidden visibility to div id extrasInputsForm
        $('#extrasInputsForm').prop('hidden', !e.target.checked);
        // set required to input extras_note and extras_price, delete required if hidden
        $('#extras_note').prop('required', e.target.checked);
        $('#extras_price').prop('required', e.target.checked);
    });
});