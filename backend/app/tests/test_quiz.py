def test_generate_ai_quiz(client, auth_headers):
    response = client.post(
        "/api/v1/quizzes/generate?topic=Machine%20Learning",
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert "questions" in data
    assert len(data["questions"]) > 0

def test_quiz_submit(client, auth_headers):
    # Generate quiz first
    gen_res = client.post("/api/v1/quizzes/generate?topic=Python", headers=auth_headers)
    quiz = gen_res.json()
    q_id = quiz["questions"][0]["id"]
    opt = quiz["questions"][0]["options"][0]

    # Submit quiz
    sub_res = client.post(
        f"/api/v1/quizzes/{quiz['id']}/submit",
        json={"answers": [{"question_id": q_id, "selected_option": opt}]},
        headers=auth_headers
    )
    assert sub_res.status_code == 200
    res_data = sub_res.json()
    assert "score" in res_data
    assert "passed" in res_data
