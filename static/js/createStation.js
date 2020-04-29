$('#back-button').on('click', () => {
    window.location.href= 'manageBuildingAndStation'
})

$('#create-button').on('click', () => {
    const testResult = toggleError()
    if (testResult) {
        const data = testResult
        post('/api/admin/createStation', data).then(res => {
            if (res.okay) {
                window.location.href = '/manageBuildingAndStation'
            } else {
                if (res.error.errno == 0) {
                    $('#station-name-error').css('display', 'inline')
                } else if (res.error.errno == 1) {
                    window.alert('Database error.')
                } else if (res.error.errno == 2) {
                    window.alert('Bad request.')
                }
            }
        })
    }
})

$('#name-input').on('input', () => {
    $('#station-name-error').css('display', 'none')
})
$('#capacity-input').on('input', () => {
    $('#invalid-capacity-error').css('display', 'none')
})
$('#sponsored-building-select-wrapper').on('click', () => {
    $('#no-building-error').css('display', 'none')
})

function toggleError() {
    let passed = true
    const name = $('#name-input').val()
    const capacityStr = $('#capacity-input').val()
    const sponsoredBuilding = $('#sponsored-building-select').children('option:selected').val()
    if (!name) {
        $('#station-name-error').css('display', 'inline')
        passed = false
    }
    if (!(/^[0-9]+$/.test(capacityStr) && parseInt(capacityStr) > 0)) {
        $('#invalid-capacity-error').css('display', 'inline')
        passed = false
    }
    if (!sponsoredBuilding) {
        $('#no-building-error').css('display', 'inline')
        passed = false
    }
    if (passed) {
        return {
            "name": name,
            "capacity": parseInt(capacityStr),
            "sponsoredBuilding": sponsoredBuilding
        }
    }
    return false
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

getAvailableBuildingList()
function getAvailableBuildingList() {
    get('/api/admin/getAvailableBuilding').then((res) => {
        if (res.okay) {
            let options = '<option value="">&nbsp;</option><option value="">&nbsp;</option>'
            res.data.forEach((obj) => {
                options += `<option value="${obj.buildingName}">${obj.buildingName}</option>`
            })
            $('#sponsored-building-select-wrapper').html(`
                <select id="sponsored-building-select">
                    ${options}
                </select>
            `)
            initializeSelect()
        } else {
            window.alert('Database error.');
        }
    })
}
