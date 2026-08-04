import io

def test_upload_non_pdf_fails(client, auth_headers):
    file_data = (io.BytesIO(b"Plain text content"), "notes.txt")
    response = client.post(
        "/api/v1/upload/pdf",
        files={"file": file_data},
        headers=auth_headers
    )
    assert response.status_code == 400
    assert "Only PDF documents (.pdf) are permitted" in response.json()["detail"]

def test_upload_invalid_pdf_header_fails(client, auth_headers):
    file_data = (io.BytesIO(b"Invalid PDF signature header"), "fake.pdf")
    response = client.post(
        "/api/v1/upload/pdf",
        files={"file": file_data},
        headers=auth_headers
    )
    assert response.status_code == 400
    assert "magic signature" in response.json()["detail"]

def test_upload_valid_pdf_success(client, auth_headers):
    valid_pdf_header = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF"
    file_data = (io.BytesIO(valid_pdf_header), "valid_notes.pdf")
    response = client.post(
        "/api/v1/upload/pdf",
        files={"file": file_data},
        headers=auth_headers
    )
    assert response.status_code == 201
    assert response.json()["filename"] == "valid_notes.pdf"
