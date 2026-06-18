#!/bin/bash
# seed.sh - Seeding 20 restaurants, first 15 with random food images.

BASE_URL="${BASE_URL:-http://localhost:10000/api}"
OWNER_ID="${OWNER_ID:-999999999}"

restaurant_names=("Pizza Palace" "Sushi Zen" "Burger Barn" "Taco Fiesta" "Curry House" "Golden Dragon" "Le Bistro" "Falafel King" "The Greek Spot" "Pasta Bella" "Seoul Kitchen" "Bangkok Street" "Smokehouse BBQ" "Green Garden" "Ocean Catch" "Steak and Grill" "Morning Brew Cafe" "Sweet Tooth Bakery" "Shawarma Express" "Noodle Bar")
restaurant_categories=("Italian" "Japanese" "American" "Mexican" "Indian" "Chinese" "French" "Middle Eastern" "Greek" "Italian" "Korean" "Thai" "American" "Vegan" "Seafood" "Steakhouse" "Cafe" "Dessert" "Middle Eastern" "Asian")
dishes=("Classic Special" "House Platter" "Chefs Choice" "Spicy Delight" "Grilled Combo" "Fresh Salad" "Signature Roll" "Deluxe Box" "Family Meal" "Side and Drink")

create_restaurant() {
    local name="$1" address="$2" category="$3" phone="$4" image_url="$5"
    local payload location
    payload=$(printf '{"name":"%s","address":"%s","category":"%s","phoneNum":"%s","ownerId":"%s","imageUrl":"%s"}' "$name" "$address" "$category" "$phone" "$OWNER_ID" "$image_url")
    location=$(curl -s -D - -o /dev/null -X POST "$BASE_URL/restaurants" -H "Content-Type: application/json" -d "$payload" | grep -i '^location:' | tr -d '\r' | awk '{print $2}')
    echo "${location##*/}"
}

create_product() {
    local rid="$1" name="$2" desc="$3" category="$4" price="$5" image_url="$6"
    local payload
    payload=$(printf '{"name":"%s","description":"%s","category":"%s","price":%d,"imageUrl":"%s"}' "$name" "$desc" "$category" "$price" "$image_url")
    curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/restaurants/$rid/products" -H "Content-Type: application/json" -d "$payload"
}

echo "Seeding with 15 restaurants featuring food images..."

for i in "${!restaurant_names[@]}"; do
    name="${restaurant_names[$i]}"
    category="${restaurant_categories[$i]}"
    address="$((i + 1)) Main Street, Tel Aviv"
    phone="03-555$(printf '%04d' "$((i + 1))")"
    
    # 15 ראשונות מקבלות תמונת אוכל רנדומלית
    rest_image=""
    if [ "$i" -lt 15 ]; then
        rest_image="https://loremflickr.com/500/300/food?lock=${i}"
    fi

    rid=$(create_restaurant "$name" "$address" "$category" "$phone" "$rest_image")
    [ -z "$rid" ] && continue
    echo "[ok] Restaurant '$name' created."

    for j in "${!dishes[@]}"; do
        dish="${dishes[$j]}"
        price=$((25 + j * 3 + i))
        
        # 15 ראשונות מקבלות תמונות למוצרים
        prod_image=""
        if [ "$i" -lt 15 ]; then
            prod_image="https://loremflickr.com/300/300/food?lock=${i}${j}"
        fi
        
        create_product "$rid" "$dish" "Delicious $dish" "$category" "$price" "$prod_image"
    done
done
