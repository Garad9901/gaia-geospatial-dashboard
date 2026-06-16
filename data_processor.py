import os
import json
import csv

def main():
    csv_path = os.path.abspath(os.path.join("..", "Datasets", "housing.csv"))
    json_dir = os.path.join("src", "data")
    json_path = os.path.join(json_dir, "housing.json")
    
    print(f"Reading dataset from: {csv_path}")
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found.")
        return

    # Create target directory if it doesn't exist
    os.makedirs(json_dir, exist_ok=True)

    records = []
    
    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            # Downsample by taking every 10th record to keep it light and high-performing (~2,060 points)
            if i % 10 != 0:
                continue
            
            try:
                # Parse values and handle potential missing values (like total_bedrooms)
                lat = float(row['latitude'])
                lng = float(row['longitude'])
                age = float(row['housing_median_age']) if row['housing_median_age'] else 0.0
                rooms = float(row['total_rooms']) if row['total_rooms'] else 0.0
                bedrooms = float(row['total_bedrooms']) if row['total_bedrooms'] else 0.0
                pop = float(row['population']) if row['population'] else 0.0
                households = float(row['households']) if row['households'] else 0.0
                income = float(row['median_income']) if row['median_income'] else 0.0
                value = float(row['median_house_value']) if row['median_house_value'] else 0.0
                proximity = row['ocean_proximity'].strip()

                records.append({
                    "lat": lat,
                    "lng": lng,
                    "age": int(age),
                    "rooms": int(rooms),
                    "bedrooms": int(bedrooms),
                    "pop": int(pop),
                    "households": int(households),
                    "income": income,
                    "value": value,
                    "proximity": proximity
                })
            except Exception as e:
                print(f"Skipping row {i} due to parsing error: {e}")

    print(f"Processed {len(records)} records.")
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(records, f, indent=2)
        
    print(f"Successfully wrote JSON data to: {json_path}")

if __name__ == "__main__":
    main()
