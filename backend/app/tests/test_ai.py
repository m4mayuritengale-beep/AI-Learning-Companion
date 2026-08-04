def test_explain_concept(client, auth_headers):
    response = client.post(
        "/api/v1/chat/explain-concept",
        json={"concept": "Linear Regression", "depth": "beginner"},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["concept"] == "Linear Regression"
    assert "explanation" in data

def test_send_chat_message(client, auth_headers):
    response = client.post(
        "/api/v1/chat/message",
        json={"message": "What is PyTorch?"},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["sender"] == "ai"
    assert "message" in data
