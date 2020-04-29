from __main__ import app, mysqlDB
from flask import request, make_response
from model.dataModel import SuccessModel, ErrorModel
from login.user import User
from flask_login import login_required, current_user
from util.db import checkExist, callProcedure, select
from util.data_cleaning import cleanDecimal
import json


"""
    This API is used for manage building and station.
"""
@app.route('/api/admin/manageBuildingAndStation', methods=['GET'])
def api_admin_manageBuildingAndStation():
    if not hasattr(current_user, 'roles') or 'Admin' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Admin').json()

    data = json.loads(request.args.get('data') or '{}')
    buildingName = data.get('buildingName')
    buildingTag = data.get('buildingTag')
    stationName = data.get('stationName')
    capacity = data.get('capacity')
    low = None
    high = None
    if capacity:
        low = capacity.get('low')
        high = capacity.get('high')
    
    callProcedure('ad_filter_building_station', [buildingName, buildingTag, stationName, low, high])
    ret = {}
    ret['table'] = select('ad_filter_building_station_result', '1 = 1', '*')['data']
    ret['buildingList'] = select('Building', '1 = 1', 'buildingName')['data']
    ret['stationList'] = select('Station', '1 = 1', 'stationName')['data']
    cleanDecimal(ret['table'], 'capacity', 0)
    return SuccessModel(ret).json()


"""
    This API is used for creating a building. Some possible error numbers and their corresponding translations are shown below.

    errno       meaning
    --------------------------------------------------------
    0           db error
    1           bad request
    2           building name exists
"""
@app.route('/api/admin/createBuilding', methods=['POST'])
def api_admin_createBuilding():
    if not hasattr(current_user, 'roles') or 'Admin' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Admin').json()

    data = request.get_json()
    name = data.get('name')
    description = data.get('description')
    tags = data.get('tags')

    if name and description is not None and tags and len(tags) > 0:
        if not checkExist('Building', '`buildingName` = %s', (name)):
            callProcedure('ad_create_building', [name, description])
            for tag in tags:
                if not checkExist('BuildingTag', '`buildingName` = %s AND `tag` = %s', (name, tag)):
                    callProcedure('ad_add_building_tag', [name, tag])
            if not mysqlDB.tryCommit():
                return ErrorModel({'errno': 0}).json()
            return SuccessModel({}).json()
        else:
            return ErrorModel({'errno': 2}).json()
    
    return ErrorModel({'errno': 1}).json()


"""
    This API is used for getting a building. Some possible error numbers and their corresponding translations are shown below.

    errno       meaning
    --------------------------------------------------------
    0           bad request
"""
@app.route('/api/admin/getBuilding', methods=['GET'])
def api_admin_getBuilding():
    if not hasattr(current_user, 'roles') or 'Admin' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Admin').json()
    
    data = json.loads(request.args.get('data') or '{}')
    buildingName = data.get('buildingName')
    
    if buildingName:
        res = {}
        callProcedure('ad_view_building_general', [buildingName])
        res['general'] = select('ad_view_building_general_result', '1 = 1', '*')['data'][0]
        callProcedure('ad_view_building_tags', [buildingName])
        res['tags'] = select('ad_view_building_tags_result', '1 = 1', '*')['data']

        return SuccessModel(res).json()
    
    return ErrorModel({'errno': 0}).json()


"""
    This API is used for updating a building. Some possible error numbers and their corresponding translations are shown below.

    errno       meaning
    --------------------------------------------------------
    0           db error
    1           bad request
    2           old building name not exists
    3           new building name exists
"""
@app.route('/api/admin/updateBuilding', methods=['POST'])
def api_admin_updateBuilding():
    if not hasattr(current_user, 'roles') or 'Admin' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Admin').json()
    
    data = request.get_json()
    oldName = data.get('oldName')
    newName = data.get('newName')
    description = data.get('description')
    tags = data.get('tags')

    if oldName and newName and description is not None and tags and len(tags) > 0:
        if checkExist('Building', '`buildingName` = %s', (oldName)):
            if oldName.lower() == newName.lower() or not checkExist('Building', '`buildingName` = %s', (newName)):
                callProcedure('ad_update_building', [oldName, newName, description])
                # The provided stored proecedure API is different. Let's do a vinilla style!
                mysqlDB.modify(
                    'DELETE FROM `BuildingTag` WHERE `buildingName` = %s;',
                    newName
                )
                for tag in tags:
                    if not checkExist('BuildingTag', '`buildingName` = %s AND `tag` = %s', (newName, tag)):
                        callProcedure('ad_add_building_tag', [newName, tag])
                if not mysqlDB.tryCommit():
                    return ErrorModel({'errno': 0}).json()
                return SuccessModel({}).json()
            else:
                return ErrorModel({'errno': 3}).json()
        else:
            return ErrorModel({'errno': 2}).json()
    
    return ErrorModel({'errno': 1}).json()


"""
    This API is used for deleting a building. Some possible error numbers and their corresponding translations are shown below.

    errno       meaning
    --------------------------------------------------------
    0           db error, often caused by delete restriction
    1           bad request
"""
@app.route('/api/admin/deleteBuilding', methods=['POST'])
def api_admin_deleteBuilding():
    if not hasattr(current_user, 'roles') or 'Admin' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Admin').json()
    
    data = request.get_json()
    buildingName = data.get('building')

    if buildingName:
        callProcedure('ad_delete_building', [buildingName])
        if not mysqlDB.tryCommit():
            return ErrorModel({'errno': 0}).json()
    else:
        return ErrorModel({'errno': 1}).json()
    
    return SuccessModel({}).json()


"""
    This API is used for getting available buildings.
"""
@app.route('/api/admin/getAvailableBuilding', methods=['GET'])
def api_admin_getAvailableBuilding():
    if not hasattr(current_user, 'roles') or 'Admin' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Admin').json()
    
    callProcedure('ad_get_available_building', [])
    return SuccessModel(select('ad_get_available_building_result', '1 = 1', '*')['data']).json()


"""
    This API is used for creating a station. Some possible error numbers and their corresponding translations are shown below.

    errno       meaning
    --------------------------------------------------------
    0           station name already exists
    1           bad request
    2           other error
"""
@app.route('/api/admin/createStation', methods=['POST'])
def api_admin_createStation():
    if not hasattr(current_user, 'roles') or 'Admin' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Admin').json()
    
    data = request.get_json()
    stationName = data.get('name')
    capacity = data.get('capacity')
    sponsoredBuilding = data.get('sponsoredBuilding')

    if type(stationName) is str and type(capacity) is int and capacity > 0 and type(sponsoredBuilding) is str:
        if checkExist('Station', '`stationName` = %s', (stationName)):
            return ErrorModel({'errno': 0}).json()
        callProcedure('ad_create_station', [stationName, sponsoredBuilding, capacity])
        if not mysqlDB.tryCommit():
            return ErrorModel({'errno': 2}).json()
        return SuccessModel({}).json()
    else:
        return ErrorModel({'errno': 1}).json()


"""
    This API is used for getting a station's information. Some possible error numbers and their corresponding translations are shown below.

    errno       meaning
    --------------------------------------------------------
    0           bad request
    1           station does not exist
"""
@app.route('/api/admin/getStation', methods=['GET'])
def api_admin_getStation():
    if not hasattr(current_user, 'roles') or 'Admin' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Admin').json()
    
    data = json.loads(request.args.get('data') or '{}')
    buildingName = data.get('buildingName')

    res = mysqlDB.select(
        'SELECT `stationName` FROM `Station` WHERE `buildingName` = %s;',
        (buildingName)
    )['data']
    if len(res) == 0:
        return ErrorModel({'errno': 1}).json()
    stationName = res[0]['stationName']

    callProcedure('ad_view_station', [stationName])
    res = select('ad_view_station_result', '1 = 1', '*')
    return SuccessModel(select('ad_view_station_result', '1 = 1', '*')['data'][0]).json()


"""
    This API is used for updating a station. Some possible error numbers and their corresponding translations are shown below.

    errno       meaning
    --------------------------------------------------------
    0           station name does not exists
    1           bad request
    2           other error
    3           capacity error
"""
@app.route('/api/admin/updateStation', methods=['POST'])
def api_admin_updateStation():
    if not hasattr(current_user, 'roles') or 'Admin' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Admin').json()
    
    data = request.get_json()
    stationName = data.get('name')
    capacity = data.get('capacity')
    sponsoredBuilding = data.get('sponsoredBuilding')

    if type(stationName) is str and type(capacity) is int and capacity > 0 and type(sponsoredBuilding) is str:
        if not checkExist('Station', '`stationName` = %s', (stationName)):
            return ErrorModel({'errno': 0}).json()
        numFoodTrucks = mysqlDB.select(
            'SELECT COUNT(*) AS numFoodTrucks FROM FoodTruck WHERE stationName = %s',
            (stationName)
        )['data'][0]['numFoodTrucks']
        if numFoodTrucks > capacity:
            return ErrorModel({'errno': 3}).json()
        callProcedure('ad_update_station', [stationName, capacity, sponsoredBuilding])
        if not mysqlDB.tryCommit():
            return ErrorModel({'errno': 2}).json()
        return SuccessModel({}).json()
    else:
        return ErrorModel({'errno': 1}).json()


"""
    This API is used for deleting a station. Some possible error numbers and their corresponding translations are shown below.

    errno       meaning
    --------------------------------------------------------
    0           db error, often caused by delete restriction
    1           bad request
    2           station does not exist
"""
@app.route('/api/admin/deleteStation', methods=['POST'])
def api_admin_deleteStation():
    if not hasattr(current_user, 'roles') or 'Admin' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Admin').json()
    
    data = request.get_json()
    buildingName = data.get('building')

    res = mysqlDB.select(
        'SELECT `stationName` FROM `Station` WHERE `buildingName` = %s;',
        (buildingName)
    )['data']
    if len(res) == 0:
        return ErrorModel({'errno': 2}).json()
    stationName = res[0]['stationName']

    if stationName:
        callProcedure('ad_delete_station', [stationName])
        if not mysqlDB.tryCommit():
            return ErrorModel({'errno': 0}).json()
    else:
        return ErrorModel({'errno': 1}).json()
    
    return SuccessModel({}).json()


"""
    This API is used for manage food. Some possible error numbers and their corresponding translations are shown below.

    errno       meaning
    --------------------------------------------------------
    0           fail to retrieve food table
    1           fail to retrieve food list
"""
@app.route('/api/admin/manageFood', methods=['GET'])
def api_admin_manageFood():
    if not hasattr(current_user, 'roles') or 'Admin' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Admin').json()
    
    data = json.loads(request.args.get('data') or '{}')
    foodName = data.get('name')
    sortBy = data.get('sortBy')
    isAsc = data.get('asc')
    if sortBy is not None:
        if isAsc:
            isAsc = 'ASC'
        else:
            isAsc = 'DESC'
    
    ret = {}

    callProcedure('ad_filter_food', [foodName, sortBy, isAsc])
    result = select('ad_filter_food_result', '1 = 1', '*')
    if not result['okay']:
        return ErrorModel({'errno': 0}).json()
    ret['table'] = result['data']
    
    result = mysqlDB.select(
        'SELECT * FROM Food;',
        ()
    )
    if not result['okay']:
        return ErrorModel({'errno': 1}).json()
    ret['foodList'] = result['data']

    return SuccessModel(ret).json()


"""
    This API is used for creating food. Some possible error numbers and their corresponding translations are shown below.

    errno       meaning
    --------------------------------------------------------
    0           food already exists
    1           bad request
    2           other db error
"""
@app.route('/api/admin/createFood', methods=['POST'])
def api_admin_createFood():
    if not hasattr(current_user, 'roles') or 'Admin' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Admin').json()
    
    data = request.get_json()
    name = data.get('name')

    if not name or type(name) is not str:
        return ErrorModel({'errno': 1}).json()
    
    if checkExist('Food', '`foodName` = %s', (name)):
        return ErrorModel({'errno': 0}).json()
    
    callProcedure('ad_create_food', [name])
    if not mysqlDB.tryCommit():
        return ErrorModel({'errno': 2}).json()

    return SuccessModel({}).json()


"""
    This API is used for deleting food. Some possible error numbers and their corresponding translations are shown below.

    errno       meaning
    --------------------------------------------------------
    0           food does not exists
    1           bad request
    2           database error
"""
@app.route('/api/admin/deleteFood', methods=['POST'])
def api_admin_deleteFood():
    if not hasattr(current_user, 'roles') or 'Admin' not in current_user.roles:
        return ErrorModel('No Privilege: Must be Admin').json()
    
    data = request.get_json()
    name = data.get('name')

    if not name or type(name) is not str:
        return ErrorModel({'errno': 1}).json()
    
    if not checkExist('Food', '`foodName` = %s', (name)):
        return ErrorModel({'errno': 0}).json()
    
    callProcedure('ad_delete_food', [name])
    if not mysqlDB.tryCommit():
        return ErrorModel({'errno': 2}).json()
    
    return SuccessModel({}).json()
