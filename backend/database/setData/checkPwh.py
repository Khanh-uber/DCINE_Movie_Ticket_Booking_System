import bcrypt

hash_value = b"$2b$12$vYuubI6fSvgE1FnKlShc3OCF/lBOvMNetghL1Nc/1SoQl1k07kSOu"

pw = input("Nhập mật khẩu cần kiểm tra: ").encode('utf-8')

if bcrypt.checkpw(pw, hash_value):
    print("Đúng mật khẩu")
else:
    print("Sai mật khẩu")

# Minhkhanh02...