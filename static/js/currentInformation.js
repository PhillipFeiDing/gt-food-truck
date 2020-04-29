$('#back-button').on('click', () => {
    window.location.href = 'home'
})
$('#order-button').on('click', () => {
    const foodTruck = toggleFoodTruckSelectError()
    if (!foodTruck) {
        return
    }
    window.location.href = 'order?data=' + encodeURIComponent(JSON.stringify({'foodTruck': foodTruck}))
})

function toggleFoodTruckSelectError() {
    const ret = $("input[name='food-truck']:checked").val()
    if (!ret) {
        $('#none-selected-error').css('display', 'inline')
        return false
    }
    return ret;
}

let lastCheckedRadioButtonValue = null
function bindRadioButtons() {
    $("input[name='food-truck']").on('click', function() {
        if (!lastCheckedRadioButtonValue || lastCheckedRadioButtonValue !== this.value) {
            lastCheckedRadioButtonValue = this.value
            $('#none-selected-error').css('display', 'none')
        } else {
            this.checked = false
            lastCheckedRadioButtonValue = null
        }
    })
}
bindRadioButtons()

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

const url = '/api/customer/currentInformation'
get(url).then((res) => {
    if (res.okay) {
        data = res.data
        basic = data.basic[0]
        $('#station-display').text(basic.stationName || 'N/A')
        $('#building-display').text(basic.buildingName || 'N/A')
        $('#building-tag-display').text(basic.tags || 'N/A')
        $('#description-display').text(basic.description || 'N/A')
        $('#balance-display').text(basic.balance)

        table = data.foodTrucks
        $('#target-table tr:not(:first)').remove()
        table.forEach(row => {
            $('#target-table').append(`
            <tr>
                <td>
                    <div class="radio-button-wrapper">
                        <span class="radio-button-prompt"><input type="radio" name="food-truck" value="${row.foodTruckName}" class="radio-button-left">${row.foodTruckName}</span>
                    </div>
                </td>
                <td>${row.managerName}</td>
                <td>${row.foodNames.split(',').join(',<br/>')}</td>
            </tr>
            `)
        })
        bindRadioButtons()
    } else {
        window.alert('Request failed.')
    }
})
