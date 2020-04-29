from __main__ import app, mysqlDB
from flask import request, make_response
from model.dataModel import SuccessModel, ErrorModel
from login.user import User
from flask_login import login_user
from util.validate import isUsername, isPassword, isFirstName, isLastName, isBalance, isEmail
from util.db import checkExist, callProcedure, select
import json


def getUserRoles(username):
    res = select('login_classifier', '`username` = "{}"'.format(username), '`userType`')
    if len(res['data']) > 0:
        return res['data'][0]['userType'].split('-')
    else:
        return []

"""
    This API is used for logging in users.

    On success, user and its roles will be stored in session (server) and cookie (client), and a success model is responsed; 
    on failure, an error model is responsed.
"""
@app.route('/api/user/login', methods=['POST'])
def api_user_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if username and password:
        callProcedure('login', [username, password])
        if checkExist('login_result', '1 = 1', ()):
            username = select('login_result', '1 = 1', '`username`')['data'][0]['username']
            user = User.get(username)
            if user is None:
                user = User(username, getUserRoles(username))
            login_user(user)
            resp = make_response(SuccessModel().json())
            resp.set_cookie('user-roles', json.dumps(user.roles))
            return resp
    
    return ErrorModel('Login Failed').json()


"""
    This API is used for registering users. Some possible error numbers and their corresponding translations are shown below.

    errno       meaning
    --------------------------------------------------------
    0           username taken
    1           full name taken
    2           email taken for employee
    3           db error, often caused by data type overflow

    On success, db will be modifed, and a list of roles ['customer', 'admin' ...] will be responsed in JSON format;
    on failure, db is unchanged, and an errno is generated and responsed to tell the client which type of error it has encountered.
"""
@app.route('/api/user/register', methods=['POST'])
def api_user_regiser():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    firstName = data.get('firstName')
    lastName = data.get('lastName')
    email = data.get('email')
    balance = data.get('balance')
    employeeType = data.get('employeeType')

    # call register procedure
    callProcedure('register', [
        username,
        email,
        firstName,
        lastName,
        password,
        balance,
        employeeType
    ])

    roles = getUserRoles(username)

    err_no = (select('err_msg', '1 = 1', '`err`')['data'][0]['err'])
    if err_no == 0:
        if not mysqlDB.tryCommit():
            return ErrorModel({'errno': 3}).json()
        return SuccessModel({
            'roles': roles
        }).json()
    
    return ErrorModel({
        'errno': int(err_no - 1)
    }).json()
