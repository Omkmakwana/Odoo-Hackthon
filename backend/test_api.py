"""Comprehensive API smoke test — exercises all major endpoints."""

import httpx
import sys

BASE = "http://localhost:8000/api"
passed = 0
failed = 0


def check(label: str, condition: bool, detail: str = ""):
    global passed, failed
    if condition:
        passed += 1
        print(f"  PASS  {label}")
    else:
        failed += 1
        print(f"  FAIL  {label} {detail}")


def main():
    global passed, failed
    client = httpx.Client(timeout=10)

    # ── 1. Register ──────────────────────────────────────────────────────
    print("\n== Auth ==")
    r = client.post(f"{BASE}/auth/register", json={
        "email": "test@traveloop.com",
        "password": "Test@12345",
        "full_name": "Test User"
    })
    check("Register", r.status_code == 201, f"got {r.status_code}: {r.text}")
    tokens = r.json()
    access = tokens.get("access_token", "")
    refresh = tokens.get("refresh_token", "")
    check("Got access token", bool(access))
    check("Got refresh token", bool(refresh))

    # Duplicate register should fail
    r2 = client.post(f"{BASE}/auth/register", json={
        "email": "test@traveloop.com",
        "password": "Test@12345",
        "full_name": "Dup User"
    })
    check("Duplicate register blocked", r2.status_code == 409, f"got {r2.status_code}")

    # ── 2. Login ─────────────────────────────────────────────────────────
    r = client.post(f"{BASE}/auth/login", json={
        "email": "test@traveloop.com",
        "password": "Test@12345"
    })
    check("Login", r.status_code == 200, f"got {r.status_code}: {r.text}")
    access = r.json().get("access_token", access)

    # Bad password
    r = client.post(f"{BASE}/auth/login", json={
        "email": "test@traveloop.com",
        "password": "WrongPassword"
    })
    check("Bad password rejected", r.status_code == 400)

    # ── 3. Refresh ───────────────────────────────────────────────────────
    r = client.post(f"{BASE}/auth/refresh", json={"refresh_token": refresh})
    check("Token refresh", r.status_code == 200, f"got {r.status_code}")
    access = r.json().get("access_token", access)

    headers = {"Authorization": f"Bearer {access}"}

    # ── 4. Profile ───────────────────────────────────────────────────────
    print("\n== Profile ==")
    r = client.get(f"{BASE}/users/me", headers=headers)
    check("Get profile", r.status_code == 200)
    check("Profile has email", r.json().get("email") == "test@traveloop.com")

    r = client.patch(f"{BASE}/users/me", headers=headers, json={"full_name": "Updated Name"})
    check("Update profile", r.status_code == 200 and r.json()["full_name"] == "Updated Name")

    # ── 5. Create Trip ───────────────────────────────────────────────────
    print("\n== Trips ==")
    r = client.post(f"{BASE}/trips", headers=headers, json={
        "name": "Test Trip to Japan",
        "description": "An amazing adventure",
        "start_date": "2026-12-01",
        "end_date": "2026-12-10",
        "budget_limit": 3000.0
    })
    check("Create trip", r.status_code == 201, f"got {r.status_code}: {r.text}")
    trip = r.json()
    trip_id = trip.get("id")
    check("Trip has slug", bool(trip.get("public_slug")))

    # List trips
    r = client.get(f"{BASE}/trips", headers=headers)
    check("List trips", r.status_code == 200 and len(r.json()) >= 1)

    # Get trip
    r = client.get(f"{BASE}/trips/{trip_id}", headers=headers)
    check("Get trip", r.status_code == 200)

    # Update trip
    r = client.patch(f"{BASE}/trips/{trip_id}", headers=headers, json={"name": "Updated Trip Name"})
    check("Update trip", r.status_code == 200 and r.json()["name"] == "Updated Trip Name")

    # ── 6. Stops ─────────────────────────────────────────────────────────
    print("\n== Stops ==")
    r = client.post(f"{BASE}/trips/{trip_id}/stops", headers=headers, json={
        "city_name": "Tokyo",
        "country": "Japan",
        "arrival_date": "2026-12-01",
        "departure_date": "2026-12-05",
        "order": 0
    })
    check("Add stop", r.status_code == 201, f"got {r.status_code}: {r.text}")
    stop_id = r.json().get("id")

    r = client.post(f"{BASE}/trips/{trip_id}/stops", headers=headers, json={
        "city_name": "Kyoto",
        "country": "Japan",
        "arrival_date": "2026-12-05",
        "departure_date": "2026-12-10",
        "order": 1
    })
    check("Add second stop", r.status_code == 201)
    stop2_id = r.json().get("id")

    # Reorder
    r = client.put(f"{BASE}/trips/{trip_id}/stops/reorder", headers=headers, json={
        "stop_ids": [stop2_id, stop_id]
    })
    check("Reorder stops", r.status_code == 200)

    # ── 7. Activities ────────────────────────────────────────────────────
    print("\n== Activities ==")
    r = client.post(f"{BASE}/stops/{stop_id}/activities", headers=headers, json={
        "name": "Visit Senso-ji Temple",
        "day_number": 1,
        "time_slot": "09:00",
        "duration_minutes": 120,
        "estimated_cost": 0,
        "cost_category": "activity"
    })
    check("Add activity", r.status_code == 201, f"got {r.status_code}: {r.text}")
    act_id = r.json().get("id")

    r = client.post(f"{BASE}/stops/{stop_id}/activities", headers=headers, json={
        "name": "Sushi Dinner",
        "day_number": 1,
        "time_slot": "18:00",
        "duration_minutes": 90,
        "estimated_cost": 80.0,
        "cost_category": "meal"
    })
    check("Add meal activity", r.status_code == 201)

    r = client.patch(f"{BASE}/activities/{act_id}", headers=headers, json={
        "estimated_cost": 10.0
    })
    check("Update activity", r.status_code == 200 and r.json()["estimated_cost"] == 10.0)

    # ── 8. Budget ────────────────────────────────────────────────────────
    print("\n== Budget ==")
    r = client.get(f"{BASE}/trips/{trip_id}/budget", headers=headers)
    check("Get budget", r.status_code == 200, f"got {r.status_code}: {r.text}")
    budget = r.json()
    check("Budget has breakdown", len(budget.get("breakdown", [])) > 0)
    check("Budget total > 0", budget.get("total_estimated", 0) > 0)

    # ── 9. Checklist ─────────────────────────────────────────────────────
    print("\n== Checklist ==")
    r = client.post(f"{BASE}/checklist", headers=headers, json={
        "trip_id": trip_id,
        "label": "Passport",
        "category": "documents"
    })
    check("Add checklist item", r.status_code == 201, f"got {r.status_code}: {r.text}")
    cl_id = r.json().get("id")

    r = client.patch(f"{BASE}/checklist/{cl_id}", headers=headers, json={"is_packed": True})
    check("Mark packed", r.status_code == 200 and r.json()["is_packed"] == True)

    r = client.get(f"{BASE}/trips/{trip_id}/checklist", headers=headers)
    check("Get checklist", r.status_code == 200)
    check("Checklist has progress", r.json().get("percentage", 0) > 0)

    r = client.post(f"{BASE}/trips/{trip_id}/checklist/reset", headers=headers)
    check("Reset checklist", r.status_code == 204)

    # ── 10. Notes ────────────────────────────────────────────────────────
    print("\n== Notes ==")
    r = client.post(f"{BASE}/notes", headers=headers, json={
        "trip_id": trip_id,
        "title": "Hotel Info",
        "body": "Check-in at 3pm"
    })
    check("Create note", r.status_code == 201, f"got {r.status_code}: {r.text}")
    note_id = r.json().get("id")

    r = client.get(f"{BASE}/notes", headers=headers)
    check("List notes", r.status_code == 200 and len(r.json()) >= 1)

    r = client.get(f"{BASE}/notes?trip_id={trip_id}", headers=headers)
    check("Filter notes by trip", r.status_code == 200)

    r = client.patch(f"{BASE}/notes/{note_id}", headers=headers, json={"body": "Updated body"})
    check("Update note", r.status_code == 200)

    # ── 11. Shared trip ──────────────────────────────────────────────────
    print("\n== Community ==")
    # Make trip public
    r = client.patch(f"{BASE}/trips/{trip_id}", headers=headers, json={"is_public": True})
    check("Make trip public", r.status_code == 200)
    slug = r.json().get("public_slug")

    r = client.get(f"{BASE}/shared/{slug}")
    check("View shared trip (no auth)", r.status_code == 200)

    r = client.get(f"{BASE}/community/trips", headers=headers)
    check("Community feed", r.status_code == 200 and len(r.json()) >= 1)

    # ── 12. Unauthenticated access blocked ───────────────────────────────
    print("\n== Security ==")
    r = client.get(f"{BASE}/trips")
    check("No-auth trips blocked", r.status_code == 401)

    r = client.get(f"{BASE}/admin/dashboard", headers=headers)
    check("Non-admin blocked from admin", r.status_code == 403)

    # ── Summary ──────────────────────────────────────────────────────────
    print(f"\n{'='*50}")
    print(f"Results: {passed} passed, {failed} failed out of {passed + failed}")
    if failed > 0:
        sys.exit(1)
    else:
        print("All tests passed!")


if __name__ == "__main__":
    main()
