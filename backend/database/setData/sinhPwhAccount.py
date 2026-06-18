import bcrypt

password = "admin1111".encode('utf-8')
hashed = bcrypt.hashpw(password, bcrypt.gensalt())
print(hashed.decode())
