import pandas as pd

# Load your CSV file
df = pd.read_csv('order_history_generated.csv')

# Find all duplicate rows based on a specific column
# keep=False marks all occurrences as True
duplicates = df[df.duplicated(subset=['history_id'], keep=False)]

print(duplicates)
