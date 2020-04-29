const url = '/api/admin/manageBuildingAndStation'

$('#back-button').on('click', () => {
    window.location.href = 'home'
})
$('#create-building-button').on('click', () => {
    window.location.href = 'createBuilding'
})
$('#create-station-button').on('click', () => {
    window.location.href = 'createStation'
})
$('#update-building-button').on('click', () => {
    if (!toggleBuildingSelectError()) {
        return
    }
    window.location.href = 'updateBuilding?data=' + encodeURIComponent(JSON.stringify({'buildingName': $("input[name='building']:checked").val()}))
})
$('#update-station-button').on('click', () => {
    if (!toggleBuildingSelectError()) {
        return
    }
    if ($("input[name='building']:checked").attr('hasStation') == 'true') {
        window.location.href = 'updateStation?data=' + encodeURIComponent(JSON.stringify({'buildingName': $("input[name='building']:checked").val()}))
    } else {
        $('#none-selected-error').css('display', 'inline')
    }
})
$('#delete-building-button').on('click', () => {
    const building = toggleBuildingSelectError()
    if (!building) {
        return
    }
    const data = {
        "building": building
    }
    post('/api/admin/deleteBuilding', data).then((res) => {
        if (res.okay) {
            window.alert(`Successfully deleted building ${building}.`)
            requestDataAndRefresh()
        } else if (res.error.errno == 0) {
            window.alert('Database error.')
        } else if (res.error.errno == 1) {
            window.alert('Bad request.')
        }
    })
})
$('#delete-station-button').on('click', () => {
    const building = toggleBuildingSelectError()
    if (!building) {
        return
    }
    if ($("input[name='building']:checked").attr('hasStation') == 'true') {
        const data = {
            "building": building
        }
        post('/api/admin/deleteStation', data).then((res) => {
            if (res.okay) {
                window.alert(`Successfully deleted station whose sponsor is ${building}.`)
                requestDataAndRefresh()
            } else if (res.error.errno == 0) {
                window.alert('Database error.')
            } else if (res.error.errno == 1) {
                window.alert('Bad request.')
            } else if (res.error.errno == 2) {
                window.alert('Station does not exist.')
            }
        })
    } else {
        $('#none-selected-error').css('display', 'inline')
    }
})
$('#filter-button').on('click', () => {
    const tagResult = toggleCapacityRangeError()
    if (!tagResult) {
        return
    }
    const buildingName = $('#building-name-select').children('option:selected').val()
    const stationName = $('#station-name-select').children('option:selected').val()
    const buildingTag = $('#building-tag-input').val()
    let data = {}
    if (buildingName.length != 0) {
        data.buildingName = buildingName
    }
    if (stationName.length != 0) {
        data.stationName = stationName
    }
    if (buildingTag.length != 0) {
        data.buildingTag = buildingTag
    }
    if (!jQuery.isEmptyObject(tagResult)) {
        data.capacity = tagResult
    }
    
    filterOptions = data
    requestDataAndRefresh()
})
$('#capacity-input-low, #capacity-input-high').on('input', () => {
    $('#invalid-range-error').css('display', 'none')
})

function toggleBuildingSelectError() {
    const ret = $("input[name='building']:checked").val()
    if (!ret) {
        $('#none-selected-error').css('display', 'inline')
        return false
    }
    return ret;
}

function toggleCapacityRangeError() {
    const lowStr = $('#capacity-input-low').val()
    const highStr = $('#capacity-input-high').val()
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

let lastCheckedRadioButtonValue = null
bindRadioButtons()
function bindRadioButtons() {
    $("input[name='building']").on('click', function() {
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

function refresh(data) {
    $('#target-table').html('')
    $('#target-table').append(`
        <tr>
            <td>Building</td>
            <td>Tag(s)</td>
            <td>Station</td>
            <td>Capacity</td>
            <td>Food Truck (s)</td>
        </tr>
    `)
    data.table.forEach((row) => {
        $('#target-table').append(`
        <tr>
            <td>
                <div class="radio-button-wrapper">
                    <span class="radio-button-prompt"><input type="radio" name="building" value="${row.buildingName}" class="radio-button-left" hasStation="${!(row.stationName == null)}">${row.buildingName}</span>
                </div>
            </td>
            <td>${commaNewLine(row.tags) || ''}</td>
            <td>${row.stationName || ''}</td>
            <td>${row.capacity || ''}</td>
            <td>${commaNewLine(row.foodTruckNames) || ''}</td>
        </tr>
        `)
    })
    bindRadioButtons()

    let options = '<option value="">&nbsp;</option><option value="">&nbsp;</option>'
    data.buildingList.forEach((building) => {
        options += `<option value="${building.buildingName}">${building.buildingName}</option>`
    })
    $('#building-select-wrapper').html(`
        <div class="custom-select unselectable">
            <select id="building-name-select">
                ${options}
            </select>
        </div>
    `)

    options = '<option value="">&nbsp;</option><option value="">&nbsp;</option>'
    data.stationList.forEach((station) => {
        options += `<option value="${station.stationName}">${station.stationName}</option>`
    })
    $('#station-select-wrapper').html(`
        <div class="custom-select unselectable">
            <select id="station-name-select">
                ${options}
            </select>
        </div>
    `)

    initializeSelect()

    $('#building-tag-input').val('')
    $('#capacity-input-low').val('')
    $('#capacity-input-high').val('')
}

function commaNewLine(data) {
    if (!data) {
        return data
    } else {
        return data.split(',').join(',<br/>')
    }
}
