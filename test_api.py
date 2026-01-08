import pytest
import requests
import random
import string

BASE_URL = "https://ab2da128d1ae.ngrok-free.app/api/v1"

def get_base_payload(email, password):
    return {
      "accountType": "individual",
      "shortName": "string",
      "contactEmail": email,
      "registeredName": "string",
      "adminFullName": "string",
      "password": password,
      "sendEmail": True,
      "permanentAddress": {
        "addressLine1": "string",
        "city": "string",
        "state": "string",
        "postCode": "string",
        "country": "United States"
      }
    }

def test_create_org_valid():
    print(f"Checking if org exists at {BASE_URL}/org/exists")
    exists_response = requests.get(f"{BASE_URL}/org/exists")
    assert exists_response.status_code == 200
    exists = exists_response.json().get("exists", False)
    
    if exists:
        print("Organization already exists. Skipping creation.")
        return

    email = "user@example.com"
    password = "Password1234!"
    
    data = get_base_payload(email, password)
    
    print(f"Testing Create Org with {email} and valid password")
    response = requests.post(f"{BASE_URL}/org", json=data)
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    assert response.status_code == 200

def test_password_min_length():
    email = "mytest_short@example.com"
    password = "Pass1!" 
    
    data = get_base_payload(email, password)
    
    print(f"Testing Password Min Length with {password}")
    response = requests.post(f"{BASE_URL}/org", json=data)
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    assert response.status_code == 400
def test_password_complexity():
    email = "mytest_simple@example.com"
    password = "password123"
    
    data = get_base_payload(email, password)
    
    print(f"Testing Password Complexity with {password}")
    response = requests.post(f"{BASE_URL}/org", json=data)
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    assert response.status_code == 500

def test_init_auth():
    email = "user@example.com"
    data = {"email": email}
    
    print(f"Testing Init Auth with {email}")
    response = requests.post(f"{BASE_URL}/userAccount/initAuth", json=data)
    
    print(f"Status: {response.status_code}")
    print(f"Response Headers: {response.headers}")
    print(f"Response Body: {response.text}")
    
    assert response.status_code == 200
    assert "x-session-token" in response.headers
    print(f"x-session-token: {response.headers['x-session-token']}")

def test_authenticate():
    email = "user@example.com"
    init_data = {"email": email}
    
    print(f"Initializing Auth with {email}")
    init_response = requests.post(f"{BASE_URL}/userAccount/initAuth", json=init_data)
    assert init_response.status_code == 200
    session_token = init_response.headers.get("x-session-token")
    assert session_token is not None
    print(f"Got session token: {session_token}")
    
    auth_data = {
      "method": "password",
      "credentials": {
        "password": "Password1234!",
        "otp": 0,
        "credential": "string",
        "accessToken": "string",
        "idToken": "string"
      }
    }
    
    headers = {
        "x-session-token": session_token
    }
    
    print("Authenticating...")
    auth_response = requests.post(f"{BASE_URL}/userAccount/authenticate", json=auth_data, headers=headers)
    
    print(f"Status: {auth_response.status_code}")
    print(f"Response: {auth_response.text}")
    
    assert auth_response.status_code == 200
    
    response_json = auth_response.json()
    assert "accessToken" in response_json
    assert "refreshToken" in response_json
    print("Authentication successful, tokens received.")

def test_get_org_details():
    email = "user@example.com"
    init_data = {"email": email}

    init_response = requests.post(f"{BASE_URL}/userAccount/initAuth", json=init_data)
    assert init_response.status_code == 200
    session_token = init_response.headers.get("x-session-token")

    auth_data = {
      "method": "password",
      "credentials": {
        "password": "Password1234!",
        "otp": 0,
        "credential": "string",
        "accessToken": "string",
        "idToken": "string"
      }
    }
    headers = {"x-session-token": session_token}
    auth_response = requests.post(f"{BASE_URL}/userAccount/authenticate", json=auth_data, headers=headers)
    assert auth_response.status_code == 200
    access_token = auth_response.json().get("accessToken")
    assert access_token is not None
    
    print(f"Fetching Org Details with Access Token...")
    org_headers = {
        "Authorization": f"Bearer {access_token}",
        "accept": "application/json"
    }
    
    org_response = requests.get(f"{BASE_URL}/org", headers=org_headers)
    
    print(f"Status: {org_response.status_code}")
    print(f"Response: {org_response.text}")
    
    assert org_response.status_code == 200
    org_data = org_response.json()
    assert org_data["contactEmail"] == email
    print("Org details fetched successfully.")

def test_update_org():
    email = "user@example.com"
    init_data = {"email": email}

    init_response = requests.post(f"{BASE_URL}/userAccount/initAuth", json=init_data)
    assert init_response.status_code == 200
    session_token = init_response.headers.get("x-session-token")

    auth_data = {
      "method": "password",
      "credentials": {
        "password": "Password1234!",
        "otp": 0,
        "credential": "string",
        "accessToken": "string",
        "idToken": "string"
      }
    }
    headers = {"x-session-token": session_token}
    auth_response = requests.post(f"{BASE_URL}/userAccount/authenticate", json=auth_data, headers=headers)
    assert auth_response.status_code == 200
    access_token = auth_response.json().get("accessToken")
    assert access_token is not None
    
    print(f"Updating Org Details...")
    update_payload = {
      "registeredName": "string",
      "shortName": "string",
      "phoneNumber": "string",
      "permanentAddress": {
        "addressLine1": "string",
        "city": "string",
        "state": "string",
        "postCode": "string",
        "country": "United States"
      }
    }
    
    org_headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "accept": "application/json"
    }
    
    update_response = requests.put(f"{BASE_URL}/org", json=update_payload, headers=org_headers)
    
    print(f"Status: {update_response.status_code}")
    print(f"Response: {update_response.text}")
    
    assert update_response.status_code == 200
    print("Org updated successfully.")

