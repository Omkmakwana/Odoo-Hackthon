"""Seed the database with demo data for development and demos."""

import asyncio
import sys
from datetime import date
from pathlib import Path

# Ensure project root is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.core.database import async_session_factory, init_db
from app.core.security import hash_password
from app.apps.users.models import User
from app.apps.trips.models import Trip, Stop, TripActivity
from app.apps.catalog.models import City, Activity
from app.apps.checklist.models import ChecklistItem
from app.apps.notes.models import Note


async def seed():
    print("🌱 Initialising database tables …")
    await init_db()

    async with async_session_factory() as db:
        # ── Users ────────────────────────────────────────────────────────
        admin = User(
            email="admin@traveloop.com",
            hashed_password=hash_password("Admin@123"),
            full_name="Admin User",
            is_admin=True,
        )
        demo = User(
            email="demo@traveloop.com",
            hashed_password=hash_password("Demo@123"),
            full_name="Jane Doe",
        )
        db.add_all([admin, demo])
        await db.flush()
        print(f"  ✅ Users created: admin (id={admin.id}), demo (id={demo.id})")

        # ── Cities ───────────────────────────────────────────────────────
        cities_data = [
            {"name": "Kyoto", "country": "Japan", "region": "Asia", "cost_index": 3, "popularity": 92,
             "image_url": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800",
             "description": "Ancient capital of Japan, famous for its temples, shrines, and traditional tea houses."},
            {"name": "Paris", "country": "France", "region": "Europe", "cost_index": 4, "popularity": 98,
             "image_url": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800",
             "description": "The City of Light, renowned for its art, gastronomy, and iconic landmarks."},
            {"name": "Tokyo", "country": "Japan", "region": "Asia", "cost_index": 4, "popularity": 95,
             "image_url": "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=800",
             "description": "A dazzling mix of ultra-modern and traditional, from neon-lit skyscrapers to historic temples."},
            {"name": "Rome", "country": "Italy", "region": "Europe", "cost_index": 3, "popularity": 90,
             "image_url": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800",
             "description": "The Eternal City, home to the Colosseum, Vatican, and centuries of history."},
            {"name": "Cairo", "country": "Egypt", "region": "Africa", "cost_index": 1, "popularity": 78,
             "image_url": "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=800",
             "description": "Gateway to ancient wonders, including the Great Pyramids and the Sphinx."},
            {"name": "New York", "country": "USA", "region": "North America", "cost_index": 5, "popularity": 97,
             "image_url": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800",
             "description": "The city that never sleeps, with world-class museums, dining, and nightlife."},
            {"name": "Venice", "country": "Italy", "region": "Europe", "cost_index": 4, "popularity": 88,
             "image_url": "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=800",
             "description": "Floating city of canals, gondolas, and Renaissance architecture."},
            {"name": "Reykjavík", "country": "Iceland", "region": "Europe", "cost_index": 5, "popularity": 72,
             "image_url": "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=800",
             "description": "Gateway to Iceland's dramatic landscapes — geysers, waterfalls, and the Northern Lights."},
            {"name": "Barcelona", "country": "Spain", "region": "Europe", "cost_index": 3, "popularity": 91,
             "image_url": "https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=800",
             "description": "Gaudí masterpieces, vibrant nightlife, and Mediterranean beaches."},
            {"name": "Bali", "country": "Indonesia", "region": "Asia", "cost_index": 2, "popularity": 89,
             "image_url": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800",
             "description": "Tropical paradise with lush rice terraces, ancient temples, and world-class surfing."},
        ]
        cities = []
        for cd in cities_data:
            city = City(**cd)
            db.add(city)
            cities.append(city)
        await db.flush()
        print(f"  ✅ {len(cities)} cities seeded")

        # ── Activities ───────────────────────────────────────────────────
        activities_data = [
            {"name": "Visit Fushimi Inari Shrine", "city_id": cities[0].id, "category": "sightseeing", "estimated_cost": 0, "duration_minutes": 120,
             "image_url": "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?q=80&w=800",
             "description": "Walk through thousands of vermillion torii gates on the mountain trail."},
            {"name": "Tea Ceremony Experience", "city_id": cities[0].id, "category": "culture", "estimated_cost": 45, "duration_minutes": 90,
             "image_url": "https://images.unsplash.com/photo-1545048702-79362596cdc9?q=80&w=800",
             "description": "Traditional matcha preparation in a historic tea house."},
            {"name": "Eiffel Tower Visit", "city_id": cities[1].id, "category": "sightseeing", "estimated_cost": 26, "duration_minutes": 120,
             "image_url": "https://images.unsplash.com/photo-1511739001486-6bfe10ce65f4?q=80&w=800",
             "description": "Ascend the iconic iron lattice tower for panoramic views of Paris."},
            {"name": "Louvre Museum", "city_id": cities[1].id, "category": "culture", "estimated_cost": 17, "duration_minutes": 240,
             "image_url": "https://images.unsplash.com/photo-1499426600726-7f5b8b39ed32?q=80&w=800",
             "description": "Home to the Mona Lisa and 35,000 other works of art."},
            {"name": "Tsukiji Outer Market Food Tour", "city_id": cities[2].id, "category": "food", "estimated_cost": 80, "duration_minutes": 180,
             "image_url": "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=800",
             "description": "Sample fresh sushi, tamagoyaki, and street food at Tokyo's legendary fish market."},
            {"name": "Colosseum Guided Tour", "city_id": cities[3].id, "category": "sightseeing", "estimated_cost": 35, "duration_minutes": 150,
             "image_url": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800",
             "description": "Explore the ancient amphitheater that once hosted gladiatorial games."},
            {"name": "Pyramids of Giza Tour", "city_id": cities[4].id, "category": "sightseeing", "estimated_cost": 20, "duration_minutes": 240,
             "image_url": "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?q=80&w=800",
             "description": "Stand before the last surviving Ancient Wonder of the World."},
            {"name": "Broadway Show", "city_id": cities[5].id, "category": "culture", "estimated_cost": 150, "duration_minutes": 180,
             "image_url": "https://images.unsplash.com/photo-1520019032281-1e2eda01e08c?q=80&w=800",
             "description": "Catch a world-class performance in the Theater District."},
            {"name": "Gondola Ride", "city_id": cities[6].id, "category": "sightseeing", "estimated_cost": 80, "duration_minutes": 30,
             "image_url": "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?q=80&w=800",
             "description": "Glide through Venice's canals in a traditional gondola."},
            {"name": "Northern Lights Tour", "city_id": cities[7].id, "category": "adventure", "estimated_cost": 120, "duration_minutes": 300,
             "image_url": "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=800",
             "description": "Chase the aurora borealis across Iceland's dark skies."},
            {"name": "Sagrada Família Visit", "city_id": cities[8].id, "category": "sightseeing", "estimated_cost": 26, "duration_minutes": 120,
             "image_url": "https://images.unsplash.com/photo-1583779457094-ab6f2bc5849b?q=80&w=800",
             "description": "Marvel at Gaudí's unfinished basilica, a UNESCO World Heritage Site."},
            {"name": "Ubud Rice Terrace Walk", "city_id": cities[9].id, "category": "adventure", "estimated_cost": 5, "duration_minutes": 120,
             "image_url": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800",
             "description": "Stroll through the emerald-green Tegallalang rice paddies."},
        ]
        for ad in activities_data:
            db.add(Activity(**ad))
        await db.flush()
        print(f"  ✅ {len(activities_data)} activities seeded")

        # ── Demo Trip: Kyoto Chronicles ──────────────────────────────────
        trip1 = Trip(
            owner_id=demo.id,
            name="The Kyoto Chronicles",
            description="A seven day exploration through the ancient capital.",
            cover_url="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800",
            start_date=date(2026, 10, 12),
            end_date=date(2026, 10, 19),
            status="upcoming",
            is_public=True,
            budget_limit=2400.0,
        )
        db.add(trip1)
        await db.flush()

        stop1 = Stop(trip_id=trip1.id, city_id=cities[0].id, city_name="Kyoto", country="Japan",
                      arrival_date=date(2026, 10, 12), departure_date=date(2026, 10, 15), order=0)
        stop2 = Stop(trip_id=trip1.id, city_id=cities[2].id, city_name="Tokyo", country="Japan",
                      arrival_date=date(2026, 10, 15), departure_date=date(2026, 10, 19), order=1)
        db.add_all([stop1, stop2])
        await db.flush()

        activities_trip1 = [
            TripActivity(stop_id=stop1.id, name="Arrival & Check-in", day_number=1, time_slot="14:00",
                         duration_minutes=120, estimated_cost=0, cost_category="transport"),
            TripActivity(stop_id=stop1.id, name="Fushimi Inari Shrine", day_number=1, time_slot="16:30",
                         duration_minutes=120, estimated_cost=0, cost_category="activity",
                         activity_id=activities_data[0].get("id")),
            TripActivity(stop_id=stop1.id, name="The Golden Pavilion", day_number=2, time_slot="09:00",
                         duration_minutes=90, estimated_cost=10, cost_category="activity"),
            TripActivity(stop_id=stop1.id, name="Tea Ceremony", day_number=2, time_slot="14:00",
                         duration_minutes=90, estimated_cost=45, cost_category="activity"),
            TripActivity(stop_id=stop1.id, name="Bamboo Grove Walk", day_number=3, time_slot="08:00",
                         duration_minutes=120, estimated_cost=0, cost_category="activity"),
            TripActivity(stop_id=stop1.id, name="Train to Tokyo", day_number=3, time_slot="15:00",
                         duration_minutes=140, estimated_cost=130, cost_category="transport"),
            TripActivity(stop_id=stop2.id, name="Tsukiji Market Tour", day_number=4, time_slot="07:00",
                         duration_minutes=180, estimated_cost=80, cost_category="meal"),
            TripActivity(stop_id=stop2.id, name="Shibuya & Harajuku", day_number=4, time_slot="13:00",
                         duration_minutes=240, estimated_cost=50, cost_category="activity"),
            TripActivity(stop_id=stop2.id, name="teamLab Borderless", day_number=5, time_slot="10:00",
                         duration_minutes=180, estimated_cost=32, cost_category="activity"),
            TripActivity(stop_id=stop2.id, name="Akihabara Shopping", day_number=5, time_slot="15:00",
                         duration_minutes=180, estimated_cost=100, cost_category="activity"),
            TripActivity(stop_id=stop2.id, name="Departure", day_number=7, time_slot="11:00",
                         duration_minutes=180, estimated_cost=0, cost_category="transport"),
        ]
        db.add_all(activities_trip1)
        await db.flush()
        print(f"  ✅ Demo trip '{trip1.name}' with {len(activities_trip1)} activities")

        # ── Demo Trip 2: Parisian Winter ─────────────────────────────────
        trip2 = Trip(
            owner_id=demo.id,
            name="Parisian Winter",
            description="Four magical days in the city of light during the holiday season.",
            cover_url="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800",
            start_date=date(2026, 11, 22),
            end_date=date(2026, 11, 26),
            status="draft",
            is_public=False,
            budget_limit=1800.0,
        )
        db.add(trip2)
        await db.flush()

        stop_paris = Stop(trip_id=trip2.id, city_id=cities[1].id, city_name="Paris", country="France",
                          arrival_date=date(2026, 11, 22), departure_date=date(2026, 11, 26), order=0)
        db.add(stop_paris)
        await db.flush()

        activities_trip2 = [
            TripActivity(stop_id=stop_paris.id, name="Eiffel Tower", day_number=1, time_slot="10:00",
                         duration_minutes=120, estimated_cost=26, cost_category="activity"),
            TripActivity(stop_id=stop_paris.id, name="Seine River Cruise", day_number=1, time_slot="15:00",
                         duration_minutes=90, estimated_cost=18, cost_category="activity"),
            TripActivity(stop_id=stop_paris.id, name="Louvre Museum", day_number=2, time_slot="09:00",
                         duration_minutes=240, estimated_cost=17, cost_category="activity"),
            TripActivity(stop_id=stop_paris.id, name="Montmartre Walk", day_number=3, time_slot="10:00",
                         duration_minutes=180, estimated_cost=0, cost_category="activity"),
        ]
        db.add_all(activities_trip2)
        await db.flush()
        print(f"  ✅ Demo trip '{trip2.name}' with {len(activities_trip2)} activities")

        # ── Checklist for Kyoto trip ─────────────────────────────────────
        checklist_data = [
            ("Passport", "documents"), ("Flight printout", "documents"),
            ("Hotel confirmation", "documents"), ("Travel insurance", "documents"),
            ("Phone charger", "electronics"), ("Camera", "electronics"),
            ("Power adapter (JP)", "electronics"), ("Rain jacket", "clothing"),
            ("Comfortable walking shoes", "clothing"), ("Toothbrush", "toiletries"),
        ]
        for label, cat in checklist_data:
            db.add(ChecklistItem(user_id=demo.id, trip_id=trip1.id, label=label, category=cat))
        await db.flush()
        print(f"  ✅ {len(checklist_data)} checklist items seeded")

        # ── Notes ────────────────────────────────────────────────────────
        notes_data = [
            ("Hotel check-in info", "Check-in after 15:00. Reservation #KYO-4827. Ask for room with garden view.", trip1.id),
            ("Local SIM card", "Buy Sakura Mobile SIM at Kansai Airport arrivals. ¥3,000 for 7 days.", trip1.id),
            ("Restaurant reservations", "Nishiki Market — no reservation needed. Kikunoi — reserved for Oct 14, 18:30.", trip1.id),
        ]
        for title, body, tid in notes_data:
            db.add(Note(user_id=demo.id, trip_id=tid, title=title, body=body))
        await db.flush()
        print(f"  ✅ {len(notes_data)} notes seeded")

        await db.commit()
        print("\n🎉 Seed complete! Demo credentials:")
        print("   Admin: admin@traveloop.com / Admin@123")
        print("   User:  demo@traveloop.com  / Demo@123")


if __name__ == "__main__":
    asyncio.run(seed())
