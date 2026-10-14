"""
Synthetic realistic Flipkart product review dataset generator.
Generates 3,000 realistic reviews spanning 12 diverse Flipkart product categories,
authentic product brands, realistic ratings, contextual review titles & feedback,
Indian reviewer names, dates across the past year, helpful votes, and initial sentiment markers.
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
    ],
    "Beauty & Personal Care": [
        "Philips BT1232/15 Cordless Beard Trimmer",
        "Minimalist 10% Niacinamide Face Serum (30ml)",
        "Maybelline New York Colossal Waterproof Mascara",
        "L'Oreal Paris Extraordinary Oil Smooth Hair Serum",
        "Nivea Nourishing Body Milk Deep Moisture Lotion",
        "Beardo Godfather Beard Oil & Mustache Wax Combo",
        "WOW Skin Science Apple Cider Vinegar Shampoo 300ml"
    ],
    "Sports & Fitness": [
        "Yonex Nanoray Light 18i Graphite Badminton Racquet",
        "Boldfit 6mm TPE Anti-Skid Yoga Mat",
        "Cosco Hexagonal Rubber Dumbbells (5kg Pair)",
        "Nivia Storm Thermo-Bonded Football (Size 5)",
        "Vector X Speed Skipping Rope with Ball Bearings",
        "Strava Airflow Aerodynamic Cycling Helmet",
        "Strauss Dual Ab Roller Wheel with Knee Mat"
    ],
    "Books & Stationery": [
        "Atomic Habits by James Clear (Paperback)",
        "The Psychology of Money by Morgan Housel",
        "Ikigai: The Japanese Secret to Long Life",
        "Classmate Pulse 6-Subject Wiro Spiral Notebook",
        "Parker Vector Camouflage Matte Roller Ball Pen",
        "Rich Dad Poor Dad by Robert T. Kiyosaki",
        "Casio FX-991CW ClassWiz Scientific Calculator"
    ],
    "Toys & Baby Care": [
        "Lego Classic Medium Creative Brick Box (484 Pcs)",
        "Fisher-Price Musical Activity Push Walker",
        "Hot Wheels 5-Car Die-Cast Vehicle Gift Pack",
        "Pampers All Round Protection Baby Diaper Pants",
        "Beyblade Burst QuadDrive Cosmic Vector Battle Set",
        "Mee Mee Soft & Gentle Baby Wet Wipes (Pack of 3)",
        "Barbie Extra Doll with Blue Fluffy Coat"
    ],
    "Automotive Accessories": [
        "Vega Cliff ISI Certified Full Face Motorbike Helmet",
        "Michelin Digital High-Power Rapid Tyre Inflator",
        "3M Concentrated Car Wash Shampoo (1 Litre)",
        "Portronics Clamp M2 Universal Car Mobile Holder",
        "All-Weather 7D Custom Fit Waterproof Car Foot Mats",
        "Bosch Eco Twin Wiper Blade Set (Universal Fit)"
    ],
    "Grocery & Gourmet": [
        "Tata Tea Gold Rich & Aromatic Assam Tea (1 kg)",
        "Fortune Sunlite Refined Sunflower Oil (5 Litre Can)",
        "Kellogg's Crunchy Muesli with 21% Fruit & Nut (1 kg)",
        "Cadbury Dairy Milk Silk Premium Chocolate Gift Box",
        "Nescafe Classic 100% Pure Instant Coffee Glass Jar (200g)",
        "Happilo Premium California Roasted & Salted Almonds (500g)"
    ]
}

NAMES = [
    "Aarav Sharma", "Priya Patel", "Rahul Verma", "Ananya Iyer", "Rohan Gupta",
    "Sneha Reddy", "Vikram Malhotra", "Kavita Rao", "Aditya Joshi", "Pooja Nair",
    "Suresh Kumar", "Deepika Pillai", "Manish Tiwari", "Ritu Saxena", "Amitabh Sen",
    "Karthik Subramanian", "Divya Menon", "Harish Deshmukh", "Megha Bansal", "Nitin Chawla",
    "Sunita Choudhary", "Gaurav Bhatt", "Swati Kulkarni", "Abhishek Dubey", "Neha Singhania",
    "Varun Kapoor", "Siddharth Das", "Shweta Agarwal", "Rajesh Nambiar", "Tanvi Sengupta",
    "Arjun Mehra", "Bhavna Trivedi", "Chirag Singhal", "Ishita Chatterjee", "Manoj Kulkarni"
]

# Universal / General reviews
GENERAL_REVIEWS = {
    5: [
        ("Outstanding purchase!", "Absolutely loved the quality and performance. Worth every single rupee. Delivery was prompt and packaging was top notch."),
        ("Value for money!", "Best in this price segment. Build quality is solid and reliable. Exceeded all my expectations."),
        ("Superb experience", "Flipkart delivered within 24 hours! The product is 100% genuine and works seamlessly. Highly recommend to everyone."),
        ("Exceptional quality", "Premium finish, authentic product and very sturdy. Have been using it for weeks and zero complaints."),
        ("Paisa vasool product", "Top notch quality, exactly as described. Must buy if you are looking for dependable quality."),
        ("Just wow!", "Simply magnificent. Delivered in great condition and works as expected. Truly a five-star experience."),
        ("Mind-blowing", "Brilliant product, sleek design, and very intuitive. Customer support from Flipkart was also very supportive.")
    ],
    4: [
        ("Very good product", "Overall very satisfied with the purchase. Good quality and does its job well. Only minor issue is delivery took a day extra."),
        ("Worth the money", "Nice build quality and reliable performance. Good for daily usage. Delivered on time."),
        ("Solid performer", "Handles daily needs with ease. Material feels durable and sturdy. A tiny bit heavy, but otherwise great."),
        ("Good choice in this budget", "Features are competitive for this price point. Happy with Flipkart service."),
        ("Satisfied customer", "Decent performance and looks sleek. Clean packaging. Would recommend to friends and family.")
    ],
    3: [
        ("Average product", "It is an okay product. Neither too great nor terrible. Gets basic tasks done."),
        ("Decent for the price", "Build is average quality. Expected a bit more at this price point."),
        ("Mixed feelings", "Design is nice, but has occasional flaws. Delivery took 5 days instead of the promised 2 days."),
        ("Fair enough", "Gets basic things done. If your budget is tight, it works, otherwise look for alternatives."),
        ("Okay okay experience", "Acceptable quality. Flipkart packaging was slightly crushed on one corner, but item is intact.")
    ],
    2: [
        ("Disappointed", "Quality deteriorated within a few weeks of use. Customer service was slow to respond. Not recommended at all."),
        ("Below average quality", "Build material feels cheap and flimsy. Very unsatisfied with the purchase."),
        ("Not worth the hype", "Overpriced for what it offers. Regret buying this."),
        ("Poor customer care response", "Item had a minor scratch upon opening. Flipkart refused easy replacement citing policy issues. Very frustrating.")
    ],
    1: [
        ("Worst product ever", "Total waste of hard earned money. Stopped working or broke on the 4th day. Support is useless."),
        ("Defective unit received", "Received a malfunctioning piece. Do not buy! Terrible experience."),
        ("Horrible experience", "Fake promises. Damaged box delivered. Never buying again."),
        ("Pathetic quality and service", "Extremely bad quality. Customer care kept transferring calls without resolution."),
        ("Do not buy!", "Complete disappointment. Item looks refurbished and used. Zero refund or replacement provided.")
    ]
}

# Category-nuanced review templates
CATEGORY_REVIEWS = {
    "Beauty & Personal Care": {
        5: [
            ("Glowing skin results!", "Visible difference within two weeks of use. Gentle on skin with zero breakouts. Very premium bottle and 100% authentic product."),
            ("Super gentle & effective", "Great fragrance and lightweight formulation. Doesn't feel greasy or sticky at all. Flipkart delivered genuine sealed stock."),
            ("Flawless finish!", "Leaves skin smooth and well moisturized all day long. Excellent for sensitive skin. Worth every rupee.")
        ],
        4: [
            ("Good skincare product", "Works well for regular routine. Subtle pleasant scent and absorbs quickly. Quantity could be slightly larger for the price."),
            ("Satisfied with results", "Noticeable softening effect. Delivery was quick and packaging was intact.")
        ],
        3: [
            ("Average results", "Does the basic job but takes consistent use for mild improvements. Scent is slightly strong for my taste."),
            ("Decent but ordinary", "Acceptable moisturizer, but there are better alternatives in this price bracket.")
        ],
        2: [
            ("Did not suit my skin", "Caused mild breakouts and dryness after 3 days. Bottle pump stopped working midway."),
            ("Below expectations", "Texture feels heavy and sticky. Doesn't live up to the social media hype.")
        ],
        1: [
            ("Fake or expired item!", "Received broken seal bottle with foul smell. Clearly duplicate stock. Flipkart refused return or replacement."),
            ("Severe allergic reaction", "Gave severe rash within 24 hours! Complete waste of money and unsafe product. Beware.")
        ]
    },
    "Sports & Fitness": {
        5: [
            ("Superb balance and grip!", "Outstanding build quality and featherlight balance. High tension strings and comfortable handle grip. Elevated my game immediately!"),
            ("Solid gym companion", "Heavy duty durable material with fantastic anti-slip texture. No foul rubber smell. Excellent for intense workout sessions."),
            ("Professional grade", "Extremely sturdy and perfectly weighted. Stitching and finish are flawless. Best purchase on Flipkart!")
        ],
        4: [
            ("Very good equipment", "Good durable construction and easy to grip. Carrying strap makes it portable. Minor paint scuff, otherwise perfect."),
            ("Worth the money", "Reliable workout gear for home fitness. Foam cushioning is dense and supportive.")
        ],
        3: [
            ("Decent for beginners", "Good enough for casual workouts. Advanced athletes might need heavier or sturdier gear."),
            ("Moderate durability", "Grip wrap began peeling slightly after 3 weeks of intensive use. Playable but needs re-wrapping.")
        ],
        2: [
            ("Poor durability", "Grip loosened within 10 days and rubber shows micro-cracks. Not meant for daily training."),
            ("Subpar material", "Feels hollow and lacks proper balance. Cushioning compresses too easily under bodyweight.")
        ],
        1: [
            ("Snapped on third day!", "Completely snapped during normal play. Cheap brittle alloy material. Terrible quality control!"),
            ("Defective and ripped", "Product arrived with torn seams and damaged padding. Customer service gave zero assistance.")
        ]
    },
    "Books & Stationery": {
        5: [
            ("Life-changing masterpiece!", "Brilliant insights, engaging prose, and actionable advice. Book binding and crisp paper quality are top notch!"),
            ("Crisp print and premium pages", "High GSM paper, smooth ink flow without bleeding, and sturdy spiral binding. A joy for everyday note-taking."),
            ("Must read for everyone!", "Essential read for personal development. Original publication delivered safely wrapped in bubble wrap.")
        ],
        4: [
            ("Great read & good quality", "Content is insightful and thought-provoking. Printing is clear with no typos. Fast delivery by Flipkart."),
            ("Smooth writing experience", "Pen glides effortlessly on paper with vibrant ink. Nice ergonomic grip for long study hours.")
        ],
        3: [
            ("Good content, average print", "The book ideas are great, but the paperback cover feels a bit thin. Acceptable for the discounted price."),
            ("Decent notebook", "Pages are slightly thin for fountain pens, but works fine with ballpoint and gel pens.")
        ],
        2: [
            ("Poor binding quality", "Pages started coming loose from spine within a week. Disappointed with the binding standard."),
            ("Ink smudges easily", "Paper quality is lower than expected. Ink bleeds through to the other side.")
        ],
        1: [
            ("Pirated copy delivered!", "Faded printing, cut-off margins, and low quality xerox paper. Completely pirated reprint sold as new!"),
            ("Damaged and missing pages", "Book arrived with crumpled cover and 16 pages missing in chapter 4. Horrible experience.")
        ]
    },
    "Toys & Baby Care": {
        5: [
            ("Kids absolutely love it!", "High quality non-toxic plastic with smooth rounded edges. Engaging, colorful, and super safe for toddlers."),
            ("Gentle and hypoallergenic", "Softest wipes with zero harsh chemicals. Kept baby rash-free and moisturized. Re-sealable lid stays moist."),
            ("Endless creative fun", "Fantastic set with vibrant blocks that fit snugly. Keeps kids entertained for hours away from screens!")
        ],
        4: [
            ("Very good toy", "Sturdy construction and bright cheerful sounds. Volume level is pleasant and not overly loud."),
            ("Gentle on baby skin", "Soft texture and nice mild scent. Absorbs well and does not cause irritation.")
        ],
        3: [
            ("Average toy quality", "Kids enjoyed it for a few days before losing interest. Wheels are slightly slippery on smooth tiles."),
            ("Okay diapers", "Absorption is fine for 4-5 hours during daytime, but leaks occasionally overnight.")
        ],
        2: [
            ("Fragile plastic parts", "Small plastic clip snapped on second day. Needs much sturdier joints for toddlers."),
            ("Causes mild redness", "Fragrance is a bit too strong for infant skin. Had to discontinue after couple days.")
        ],
        1: [
            ("Choking hazard & broken piece", "Received cracked toy with sharp plastic edges exposed! Dangerous for children. Return rejected by seller."),
            ("Terrible diaper leakage", "Horrible leakage and poor fit. Gave bad diaper rashes. Never ordering this brand again.")
        ]
    },
    "Automotive Accessories": {
        5: [
            ("Lifesaver on highway!", "Filled tyre from 20 to 35 PSI in under 3 minutes! Digital gauge is pinpoint accurate and auto-shutoff is flawless."),
            ("Crystal clear vision & fit", "Perfect fit for my car windshield. Wipes completely streak-free even in torrential monsoon rain. Silent operation!"),
            ("Rock solid grip & safety", "Holds phone securely over rough potholes and speed bumps. Quick release button is super convenient.")
        ],
        4: [
            ("Good quality accessory", "Clean finish and durable rubber backing. Protects car cabin well against mud and dust."),
            ("Reliable inflator", "Cord length reaches all 4 tyres easily. Gets warm after 10 mins, but works very reliably.")
        ],
        3: [
            ("Average car mount", "Suction cup holds well on windshield, but struggles to stay firmly on textured dashboard."),
            ("Decent shampoo", "Produces good foam but requires significant scrubbing for tough bird droppings and road grime.")
        ],
        2: [
            ("Clamp broke in 2 weeks", "Plastic ball joint became loose and phone keeps tilting downwards while driving."),
            ("Weak air pressure", "Takes over 12 minutes to inflate single car tyre. Gauge reading is off by 4 PSI.")
        ],
        1: [
            ("Total failure & blown fuse", "Blew my car 12V socket fuse on first plug-in! Defective wiring and dangerous product."),
            ("Terrible sizing and cheap smell", "Mats do not fit vehicle floor at all. Overpowering toxic chemical smell inside car. Waste of money.")
        ]
    },
    "Grocery & Gourmet": {
        5: [
            ("Rich aroma and authentic flavor", "Freshest tea leaves with rich color and invigorating aroma. Hermetically sealed pouch ensured farm-fresh quality!"),
            ("Crunchy and nutritious!", "Packed with generous crunchy almonds, raisins, and rolled oats. Perfect morning breakfast with chilled milk."),
            ("Pure delight & fast delivery", "Delivered within 18 hours in insulated cool packaging. Melt in mouth silk chocolate with zero melting damage!")
        ],
        4: [
            ("Fresh and good taste", "Good roasting quality and light salt balance. Crisp nuts in zip-lock pouch."),
            ("Quality staple", "Clean and light cooking oil. No smoking or odor during deep frying. Reliable brand.")
        ],
        3: [
            ("Average flavor", "Taste is ordinary compared to local gourmet roasters. Some broken nut pieces in the jar."),
            ("Decent coffee", "Strong aroma but slightly bitter aftertaste. Good for instant daily kick.")
        ],
        2: [
            ("Near expiration date!", "Received packet with only 3 weeks remaining until expiry. Flipkart grocery should check dates before shipping."),
            ("Soggy and stale", "Muesli lacked crunchiness. Packaging seal seemed compromised upon arrival.")
        ],
        1: [
            ("Completely melted & damaged!", "Chocolate box arrived melted into a liquid puddle. Courier tossed into hot van. Disgusting mess!"),
            ("Foul rancid oil smell", "Oil bottle arrived leaking with rancid rancid smell. Complete health hazard. Flipkart support refused refund.")
        ]
    }
}

SUSPICIOUS_SHORT = [
    (5, "Good", "Good"),
    (5, "Nice", "Nice product ok"),
    (5, "Super", "Super!"),
    (5, "Ok", "Ok good"),
    (1, "Bad", "Bad")
]

SUSPICIOUS_MISMATCH = [
    (5, "Terrible defect", "Worst product ever, defective and broken, total waste of money and horrible customer service!"),
    (1, "Awesome flagship", "Best purchase I ever made, amazing quality and supreme durability worth every single rupee!"),
    (5, "Don't buy", "Stopped working within 2 days, complete scam and broken unit."),
    (1, "Mind blowing", "Superb experience, absolutely loved the quality and performance worth every single rupee!")
]

DUPLICATE_TEXTS = [
    "100% genuine product must buy definitely satisfied with flipkart fast delivery",
    "Original product best in class awesome durability and supreme build quality",
    "Exceptional value for money highly recommended to all flipkart buyers"
]

def generate_csv(output_path="backend/data/flipkart_reviews.csv", total_rows=3000):
    start_date = datetime(2025, 1, 1)
    end_date = datetime(2026, 9, 30)
    time_delta_days = (end_date - start_date).days
    cat_keys = list(CATEGORIES.keys())

    rows = []

    # 1. Suspicious short reviews (40 rows)
    for i in range(40):
        rating, title, text = random.choice(SUSPICIOUS_SHORT)
        cat = random.choice(cat_keys)
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

    # 2. Sentiment-rating mismatch (35 rows)
    for i in range(35):
        rating, title, text = random.choice(SUSPICIOUS_MISMATCH)
        cat = random.choice(cat_keys)
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

    # 3. Duplicate texts across multiple accounts (30 rows)
    for i in range(30):
        dup_text = DUPLICATE_TEXTS[i % len(DUPLICATE_TEXTS)]
        cat = cat_keys[i % len(cat_keys)]
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

    # 4. Fill remaining rows with realistic rating distribution
    # 5 stars ~48%, 4 stars ~26%, 3 stars ~11%, 2 stars ~6%, 1 star ~9%
    rating_weights = [0.09, 0.06, 0.11, 0.26, 0.48]  # 1, 2, 3, 4, 5
    ratings_choices = [1, 2, 3, 4, 5]

    while len(rows) < total_rows:
        rating = random.choices(ratings_choices, weights=rating_weights)[0]
        cat = random.choice(cat_keys)
        prod = random.choice(CATEGORIES[cat])

        # Pick category-nuanced review or general review
        if cat in CATEGORY_REVIEWS and rating in CATEGORY_REVIEWS[cat] and random.random() < 0.72:
            title, base_text = random.choice(CATEGORY_REVIEWS[cat][rating])
        else:
            title, base_text = random.choice(GENERAL_REVIEWS[rating])

        reviewer = random.choice(NAMES)
        d = start_date + timedelta(days=random.randint(0, time_delta_days))

        # Helpful votes distribution
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

    print(f"Successfully generated {len(rows)} reviews across {len(cat_keys)} categories at {output_path}")

if __name__ == "__main__":
    generate_csv()
