from __main__ import app, mysqlDB
from flask import request, make_response
from model.dataModel import SuccessModel, ErrorModel
from login.user import User
from flask_login import login_required, current_user
from util.db import checkExist, callProcedure, select
from util.data_cleaning import cleanDecimal, formatDate, formatOrderID
import datetime
import json


"""
    This API is used for customer filter.
"""
@app.route('/api/customer/explore', methods=['GET'])
def api_customer_explore():
    if not hasattr(current_user, 'roles') or 'Customer' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Customer').json()

    data = json.loads(request.args.get('data') or '{}')
    buildingName = data.get('buildingName')
    stationName = data.get('stationName')
    buildingTag = data.get('buildingTag')
    foodTruckName = data.get('foodTruckName')
    food = data.get('food')

    ret = {}
    callProcedure('cus_filter_explore', [buildingName, stationName, buildingTag, foodTruckName, food])
    ret['table'] = select('cus_filter_explore_result', '1 = 1', '*')['data']

    ret['stationList'] = mysqlDB.select(
        'SELECT stationName from Station;',
        ()
    )['data']

    ret['buildingList'] = mysqlDB.select(
        'SELECT buildingName from Station;',
        ()
    )['data']

    return SuccessModel(ret).json()


"""
    this API is used for select location.
"""
@app.route('/api/customer/selectLocation', methods=['POST'])
def api_customer_selectLocation():
    if not hasattr(current_user, 'roles') or 'Customer' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Customer').json()
    
    data = request.get_json()
    station = data.get('station')
    username = current_user.id
    
    callProcedure('cus_select_location', [username, station])
    if not mysqlDB.tryCommit():
        return ErrorModel({'errno': 0}).json()

    return SuccessModel({}).json()


"""
    This API is used for displaying customer current information
"""
@app.route('/api/customer/currentInformation', methods=['GET'])
def api_customer_currentInformation():
    if not hasattr(current_user, 'roles') or 'Customer' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Customer').json()
    
    username = current_user.id

    ret = {}
    callProcedure('cus_current_information_basic', [username])
    ret['basic'] = select('cus_current_information_basic_result', '1 = 1', '*')['data']
    cleanDecimal(ret['basic'], 'balance', 2)
    callProcedure('cus_current_information_foodTruck', [username])
    ret['foodTrucks'] = select('cus_current_information_foodTruck_result', '1 = 1', '*')['data']

    return SuccessModel(ret).json()


"""
    This API is used for getting foodtruck menu
"""
@app.route('/api/customer/foodTruckMenu', methods=['GET'])
def api_customer_foodTruckMenu():
    if not hasattr(current_user, 'roles') or 'Customer' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Customer').json()
    
    data = json.loads(request.args.get('data') or '{}')
    foodTruck = data.get('foodTruck')
    
    callProcedure('mn_view_foodTruck_menu', [foodTruck])
    ret = select('mn_view_foodTruck_menu_result', '1 = 1', 'foodName, price')['data']
    cleanDecimal(ret, 'price', 2)

    return SuccessModel(ret).json()


"""
    This API is used for making order.

        errno       meaning
    --------------------------------------------------------
    0           bad request
    1           fail to create order
    2           balance not enough
    3           db error
"""
@app.route('/api/customer/makeOrder', methods=['POST'])
def api_customer_makeOrder():
    if not hasattr(current_user, 'roles') or 'Customer' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Customer').json()
    
    username = current_user.id
    data = request.get_json()
    foodTruck = data.get('foodTruck')
    date = data.get('date')
    menuItems = data.get('menuItems')
    
    if type(foodTruck) is not str or type(date) is not str or type(menuItems) is not list:
        return ErrorModel({'errno': 0}).json()

    totalPrice = 0
    for menuItem in menuItems:
        thisPrice = mysqlDB.select(
            'SELECT price FROM MenuItem WHERE foodTruckName = %s AND foodName = %s;',
            (foodTruck, menuItem['food'])
        )['data'][0]['price']
        totalPrice = totalPrice + thisPrice * menuItem['quantity']
    balance = mysqlDB.select(
        'SELECT balance FROM Customer WHERE username = %s;',
        (username)
    )['data'][0]['balance']
    if totalPrice > balance:
        return ErrorModel({'errno': 2}).json()
    
    callProcedure('cus_order', [date, username])
    currOrderIDArr = mysqlDB.select(
        'SELECT MAX(orderID) AS currOrderID FROM Orders WHERE orderID NOT IN (SELECT DISTINCT orderID FROM OrderDetail);',
        ()
    )['data']
    if len(currOrderIDArr) == 0:
        return ErrorModel({'errno': 1}).json()
    currOrderID = currOrderIDArr[0]['currOrderID']
    for menuItem in menuItems:
        callProcedure('cus_add_item_to_order', [foodTruck, menuItem['food'], menuItem['quantity'], currOrderID])

    if not mysqlDB.tryCommit():
        return ErrorModel({'errno': 3}).json()

    return SuccessModel({}).json()


"""
    This API is used for showing order history.
"""
@app.route('/api/customer/orderHistory', methods=['GET'])
def api_customer_orderHistory():
    if not hasattr(current_user, 'roles') or 'Customer' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Customer').json()
    
    username = current_user.id

    callProcedure('cus_order_history', [username])
    ret = select('cus_order_history_result', '1 = 1', '*')['data']
    cleanDecimal(ret, 'orderTotal', 2)
    formatDate(ret, 'date')
    formatOrderID(ret, 'orderID')

    return SuccessModel(ret).json()
