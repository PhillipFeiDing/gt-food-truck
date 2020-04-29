$('#back-button').on('click', () => {
    window.location.href = 'foodTruckSummary'
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

async function refreshData() {
    const foodTruckName = JSON.parse(decodeURIComponent(window.location.href.split('?')[1]).split('=')[1]).foodTruckName
    $('#food-truck-name-display').text(foodTruckName)
    const res = await get('/api/manager/summaryDetail?' + window.location.href.split('?')[1])
    if (res.okay) {
        $('#target-table tr:not(:first)').remove()
        data = res.data
        data.forEach(row => {
            $('#target-table').append(`
                <tr>
                    <td>${row.date}</td>
                    <td>${row.customerName}</td>
                    <td>${row.totalPurchase}</td>
                    <td>${row.orderCount}</td>
                    <td>${row.foodNames.split(',').join(',<br/>')}</td>
                </tr>
            `)
        })
    } else {
        window.alert('Request failed.')
    }
}
refreshData()
