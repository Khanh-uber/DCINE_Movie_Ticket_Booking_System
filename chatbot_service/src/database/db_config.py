import mysql.connector
def get_connection():
    config = {
        "user" : "root",
        "password" : "Thuc123456",
        "host" : "localhost",
        "database" : "dcine_schema"
    }
    return mysql.connector.connect(**config)
