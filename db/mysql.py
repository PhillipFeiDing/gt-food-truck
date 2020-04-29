import pymysql.cursors


class MySQL:
    
    def __init__(self):
        self.connection = pymysql.connect(host='localhost',
                                user='root',
                                password='997971',
                                db='cs4400spring2020',
                                charset='utf8mb4',
                                cursorclass=pymysql.cursors.DictCursor)
        self._errored = False

    def select(self, sql, args):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(sql, args)
                data = cursor.fetchall()
            return {
                'okay': True,
                'data': data
            }
        except Exception as e:
            self._printError(e)
            self._errored = True
            return {
                'okay': False,
                'error': str(e)
            }

    def modify(self, sql, args):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(sql, args)
            return {
                'okay': True
            }
        except Exception as e:
            self._printError(e)
            self._errored = True
            return {
                'okay': False,
                'error': str(e)
            }

    def tryCommit(self):
        ret = True
        if not self._errored:
            self.connection.commit()
        else:
            self._printError('MySQL failed to commit because of previous error(s).')
            ret = False
            self.connection.rollback()
        self._errored = False
        return ret

    def _printError(self, e):
        print('MySQL Error: {}'.format(str(e)))