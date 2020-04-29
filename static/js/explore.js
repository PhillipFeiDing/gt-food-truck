const url = '/api/customer/explore'

$('#back-button').on('click', () => {
    window.location.href = 'home'
})

$('#filter-button').on('click', () => {
    const buildingName = $('#building-name-select').children('option:selected').val()
    const stationName = $('#station-name-select').children('option:selected').val()
    const buildingTag = $('#building-tag-input').val()
    const foodTruckName = $('#food-truck-name-input').val()
    const food = $('#food-input').val()
    let data = {}
    if (buildingName !== '') {
        data.buildingName = buildingName
    }
    if (stationName !== '') {
        data.stationName = stationName
    }
    if (buildingTag !== '') {
        data.buildingTag = buildingTag
    }
    if (foodTruckName !== '') {
        data.foodTruckName = foodTruckName
    }
    if (food !== '') {
        data.food = food
    }
    filterOptions = data
    requestDataAndRefresh()

    $('#building-tag-input').val('')
    $('#food-truck-name-input').val('')
    $('#food-input').val('')
})

$('#select-as-current-location-button').on('click', () => {
    const station = toggleStationSelectError()
    if (!station) {
        return
    }
    const data = {
        'station': station
    }
    post('/api/customer/selectLocation', data).then(res => {
        if (res.okay) {
            window.location.href = 'currentInformation'
        } else {
            window.alert('Request failed.')
        }
    })
})

function toggleStationSelectError() {
    const ret = $("input[name='station']:checked").val()
    if (!ret) {
        $('#none-selected-error').css('display', 'inline')
        return false
    }
    return ret;
}

let lastCheckedRadioButtonValue = null
function bindRadioButtons() {
    $("input[name='station']").on('click', function() {
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

let filterOptions = {}
function requestDataAndRefresh() {
    if (jQuery.isEmptyObject(filterOptions)) {
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

    const table = data.table
    const stationList = data.stationList
    const buildingList = data.buildingList

    $('#target-table tr:not(:first)').remove()
    table.forEach((row) => {
        $('#target-table').append(`
            <tr>
                <td>
                    <div class="radio-button-wrapper">
                        <span class="radio-button-prompt"><input type="radio" name="station" value="${row.stationName}" class="radio-button-left">${row.stationName}</span>
                    </div>
                </td>
                <td>${row.buildingName}</td>
                <td>${(row.foodTruckNames || '').split(',').join(',<br/>')}</td>
                <td>${(row.foodNames || '').split(',').join(',<br/>')}</td>
            </tr>
        `)
    })
    bindRadioButtons()

    let options = '<option value="">&nbsp;</option><option value="">&nbsp;</option>'
    stationList.forEach((station) => {
        options += `<option value="${station.stationName}">${station.stationName}</option>`
    })
    $('#station-name-select-wrapper').html(`
        <div class="custom-select unselectable">
            <select id="station-name-select">
                ${options}
            </select>
        </div>
    `)
    initializeSelect('station-name-select-class')

    options = '<option value="">&nbsp;</option><option value="">&nbsp;</option>'
    buildingList.forEach((building) => {
        options += `<option value="${building.buildingName}">${building.buildingName}</option>`
    })
    $('#building-name-select-wrapper').html(`
        <div class="custom-select unselectable">
            <select id="building-name-select">
                ${options}
            </select>
        </div>
    `)
    initializeSelect('building-name-select-class')
}
