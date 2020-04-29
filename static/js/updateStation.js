$('#back-button').on('click', () => {
    window.location.href= 'manageBuildingAndStation'
})

$('#update-button').on('click', () => {
    const testResult = toggleError()
    if (testResult) {
        const data = testResult
        post('/api/admin/updateStation', data).then(res => {
            if (res.okay) {
                window.location.href = '/manageBuildingAndStation'
            } else {
                if (res.error.errno == 0) {
                    window.alert('Station name does not exist.')
                } else if (res.error.errno == 1) {
                    window.alert('Database error.')
                } else if (res.error.errno == 2) {
                    window.alert('Bad request.')
                } else if (res.error.errno == 3) {
                    $('#invalid-capacity-error').css('display', 'inline')
                }
            }
        })
    }
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

let oldSponsoredBuilding = ''
get('/api/admin/getStation?' + window.location.href.split('?')[1]).then((res) => {
    if (res.okay) {
        if (res.data.length == 0) {
            window.alert('Station does not exist!')
            return
        }
        $('#name-input').val(res.data.stationName)
        $('#capacity-input').val(res.data.capacity)
        oldSponsoredBuilding = res.data.buildingName
        getAvailableBuildingList()
    } else if (res.error.errno == 0) {
        window.alert('Bad request.')
    } else if (res.error.errno == 1) {
        window.alert('Station does not exist.')
    }
})

function getAvailableBuildingList() {
    get('/api/admin/getAvailableBuilding').then((res) => {
        if (res.okay) {
            let options = `<option value="${oldSponsoredBuilding}">${oldSponsoredBuilding}</option><option value="${oldSponsoredBuilding}">${oldSponsoredBuilding}</option>`
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
