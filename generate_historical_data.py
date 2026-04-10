#!/usr/bin/env python3
"""
Generate historical sales data from 1880 to 2024.
Creates CSV files for transactions and order_history tables.
"""

import csv
import random
import os
import math
from datetime import datetime, timedelta

# Common first and last names for random customer generation
FIRST_NAMES = [
    "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
    "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
    "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Lisa", "Daniel", "Nancy",
    "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
    "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
    "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa",
    "Timothy", "Deborah", "Ronald", "Stephanie", "Edward", "Rebecca", "Jason", "Sharon",
    "Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Amy",
    "Nicholas", "Angela", "Eric", "Shirley", "Jonathan", "Anna", "Stephen", "Brenda",
    "Larry", "Pamela", "Justin", "Emma", "Scott", "Nicole", "Brandon", "Helen",
    "Benjamin", "Samantha", "Samuel", "Katherine", "Raymond", "Christine", "Gregory", "Debra",
    "Frank", "Rachel", "Alexander", "Carolyn", "Patrick", "Janet", "Jack", "Catherine"
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
    "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
    "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
    "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
    "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
    "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker",
    "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy",
    "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey",
    "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson"
]

def get_random_customer_name():
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"

def get_menu_items():
    """Return menu items - update these based on your actual menu."""
    # These are example items - the script will use these
    # Format: (menu_id, name, cost)
    return [
        (1, "Classic Milk Tea small", 4.75),
        (2, "Classic Milk Tea large", 5.50),
        (3, "Tiger Milk Tea small", 5.25),
        (4, "Tiger Milk Tea large", 6.00),
        (5, "Taro Milk Tea small", 5.00),
        (6, "Taro Milk Tea large", 5.75),
        (7, "Honeydew Milk Tea small", 5.00),
        (8, "Honeydew Milk Tea large", 5.75),
        (9, "Thai Milk Tea small", 5.25),
        (10, "Thai Milk Tea large", 6.00),
        (11, "Matcha Milk Tea small", 5.50),
        (12, "Matcha Milk Tea large", 6.25),
        (13, "Jasmine Green Tea small", 4.25),
        (14, "Jasmine Green Tea large", 5.00),
        (15, "Oolong Tea small", 4.25),
        (16, "Oolong Tea large", 5.00),
        (17, "Passion Fruit Tea small", 4.75),
        (18, "Passion Fruit Tea large", 5.50),
        (19, "Mango Green Tea small", 4.75),
        (20, "Mango Green Tea large", 5.50),
        (21, "Popcorn Chicken", 5.50),
        (22, "Spring Rolls", 4.50),
        (23, "Egg Puff", 3.50),
        (24, "Mochi", 3.00),
    ]

def calculate_monthly_revenue(year, month):
    """
    Calculate target monthly revenue based on year.
    Growth from ~$100/year in 1880 to ~$50,000/month in 2024.
    Using exponential growth model.
    """
    # Years from start
    years_elapsed = year - 1880 + (month - 1) / 12
    total_years = 2024 - 1880  # 144 years
    
    # Starting: ~$100/year = ~$8.33/month
    # Ending: ~$50,000/month
    start_monthly = 8.33
    end_monthly = 50000
    
    # Exponential growth: end = start * e^(rate * time)
    # rate = ln(end/start) / total_time
    import math
    rate = math.log(end_monthly / start_monthly) / total_years
    
    target = start_monthly * math.exp(rate * years_elapsed)
    
    # Add some random variance (±20%)
    variance = random.uniform(0.8, 1.2)
    return target * variance

def generate_orders_for_month(year, month, menu_items, start_order_id, start_history_id):
    """Generate orders for a specific month."""
    transactions = []
    order_history = []
    
    target_revenue = calculate_monthly_revenue(year, month)
    current_revenue = 0
    order_id = start_order_id
    history_id = start_history_id
    
    # Calculate days in month
    if month == 12:
        next_month = datetime(year + 1, 1, 1)
    else:
        next_month = datetime(year, month + 1, 1)
    days_in_month = (next_month - datetime(year, month, 1)).days
    
    while current_revenue < target_revenue:
        # Random day and time within the month (business hours 8am-9pm)
        day = random.randint(1, days_in_month)
        hour = random.randint(8, 20)
        minute = random.randint(0, 59)
        second = random.randint(0, 59)
        
        try:
            timestamp = datetime(year, month, day, hour, minute, second)
        except ValueError:
            # Handle invalid dates (e.g., Feb 30)
            continue
        
        # Determine number of items (weighted toward 1-2 items)
        item_count_weights = [0.45, 0.35, 0.15, 0.05]  # 1, 2, 3, 4 items
        num_items = random.choices([1, 2, 3, 4], weights=item_count_weights)[0]
        
        # Select random items for this order
        order_items = random.choices(menu_items, k=num_items)
        
        order_total = 0
        for item in order_items:
            menu_id, name, cost = item
            quantity = 1  # Each line item is quantity 1
            
            order_history.append({
                'history_id': history_id,
                'order_id': order_id,
                'item_id': menu_id,
                'quantity': quantity
            })
            history_id += 1
            order_total += cost
        
        # Create transaction
        employee_id = random.randint(0, 11)
        customer_name = get_random_customer_name()
        
        transactions.append({
            'order_id': order_id,
            'order_total': round(order_total, 2),
            'timestamp': timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'employee_id': employee_id,
            'customer_name': customer_name
        })
        
        current_revenue += order_total
        order_id += 1
    
    return transactions, order_history, order_id, history_id

def main():
    print("Fetching menu items...")
    menu_items = get_menu_items()
    print(f"Found {len(menu_items)} menu items")
    
    for item in menu_items[:5]:
        print(f"  - {item[1]}: ${item[2]}")
    if len(menu_items) > 5:
        print(f"  ... and {len(menu_items) - 5} more")
    
    all_transactions = []
    all_order_history = []
    
    # Start IDs from 1 (tables will be cleared)
    order_id = 1
    history_id = 1
    
    start_year = 2000
    end_year = 2026  # Current year
    
    print(f"\nGenerating data from {start_year} to {end_year}...")
    
    for year in range(start_year, end_year + 1):
        if year % 10 == 0:
            print(f"  Processing year {year}...")
        
        for month in range(1, 13):
            # Skip future months in 2026 (current month is April)
            if year == 2026 and month > 4:
                break
            
            transactions, order_history, order_id, history_id = generate_orders_for_month(
                year, month, menu_items, order_id, history_id
            )
            
            all_transactions.extend(transactions)
            all_order_history.extend(order_history)
    
    print(f"\nGenerated {len(all_transactions)} transactions")
    print(f"Generated {len(all_order_history)} order history entries")
    
    # Write transactions CSV
    print("\nWriting transactions.csv...")
    with open('transactions_generated.csv', 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['order_id', 'order_total', 'timestamp', 'employee_id', 'customer_name'])
        writer.writeheader()
        writer.writerows(all_transactions)
    
    # Write order_history CSV
    print("Writing order_history.csv...")
    with open('order_history_generated.csv', 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['history_id', 'order_id', 'item_id', 'quantity'])
        writer.writeheader()
        writer.writerows(all_order_history)
    
    # Generate SQL insert statements as well
    print("Writing insert_data.sql...")
    with open('insert_data.sql', 'w') as f:
        f.write("-- Generated historical sales data\n")
        f.write("-- Run this after clearing existing transactions and order_history\n\n")
        
        f.write("-- Clear existing data (be careful!)\n")
        f.write("-- TRUNCATE order_history, transactions RESTART IDENTITY CASCADE;\n\n")
        
        f.write("-- Insert transactions\n")
        for i, t in enumerate(all_transactions):
            customer_name_escaped = t['customer_name'].replace("'", "''")
            f.write(f"INSERT INTO transactions (order_id, order_total, timestamp, employee_id, customer_name) ")
            f.write(f"VALUES ({t['order_id']}, {t['order_total']}, '{t['timestamp']}', {t['employee_id']}, '{customer_name_escaped}');\n")
            
            if i > 0 and i % 10000 == 0:
                f.write(f"-- Progress: {i} transactions\n")
        
        f.write("\n-- Insert order history\n")
        for i, oh in enumerate(all_order_history):
            f.write(f"INSERT INTO order_history (history_id, order_id, item_id, quantity) ")
            f.write(f"VALUES ({oh['history_id']}, {oh['order_id']}, {oh['item_id']}, {oh['quantity']});\n")
            
            if i > 0 and i % 10000 == 0:
                f.write(f"-- Progress: {i} order history entries\n")
    
    print("\nDone! Files created:")
    print("  - transactions_generated.csv")
    print("  - order_history_generated.csv")
    print("  - insert_data.sql")
    
    # Print some stats
    total_revenue = sum(t['order_total'] for t in all_transactions)
    print(f"\nTotal revenue generated: ${total_revenue:,.2f}")
    
    # Revenue by decade
    print("\nRevenue by decade:")
    for decade in range(1880, 2030, 10):
        decade_revenue = sum(
            t['order_total'] for t in all_transactions 
            if decade <= int(t['timestamp'][:4]) < decade + 10
        )
        print(f"  {decade}s: ${decade_revenue:,.2f}")

if __name__ == "__main__":
    main()
