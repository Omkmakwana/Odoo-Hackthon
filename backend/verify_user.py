"""
Traveloop API verification script.
Usage: TEST_EMAIL=... TEST_PASSWORD=... python verify_user.py
"""
import os
import sys
import httpx
import json

BASE = os.environ.get('API_BASE', 'http://localhost:8000/api')
EMAIL = os.environ.get('TEST_EMAIL', '')
PASSWORD = os.environ.get('TEST_PASSWORD', '')

if not EMAIL or not PASSWORD:
    print('ERROR: Set TEST_EMAIL and TEST_PASSWORD environment variables.')
    print('  Example: $env:TEST_EMAIL="user@example.com"; $env:TEST_PASSWORD="pass"; python verify_user.py')
    sys.exit(1)

results = []

def test(label, r):
    ok = r.status_code < 300
    results.append((ok, label, r.status_code))
    status = 'PASS' if ok else 'FAIL'
    print(f'  [{status}] {label} -> {r.status_code}')
    return r.json()

# Auth
print('--- Auth ---')
body = test('LOGIN', httpx.post(f'{BASE}/auth/login', json={'email': EMAIL, 'password': PASSWORD}))
token = body['access_token']
H = {'Authorization': f'Bearer {token}'}

# User
print('\n--- User ---')
body = test('GET /users/me', httpx.get(f'{BASE}/users/me', headers=H))
print(f'       -> {body["full_name"]} | {body["email"]}')

# Trips
print('\n--- Trips ---')
body = test('LIST TRIPS', httpx.get(f'{BASE}/trips', headers=H))
print(f'       -> {len(body)} trip(s)')
trip_id = body[0]['id'] if body else None

if trip_id:
    body = test('GET TRIP', httpx.get(f'{BASE}/trips/{trip_id}', headers=H))
    print(f'       -> Trip: {body["name"]}')

    body = test('GET BUDGET', httpx.get(f'{BASE}/trips/{trip_id}/budget', headers=H))
    print(f'       -> Total cost: ${body.get("total_cost", 0)}')

    # Notes
    print('\n--- Notes ---')
    body = test('POST /notes', httpx.post(f'{BASE}/notes', headers=H, json={
        'trip_id': trip_id,
        'title': 'Day 2 Plan',
        'body': 'Visit Shinjuku Gyoen on day 2'
    }))
    if 'id' in body:
        print(f'       -> Note id: {body["id"]}')

# Catalog
print('\n--- Catalog ---')
body = test('GET /cities', httpx.get(f'{BASE}/cities', headers=H))
print(f'       -> {len(body)} cities in catalog')

# Community
print('\n--- Community ---')
body = test('GET /community/trips', httpx.get(f'{BASE}/community/trips', headers=H))
print(f'       -> {len(body)} public trips')

# Summary
print()
passed = sum(1 for ok, *_ in results if ok)
total = len(results)
print(f'RESULT: {passed}/{total} tests passed')
