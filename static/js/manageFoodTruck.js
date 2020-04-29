const url = '/api/manager/manageFoodTruck'

$('#back-button').on('click', () => {
    window.location.href = 'home'
})

$('#filter-button').on('click', () => {
    const staffRangeResult = toggleStaffCountRangeError()
    if (!staffRangeResult) {
        return
    }
    const foodTruckName = $('#food-truck-name-input').val()
    const stationName = $('#station-name-select').children('option:selected').val()
    const hasRemainingCapacity = $('#has-remaining-capacity-input:checked').val()
    let data = {}
    if (foodTruckName.length != 0) {
        data.foodTruckName = foodTruckName
    }
    if (stationName.length != 0) {
        data.stationName = stationName
    }
    if (hasRemainingCapacity) {
        data.hasRemainingCapacity = true
    }
    if (!jQuery.isEmptyObject(staffRangeResult)) {
        data.staffCount = staffRangeResult
    }
    filterOptions = data
    requestDataAndRefresh()
    $('#food-truck-name-input').val('')
    $('#staff-count-input-low').val('')
    $('#staff-count-input-high').val('')
    hasRemainingCapacity = $('#has-remaining-capacity-input:checked').val()
    if (hasRemainingCapacity) {
        $('#has-remaining-capacity-input').click()
    }
})
$('#staff-count-input-low, #staff-count-input-high').on('input', () => {
    $('#invalid-range-error').css('display', 'none')
})

$('#create-button').on('click', () => {
    window.location.href = 'createFoodTruck'
})
$('#update-button').on('click', () => {
    const foodTruck = toggleFoodTruckSelectError()
    if (!foodTruck) {
        return
    }
    window.location.href = 'updateFoodTruck?data=' + encodeURIComponent(JSON.stringify({'foodTruckName': $("input[name='food-truck']:checked").val()}))
})
$('#delete-button').on('click', () => {
    const foodTruck = toggleFoodTruckSelectError()
    if (!foodTruck) {
        return
    }
    const data = {
        "foodTruck": foodTruck
    }
    post('/api/manager/deleteFoodTruck', (data)).then(res => {
        if (res.okay) {
            window.alert(`Successfully deleted food truck ${foodTruck}.`)
            requestDataAndRefresh()
        } else {
            if (res.error.errno == 0) {
                window.alert('Bad request.')
            } else if (res.error.errno == 1) {
                window.alert('Database error.')
            }
        }
    })
})

function toggleStaffCountRangeError() {
    const lowStr = $('#staff-count-input-low').val()
    const highStr = $('#staff-count-input-high').val()
    if (/^[0-9]*$/.test(lowStr) && /^[0-9]*$/.test(highStr)) {
        const low = parseInt(lowStr)
        const high = parseInt(highStr)
        if (isNaN(low) && !isNaN(high)) {
            return {'high': high}
        } else if (!isNaN(low) && isNaN(high)) {
            return {'low': low}
        } else if (!isNaN(low) && !isNaN(high)) {
            if (low <= high) {
                return {'low': low, 'high': high}
            }
        } else {
            return {}
        }
    }
    $('#invalid-range-error').css('display', 'inline')
    return false
}

function toggleFoodTruckSelectError() {
    const ret = $("input[name='food-truck']:checked").val()
    if (!ret) {
        $('#none-selected-error').css('display', 'inline')
        return false
    }
    return ret;
}

let lastCheckedRadioButtonValue = null
bindRadioButtons()
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

let filterOptions = ''
function requestDataAndRefresh() {
    if (filterOptions === '') {
        targetURL = url
    } else {
        targetURL = url + '?data=' + encodeURIComponent(JSON.stringify(filterOptions))
    }
    get(targetURL).then((res) => {
        if (res.okay) {
            refresh(res.data)
        } else {
            window.alert('Request Error.')
        }
    })
}
requestDataAndRefresh()

function refresh(data) {
    $('#target-table tr:not(:first)').remove()
    data.table.forEach((row) => {
        $('#target-table').append(`
            <tr>
                <td>
                    <div class="radio-button-wrapper">
                        <span class="radio-button-prompt"><input type="radio" name="food-truck" value="${row.foodTruckName}" class="radio-button-left">${row.foodTruckName}</span>
                    </div>
                </td>
                <td>${row.stationName}</td>
                <td>${row.remainingCapacity}</td>
                <td>${row.staffCount}</td>
                <td>${row.menuItemCount}</td>
            </tr>
        `)
    })
    bindRadioButtons()

    let options = '<option value="">&nbsp;</option><option value="">&nbsp;</option>'
    data.stationList.forEach((station) => {
        options += `<option value="${station.stationName}">${station.stationName}</option>`
    })
    $('#station-name-select-wrapper').html(`
        <div class="custom-select unselectable">
            <select id="station-name-select">
                ${options}
            </select>
        </div>
    `)
    initializeSelect()
}

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
