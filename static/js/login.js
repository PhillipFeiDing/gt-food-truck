$('#register-button').on('click', () => {
    window.location.href = 'register'
})

$('#login-button').on('click', () => {
    username = $('#username-input').val()
    password = $('#password-input').val()
    data = {
        'username': username,
        'password': password
    }
    post('/api/user/login', data).then((res) => {
        if (res.okay) {
            window.location.href = '/home'
        } else {
            $('#login-fail-error').css('display', 'inline')
        }
    })
})
$('#username-input, #password-input').on('input', () => {
    $('#login-fail-error').css('display', 'none')
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
