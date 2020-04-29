from __main__ import mysqlDB
import functools


def checkExist(table, condition, field):
    res = mysqlDB.select(
        'SELECT COUNT(*) FROM `{}` WHERE {};'.format(table, condition),
        field
    )
    return res['data'][0]['COUNT(*)'] > 0


def callProcedure(procedureName, paramList):
    listTemplate = ', '.join(['%s'] * len(paramList))
    res = mysqlDB.modify(
        'CALL `{}`({});'.format(procedureName, listTemplate),
        tuple(paramList)
    )
    return res['okay']


def select(table, condition, columns):
    res = mysqlDB.select(
        'SELECT {} FROM `{}` WHERE {};'.format(columns, table, condition),
        ()
    )
    return res