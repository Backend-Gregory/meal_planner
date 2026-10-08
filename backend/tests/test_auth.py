from app.auth import hash_password, verify_password, create_access_token, decode_token, create_refresh_token

def test_hash_password_not_equal_original():
    password = "abc12345"
    hashed = hash_password(password)
    assert hashed != password

def test_verify_correct_password():
    password = "abc12345"
    hashed = hash_password(password)
    is_password = verify_password(password, hashed)
    assert is_password

def test_verify_wrong_password():
    password = "abc12345"
    hashed = hash_password(password)
    false_password = "mysecretpass"
    is_password = verify_password(false_password, hashed)
    assert not is_password

def test_create_access_token_returns_string():
    token = create_access_token(1)
    assert token
    assert isinstance(token, str)

def test_create_refresh_token_returns_string():
    token = create_refresh_token(1)
    assert token
    assert isinstance(token, str)

def test_decode_access_token():
    assert decode_token(create_access_token(5)) == 5

def test_decode_refresh_token():
    assert decode_token(create_refresh_token(1)) == 1

def test_decode_invalid_token():
    assert decode_token("мусор") is None