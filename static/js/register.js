$('#back-button').on('click', () => {
    window.location.href = 'login'
})

/* utility functions */
const fieldRegex = {
    'username': /^.+$/,
    'email': /^$|^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/,
    'first-name': /^.+$/,
    'last-name': /^.+$/,
    'password': /^.{8,}$/,
    'balance': /^[0-9]*\.{0,1}[0-9]{0,2}$/
}
function isValid(type, input) {
    const regexTest = fieldRegex[type].test(input)
    let extraTest = true
    if (regexTest) {
        if (type == 'balance') { // additional test to check balance > 0
            extraTest = parseFloat(input) > 0 || input === ''
        }
    }
    return regexTest && extraTest
}
function toggleError(field) {
    if (isValid(field, $('#' + field + '-input').val())) {
        $('#' + field + '-error').css('display', 'none')
        return true
    } else {
        $('#' + field + '-error').css('display', 'inline')
        return false
    }
}

/* frontend input validation */
/* when updating */
Object.keys(fieldRegex).forEach((field) => {
    $('#' + field + '-input').focusout(() => {
        toggleError(field)
    })
    $('#' + field + '-input').on('input', () => {
        toggleError(field)
    })
})
/* when submitting */
$('#confirm-password-input').on('input', () => {
    $('#confirm-password-error').css('display', 'none')
})
$('#balance-input').on('input', () => {
    $('#invalid-user-error').css('display', 'none')
})
$('#email-input').on('input', () => {
    $('#invalid-user-error').css('display', 'none')
    if ($('#email-input').val() === '') {
        $('#employee-type-error').css('display', 'none')
    } else {
        $('#employee-no-email-error').css('display', 'none')
    }
})
$('#first-name-input, #last-name-input').on('input', () => {
    $('#full-name-error').css('display', 'none')
})
let lastCheckedRadioButtonValue = null
$("input[name='user-type']").on('click', function() {
    if (!lastCheckedRadioButtonValue || lastCheckedRadioButtonValue !== this.value) {
        lastCheckedRadioButtonValue = this.value
        $('#none-selected-error').css('display', 'none')
    } else {
        this.checked = false
        lastCheckedRadioButtonValue = null
    }
    if (this.checked) {
        $('#employee-type-error').css('display', 'none')
    } else {
        $('#employee-no-email-error').css('display', 'none')
    }
})
function validateOnSubmit() {
    let passed = true
    Object.keys(fieldRegex).forEach((field) => {
        if (!toggleError(field)) {
            passed = false
        }
    })
    if ($('#confirm-password-input').val() !== $('#password-input').val()) {
        $('#confirm-password-error').css('display', 'inline')
        passed = false
    }
    if ($('#balance-input').val() === '' && $('#email-input').val() === '') {
        $('#invalid-user-error').css('display', 'inline')
        passed = false
    }
    if ($('#email-input').val() !== '' && !$("input[name='user-type']:checked").val()) {
        $('#employee-type-error').css('display', 'inline')
        passed = false
    }
    if ($('#email-input').val() === '' && $("input[name='user-type']:checked").val()) {
        $('#employee-no-email-error').css('display', 'inline')
        passed = false
    }
    return passed
}
$('#register-button').on('click', () => {
    const passed = validateOnSubmit()
    if (!passed) {
        return
    }
    const data = {
        username: $('#username-input').val(),
        email: $('#email-input').val(),
        firstName: $('#first-name-input').val(),
        lastName: $('#last-name-input').val(),
        password: $('#password-input').val(),
        balance: parseFloat($('#balance-input').val()),
        employeeType: $("input[name='user-type']:checked").val()
    }
    post('/api/user/register', data).then((res) => {
        if (res.okay) {
            const roles = res.data.roles
            let roleStr = ''
            if (roles.length == 1) {
                roleStr = roles[0]
            } else {
                roleStr = roles[0] + ' and ' + roles[1]
            }
            window.alert('You have successfully registered as ' + roleStr + '.')
            window.location.href = '/login'
        } else {
            if (res.error.errno == 0) {
                $('#username-error').css('display', 'inline')
            } else if (res.error.errno == 1) {
                $('#full-name-error').css('display', 'inline')
            } else if (res.error.errno == 2) {
                $('#email-error').css('display', 'inline')
            } else if (res.error.errno == 3) {
                window.alert('Database Error.')
            }
        }
    })
})

// Send post request
function post(url, data = {}) {
    return $.ajax({
        type: 'post',
        url,
        data: JSON.stringify(data),
        contentType: "application/json",
    })
}
