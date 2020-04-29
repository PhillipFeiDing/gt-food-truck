def cleanDecimal(data, field, precision):
    for obj in data:
        if obj[field] is not None:
            obj[field] = str(round(obj[field], precision))


def formatDate(data, field):
    for obj in data:
        if obj[field] is not None:
            obj[field] = str(obj[field])


def formatOrderID(data, field):
    for obj in data:
        if obj[field] is not None:
            obj[field] = str(obj[field]).zfill(10)