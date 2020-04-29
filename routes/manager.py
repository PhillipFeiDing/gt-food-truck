from __main__ import app, mysqlDB
from flask import request, make_response
from model.dataModel import SuccessModel, ErrorModel
from login.user import User
from flask_login import login_required, current_user
from util.db import checkExist, callProcedure, select
from util.data_cleaning import cleanDecimal, formatDate
import json


"""
    This API is used for manage foodtruck.
"""
@app.route('/api/manager/manageFoodTruck', methods=['GET'])
def api_manager_manageFoodTruck():
    if not hasattr(current_user, 'roles') or 'Manager' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Manager').json()
    
    username = current_user.id

    data = json.loads(request.args.get('data') or '{}')
    foodTruckName = data.get('foodTruckName') or ''
    stationName = data.get('stationName') or ''
    staffCount = data.get('staffCount')
    low = None
    high = None
    if staffCount:
        low = staffCount.get('low')
        high = staffCount.get('high')
    hasRemainingCapacity = data.get('hasRemainingCapacity')
    if hasRemainingCapacity is None:
        hasRemainingCapacity = False

    callProcedure('mn_filter_foodTruck', [username, foodTruckName, stationName, low, high, hasRemainingCapacity])
    ret = {}
    ret['table'] = select('mn_filter_foodTruck_result', '1 = 1', '*')['data']

    callProcedure('mn_get_station', [username])
    ret['stationList'] = select('mn_get_station_result', '1 = 1', '*')['data']

    return SuccessModel(ret).json()


"""
    This API is used for getting available stations.
"""
@app.route('/api/manager/getAvailableStation', methods=['GET'])
def api_manager_getAvailableStation():
    if not hasattr(current_user, 'roles') or 'Manager' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Manager').json()

    data = json.loads(request.args.get('data') or '{}')
    foodTruckName = data.get('foodTruckName')
    
    callProcedure('mn_get_available_station', [foodTruckName])
    data = select('mn_get_available_station_result', '1 = 1', '*')['data']
    
    if foodTruckName:
        data = tuple(list(mysqlDB.select('SELECT stationName FROM FoodTruck WHERE foodTruckName = %s;', (foodTruckName))['data']) + list(data))
    
    return SuccessModel(data).json()


"""
    This API is used for getting all unassigned available staffs + current staffs on the food truck.
"""
@app.route('/api/manager/getAvailableStaff', methods=['GET'])
def api_manager_getAvailableStaff():
    if not hasattr(current_user, 'roles') or 'Manager' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Manager').json()
    
    username = current_user.id

    callProcedure('mn_view_foodTruck_available_staff', [username, None])
    data = select('mn_view_foodTruck_available_staff_result', '1 = 1', '*')['data']

    urlData = json.loads(request.args.get('data') or '{}')
    foodTruckName = urlData.get('foodTruckName')
    if foodTruckName:
        callProcedure('mn_view_foodTruck_staff', [foodTruckName])
        newData = select('mn_view_foodTruck_staff_result', '1 = 1', '*')['data']
        data = tuple(list(data) + list(newData))
    
    for obj in data:
        staffUsername = mysqlDB.select(
            'SELECT username from Staff NATURAL JOIN `User` WHERE CONCAT(firstName, " ", lastName) = %s',
            (obj.get('availableStaff') or obj.get('assignedStaff'))
        )['data'][0]['username']
        obj['username'] = staffUsername

    return SuccessModel(data).json()


"""
    This API is used for getting food list.
"""
@app.route('/api/manager/getFoodList', methods=['GET'])
def api_manager_getFoodList():
    if not hasattr(current_user, 'roles') or 'Manager' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Manager').json()

    return SuccessModel(mysqlDB.select(
        'SELECT * FROM Food;',
        ()
    )['data']).json()


"""
    This API is used for getting food list.

    errno       meaning
    --------------------------------------------------------
    0           bad request
    1           food truck name alreay exists
"""
@app.route('/api/manager/createFoodTruck', methods=['POST'])
def api_manager_createFoodTruck():
    if not hasattr(current_user, 'roles') or 'Manager' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Manager').json()
    
    username = current_user.id

    data = request.get_json()
    foodTruckName = data.get('name')
    station = data.get('station')
    staffs = data.get('assignedStaff')
    menuItems = data.get('menuItems')

    if not (type(foodTruckName) is str and type(station) is str and type(staffs) is list and type(menuItems) is list):
        return ErrorModel({'errno': 0}).json()

    callProcedure('mn_create_foodTruck_add_station', [foodTruckName, station, username])
    for staff in staffs:
        callProcedure('mn_create_foodTruck_add_staff', [foodTruckName, staff])
    for menuItem in menuItems:
        callProcedure('mn_create_foodTruck_add_menu_item', [foodTruckName, float(menuItem['price']), menuItem['food']])
    if not mysqlDB.tryCommit():
        return ErrorModel({'errno': 1}).json()
    
    return SuccessModel({}).json()


"""
    This API is used for getting menu item for a food truck.
"""
@app.route('/api/manager/getMenuItem', methods=['GET'])
def api_manager_getMenuItem():
    if not hasattr(current_user, 'roles') or 'Manager' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Manager').json()
    
    urlData = json.loads(request.args.get('data') or '{}')
    foodTruckName = urlData.get('foodTruckName')

    callProcedure('mn_view_foodTruck_menu', [foodTruckName])
    ret = select('mn_view_foodTruck_menu_result', '1 = 1', 'foodName, price')['data']
    cleanDecimal(ret, 'price', 2)
    return SuccessModel(ret).json()


"""
    This API is used for getting food list.

    errno       meaning
    --------------------------------------------------------
    0           bad request
    1           food truck name alreay exists
"""
@app.route('/api/manager/updateFoodTruck', methods=['POST'])
def api_manager_updateFoodTruck():
    if not hasattr(current_user, 'roles') or 'Manager' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Manager').json()
    
    username = current_user.id

    data = request.get_json()
    foodTruckName = data.get('name')
    oldFoodTruckName = data.get('oldName')
    station = data.get('station')
    staffs = data.get('assignedStaff')
    menuItems = data.get('menuItems')

    if not (type(foodTruckName) is str and type(oldFoodTruckName) is str and type(station) is str and type(staffs) is list and type(menuItems) is list):
        return ErrorModel({'errno': 0}).json()
    
    mysqlDB.modify(
        'UPDATE FoodTruck SET foodTruckName = %s WHERE foodTruckName = %s;',
        (foodTruckName, oldFoodTruckName)
    )
    callProcedure('mn_update_foodTruck_station', [foodTruckName, station])
    mysqlDB.modify(
        'UPDATE Staff SET foodTruckName = NULL WHERE foodTruckName = %s;',
        (foodTruckName)
    )
    for staff in staffs:
        callProcedure('mn_update_foodTruck_staff', [foodTruckName, staff])
    for menuItem in menuItems:
        if not checkExist('MenuItem', 'foodName = %s AND foodTruckName = %s', [menuItem['food'], foodTruckName]):
            callProcedure('mn_create_foodTruck_add_menu_item', [foodTruckName, float(menuItem['price']), menuItem['food']])
        else:
            callProcedure('mn_update_foodTruck_menu_item', [foodTruckName, float(menuItem['price']), menuItem['food']])
    if not mysqlDB.tryCommit():
        return ErrorModel({'errno': 1}).json()

    return SuccessModel({}).json()


"""
    This API is used for deleting a food truck.

    errno       meaning
    --------------------------------------------------------
    0           bad request
    1           database error
"""
@app.route('/api/manager/deleteFoodTruck', methods=['POST'])
def api_manager_deleteFoodTruck():
    if not hasattr(current_user, 'roles') or 'Manager' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Manager').json()

    data = request.get_json()
    name = data.get('foodTruck')

    if type(name) is not str:
        return ErrorModel({'errno': 0}).json()

    callProcedure('mn_delete_foodTruck', [name])
    if not mysqlDB.tryCommit():
        return ErrorModel({'errno': 1}).json()
    
    return SuccessModel({}).json()


"""
    This API is used for filtering foodtruck summary.
"""
@app.route('/api/manager/foodTruckSummary', methods=['GET'])
def api_manager_foodTruckSummary():
    if not hasattr(current_user, 'roles') or 'Manager' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Manager').json()
    
    urlData = json.loads(request.args.get('data') or '{}')

    username = current_user.id
    foodTruckName = urlData.get('foodTruckName')
    stationName = urlData.get('stationName')
    dateRange = urlData.get('dateRange')
    dateFrom = None
    dateTo = None
    if dateRange:
        dateFrom = dateRange.get('dateFrom')
        dateTo = dateRange.get('dateTo')
    sortBy = urlData.get('sortBy')
    asc = urlData.get('asc')
    if sortBy:
        if not (asc == True):
            asc = 'DESC'
        else:
            asc = 'ASC'
    else:
        asc = None

    ret = {}

    callProcedure('mn_filter_summary', [username, foodTruckName, stationName, dateFrom, dateTo, sortBy, asc])
    ret['table'] = select('mn_filter_summary_result', '1 = 1', '*')['data']
    cleanDecimal(ret['table'], 'totalRevenue', 2)

    callProcedure('mn_get_station', [username])
    ret['stationList'] = select('mn_get_station_result', '1 = 1', '*')['data']

    return SuccessModel(ret).json()


"""
    This API is used for making foodtruck summary detail.
"""
@app.route('/api/manager/summaryDetail', methods=['GET'])
def api_manager_summaryDetail():
    if not hasattr(current_user, 'roles') or 'Manager' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Manager').json()

    urlData = json.loads(request.args.get('data') or '{}')
    foodTruckName = urlData.get('foodTruckName')
    username = current_user.id

    callProcedure('mn_summary_detail', [username, foodTruckName])
    ret = select('mn_summary_detail_result', '1 = 1', '*')['data']
    cleanDecimal(ret, 'totalPurchase', 2)
    formatDate(ret, 'date')

    return SuccessModel(ret).json()
