$(document).ready(function () {
    $('.unhide-size-input').change(function () {
        // display the input field
        let target_div = $(`#inputContainer${this.value}`);
        // toggle the char required attribute in input field
        $(`#price-product${this.value}`).prop('required', function (i, v) { return !v; });
        // toggle d-none class into target_div
        target_div.toggleClass('d-none');
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
});