$('#back-button').on('click', () => {
    window.location.href = 'home'
})

// Send get request
function get(url) {
    return $.get(url)
}

// Send post request
function post(url, data = {}) {
    return $.ajax({
        type: 'post',
        url,
        data: JSON.stringify(data),
        contentType: "application/json",
    })
}

get('/api/customer/orderHistory').then((res) => {
    if (res.okay) {
        data = res.data
        $('#target-table tr:not(:first)').remove()
        data.forEach(row => {
            $('#target-table').append(`
                <tr>
                    <td>${row.date}</td>
                    <td>${row.orderID}</td>
                    <td>${row.orderTotal}</td>
                    <td>${row.foodNames.split(',').join(',<br/>')}</td>
                    <td>${row.foodQuantity}</td>
                </tr>
            `)
        })
    } else {
        window.alert('Request failed.')
    }
})
