import re
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def list_rides():
    with open('src/data/itinerary.ts', 'r', encoding='utf-8') as f:
        content = f.read()

    days = content.split('dayNumber:')
    for day in days[1:]:
        day_num = day.split(',')[0].strip()
        print(f"--- Day {day_num} ---")
        
        # rideToFirst
        rtf_match = re.search(r'rideToFirst:\s*\{([^}]+)\}', day)
        if rtf_match:
            print(f"  rideToFirst: {rtf_match.group(1).strip()}")
        
        # activities
        activities = day.split('title: "')[1:]
        for act in activities:
            title = act.split('"', 1)[0]
            rtn_match = re.search(r'rideToNext:\s*\{([^}]+)\}', act)
            if rtn_match:
                print(f"  Activity: {title} -> rideToNext: {rtn_match.group(1).strip()}")

list_rides()