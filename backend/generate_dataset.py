"""
Synthetic realistic Flipkart product review dataset generator.
Generates 2,500 realistic reviews spanning multiple categories, product brands,
realistic ratings, review titles, Indian reviewer names, dates across the past year,
helpful votes, and initial sentiment markers.
"""

import random
import csv
from datetime import datetime, timedelta

random.seed(42)

CATEGORIES = {
    "Mobiles": [
        "Apple iPhone 15 (128 GB) - Blue",
        "Samsung Galaxy S23 5G (Phantom Black)",
        "Realme Narzo 60 5G (Cosmic Black)",
        "Redmi Note 13 Pro+ 5G (Fusion Purple)",
        "OnePlus 12R 5G (Cool Blue)",
        "POCO X6 Pro 5G (Yellow, 256 GB)",
        "Motorola Edge 50 Fusion (Marshmallow Blue)",
        "Google Pixel 8 (Hazel, 128 GB)"
    ],
    "Electronics": [
        "ASUS TUF Gaming F15 (16GB RAM, RTX 3050)",
        "HP Pavilion 15 (Intel Core i5 13th Gen)",
        "Apple MacBook Air M2 (8GB RAM, 256GB SSD)",
        "Lenovo IdeaPad Slim 3 (16GB RAM)",
        "Dell Inspiron 14 (AMD Ryzen 5)",
        "Samsung 27-inch Curved Gaming Monitor",
        "SanDisk Extreme 1TB Portable External SSD"
    ],
    "Audio": [
        "boAt Rockerz 450 Bluetooth On Ear Headphones",
        "Sony WH-1000XM4 Noise Cancelling Headphones",
        "JBL Tune 760NC Active Noise Cancellation",
        "OnePlus Nord Buds 2 TWS Earbuds",
        "Noise Two Wireless On-Ear Headphones",
        "realme Buds T300 with 30dB ANC"
    ],
    "Fashion": [
        "Levi's Men Slim Fit Blue Jeans",
        "Puma Men Running Shoes Darter Pro",
        "Roadster Solid Casual Cotton Shirt",
        "Fastrack Reflex Play Smartwatch",
        "Allen Solly Men Regular Fit Casual Shirt",
        "Red Tape Classic Sneaker for Men"
    ],
    "Home & Kitchen": [
        "Prestige PIC 20 1600W Induction Cooktop",
        "Philips Daily Collection 500W Mixer Grinder",
        "Pigeon by Stovekraft 1.5L Electric Kettle",
        "Wonderchef Nutri-blend 400W 2 Jars",
        "Milton Thermosteel Flip Lid Flask 1000ml",
        "Kent Grand Plus RO Water Purifier"
    ],
    "Appliances": [
        "LG 7 kg Fully Automatic Top Load Washing Machine",
        "Whirlpool 190 L Direct Cool Single Door 3-Star Refrigerator",
        "Voltas 1.5 Ton 3 Star Inverter Split AC",
        "Samsung 28 L Convection Microwave Oven",
        "IFB 6.5 kg Fully Automatic Front Load Washing Machine"
    ]
}

NAMES = [
    "Aarav Sharma", "Priya Patel", "Rahul Verma", "Ananya Iyer", "Rohan Gupta",
    "Sneha Reddy", "Vikram Malhotra", "Kavita Rao", "Aditya Joshi", "Pooja Nair",
    "Suresh Kumar", "Deepika Pillai", "Manish Tiwari", "Ritu Saxena", "Amitabh Sen",
    "Karthik Subramanian", "Divya Menon", "Harish Deshmukh", "Megha Bansal", "Nitin Chawla",
    "Sunita Choudhary", "Gaurav Bhatt", "Swati Kulkarni", "Abhishek Dubey", "Neha Singhania",
    "Varun Kapoor", "Siddharth Das", "Shweta Agarwal", "Rajesh Nambiar", "Tanvi Sengupta"
]

REVIEWS_BY_RATING = {
    5: [
        ("Outstanding purchase!", "Absolutely loved the quality and performance. Worth every single rupee. Delivery was prompt and packaging was top notch."),
        ("Value for money!", "Best in this price segment. Build quality is solid and battery life is unbelievable. Exceeded all my expectations."),
        ("Superb experience", "Flipkart delivered within 24 hours! The product is 100% genuine and works seamlessly. Highly recommend to everyone."),
        ("Exceptional quality", "Premium finish, crisp display and outstanding battery backup. Have been using it for two weeks and zero complaints."),
        ("Paisa vasool product", "Super fast, stylish design and top tier performance. Must buy if you are looking for dependable quality."),
        ("Just wow!", "Simply magnificent. Camera clarity and sound output blew me away. Truly a flagship level experience."),
        ("Mind-blowing", "Brilliant product, sleek design, and very intuitive. Customer support from Flipkart was also very supportive when tracking.")
    ],
    4: [
        ("Very good product", "Overall very satisfied with the purchase. Good performance and battery life. Only minor issue is charging speed could be faster."),
        ("Worth the money", "Nice build quality and reliable performance. Camera and audio are good for daily usage. Delivered on time."),
        ("Solid performer", "Handles multitasking with ease. Display is sharp and colors are punchy. A tiny bit heavy in hand, but otherwise great."),
        ("Good choice in this budget", "Features are competitive for this price point. Sound is clear and build feels sturdy. Happy with Flipkart service."),
        ("Satisfied customer", "Decent performance and looks sleek. Software is clean with minimal bloatware. Would recommend for students and pros."),
        ("Good but minor heating", "Device runs very well for 95% of tasks. Heats up a bit during heavy gaming sessions, but normal usage is butter smooth.")
    ],
    3: [
        ("Average product", "It is an okay product. Neither too great nor terrible. Camera is decent in daylight but struggles in low light."),
        ("Decent for the price", "Build is average plastic quality. Battery lasts around 6 to 7 hours of moderate use. Expected a bit more at this price."),
        ("Mixed feelings", "Design is nice, but software has occasional bugs and stutters. Delivery took 5 days instead of the promised 2 days."),
        ("Fair enough", "Gets basic tasks done. Sound quality is mediocre. If your budget is tight, it works, otherwise look for alternatives."),
        ("Okay okay experience", "Good display but average battery backup. Flipkart packaging was slightly crushed on one corner, but item works.")
    ],
    2: [
        ("Disappointed", "Battery drains rapidly within 3 to 4 hours. Customer service was slow to respond. Not recommended at all."),
        ("Below average quality", "Build material feels cheap and flimsy. Started lagging within a week of purchase. Very unsatisfied."),
        ("Not worth the hype", "Overpriced for what it offers. Constant heating issue even while browsing and watching videos. Regret buying this."),
        ("Poor customer care response", "Item had a minor dent upon opening. Flipkart refused easy replacement citing policy issues. Very frustrating.")
    ],
    1: [
        ("Worst product ever", "Total waste of hard earned money. Stopped working on the 4th day. Flipkart support is useless and denied return."),
        ("Defective unit received", "Received a malfunctioning piece. Heavy heating issue and battery dying in 1 hour. Do not buy! Terrible experience."),
        ("Horrible experience", "Fake promises. Sound is cracked, display flickers constantly. Flipkart delivered a damaged box. Never buying again."),
        ("Pathetic quality and service", "Extremely bad quality. Broke within two weeks. Customer care kept transferring calls without resolution."),
        ("Do not buy!", "Complete fraud. Item looks refurbished and used. Zero refund or replacement provided. Worst shopping experience.")
    ]
}

# Suspicious review templates (heuristics to trigger suspicious detection)
# 1. 5-star rating with very short text (< 12 chars)
SUSPICIOUS_SHORT = [
    (5, "Good", "Good"),
    (5, "Nice", "Nice product ok"),
    (5, "Super", "Super!"),
    (5, "Ok", "Ok good"),
    (1, "Bad", "Bad")
]

# 2. Extreme sentiment-rating mismatch
SUSPICIOUS_MISMATCH = [
    (5, "Terrible defect", "Worst product ever, defective and broken, total waste of money and horrible customer service!"),
    (1, "Awesome flagship", "Best phone I ever had, amazing camera clarity and battery backup is simply marvelous!"),
    (5, "Don't buy", "Stopped working within 2 days, complete scam and broken unit."),
    (1, "Mind blowing", "Superb experience, absolutely loved the quality and performance worth every single rupee!")
]

# 3. Near-duplicate text across multiple reviewer names
DUPLICATE_TEXTS = [
    "100% genuine product must buy definitely satisfied with flipkart fast delivery",
    "Original product best in class awesome battery and supreme display quality"
]

def generate_csv(output_path="backend/data/flipkart_reviews.csv", total_rows=2500):
    start_date = datetime(2025, 1, 1)
    end_date = datetime(2026, 9, 30)
    time_delta_days = (end_date - start_date).days

    rows = []
    
    # 1. First add some controlled suspicious entries (approx 70-80 suspicious rows)
    # Short reviews (30)
    for i in range(30):
        rating, title, text = random.choice(SUSPICIOUS_SHORT)
        cat = random.choice(list(CATEGORIES.keys()))
        prod = random.choice(CATEGORIES[cat])
        d = start_date + timedelta(days=random.randint(0, time_delta_days))
        rows.append({
            "category": cat,
            "product_name": prod,
            "reviewer_name": random.choice(NAMES),
            "rating": rating,
            "review_title": title,
            "review_text": text,
            "date": d.strftime("%Y-%m-%d"),
            "helpful_votes": random.randint(0, 5)
        })

    # Sentiment mismatch (25)
    for i in range(25):
        rating, title, text = random.choice(SUSPICIOUS_MISMATCH)
        cat = random.choice(list(CATEGORIES.keys()))
        prod = random.choice(CATEGORIES[cat])
        d = start_date + timedelta(days=random.randint(0, time_delta_days))
        rows.append({
            "category": cat,
            "product_name": prod,
            "reviewer_name": random.choice(NAMES),
            "rating": rating,
            "review_title": title,
            "review_text": text,
            "date": d.strftime("%Y-%m-%d"),
            "helpful_votes": random.randint(0, 8)
        })

    # Duplicates across different reviewers (25)
    for i in range(25):
        dup_text = DUPLICATE_TEXTS[i % len(DUPLICATE_TEXTS)]
        cat = "Mobiles" if i % 2 == 0 else "Electronics"
        prod = CATEGORIES[cat][i % len(CATEGORIES[cat])]
        d = start_date + timedelta(days=random.randint(0, time_delta_days))
        rows.append({
            "category": cat,
            "product_name": prod,
            "reviewer_name": NAMES[(i * 3) % len(NAMES)],
            "rating": 5,
            "review_title": "Genuine and Best",
            "review_text": dup_text,
            "date": d.strftime("%Y-%m-%d"),
            "helpful_votes": random.randint(0, 15)
        })

    # Fill remaining rows up to total_rows with realistic distribution
    # 5 stars ~48%, 4 stars ~26%, 3 stars ~11%, 2 stars ~6%, 1 star ~9%
    rating_weights = [0.09, 0.06, 0.11, 0.26, 0.48] # 1, 2, 3, 4, 5
    ratings_choices = [1, 2, 3, 4, 5]

    while len(rows) < total_rows:
        rating = random.choices(ratings_choices, weights=rating_weights)[0]
        title, base_text = random.choice(REVIEWS_BY_RATING[rating])
        
        # Add slight natural variations
        cat = random.choice(list(CATEGORIES.keys()))
        prod = random.choice(CATEGORIES[cat])
        reviewer = random.choice(NAMES)
        d = start_date + timedelta(days=random.randint(0, time_delta_days))
        
        # Variations in helpful votes (positively skewed)
        if rating in [4, 5]:
            helpful = random.choices([0, 1, 2, 3, 5, 8, 12, 24, 45], weights=[25, 20, 15, 12, 10, 8, 5, 3, 2])[0]
        elif rating == 1:
            helpful = random.choices([0, 1, 2, 4, 9, 18, 32], weights=[20, 20, 15, 15, 12, 10, 8])[0]
        else:
            helpful = random.choices([0, 1, 2, 3, 5], weights=[45, 25, 15, 10, 5])[0]

        rows.append({
            "category": cat,
            "product_name": prod,
            "reviewer_name": reviewer,
            "rating": rating,
            "review_title": title,
            "review_text": base_text,
            "date": d.strftime("%Y-%m-%d"),
            "helpful_votes": helpful
        })

    # Shuffle to distribute evenly
    random.shuffle(rows)

    # Assign review_id and baseline sentiment, sentiment_score
    fieldnames = [
        "review_id", "date", "category", "product_name",
        "reviewer_name", "rating", "review_title", "review_text",
        "sentiment", "sentiment_score", "helpful_votes"
    ]

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for idx, row in enumerate(rows, start=1001):
            rating = row["rating"]
            if rating >= 4:
                sent = "Positive"
                score = round(random.uniform(0.35, 0.95), 4)
            elif rating == 3:
                sent = "Neutral"
                score = round(random.uniform(-0.15, 0.15), 4)
            else:
                sent = "Negative"
                score = round(random.uniform(-0.95, -0.35), 4)

            writer.writerow({
                "review_id": f"FK_REV_{idx}",
                "date": row["date"],
                "category": row["category"],
                "product_name": row["product_name"],
                "reviewer_name": row["reviewer_name"],
                "rating": rating,
                "review_title": row["review_title"],
                "review_text": row["review_text"],
                "sentiment": sent,
                "sentiment_score": score,
                "helpful_votes": row["helpful_votes"]
            })

    print(f"Successfully generated {len(rows)} reviews at {output_path}")

if __name__ == "__main__":
    generate_csv()
