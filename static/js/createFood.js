$('#back-button').on('click', () => {
    window.location.href = 'manageFood'
})
$('#create-button').on('click', () => {
    const name = $('#food-name-input').val()
    if (!name) {
        $('#food-name-error').css('display', 'inline')
        return
    }
    const data = {
        'name': name
    }
    post('/api/admin/createFood', (data)).then((res) => {
        if (res.okay) {
            window.location.href = '/manageFood'
        } else {
            if (res.error.errno == 0) {
                $('#food-name-error').css('display', 'inline')
            } else if (res.error.errno == 1) {
                window.alert('Bad request.')
            } else if (res.error.errno == 2) {
                window.alert('Database error.')
            }
        }
    })
})
$('#food-name-input').on('input', () => {
    $('#food-name-error').css('display', 'none')
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
