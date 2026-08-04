def test_register_user_success(client):
    response = client.post("/api/v1/auth/register", json={
        "email": "new_student@example.com",
        "password": "SecurePassword1",
        "full_name": "New Student"
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "new_student@example.com"

def test_register_weak_password_fails(client):
    response = client.post("/api/v1/auth/register", json={
        "email": "weak_pass@example.com",
        "password": "short",
        "full_name": "Weak Pass"
    })
    assert response.status_code == 400
    assert "Password must be at least 8 characters long" in response.json()["detail"]

def test_login_success(client, test_user):
    response = client.post("/api/v1/auth/login", json={
        "email": "pytest_user@example.com",
        "password": "TestPass123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_get_me_unauthorized(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401

def test_get_me_authorized(client, auth_headers):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "pytest_user@example.com"
