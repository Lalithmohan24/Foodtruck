# foodtrucks/management/commands/load_foodtrucks.py
import csv
from django.core.management.base import BaseCommand
from foodtrucks.models import FoodTruck
from datetime import datetime
import pandas as pd

class Command(BaseCommand):
    help = 'Load food trucks from CSV'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='Path to the CSV file')
        parser.add_argument('--columns', nargs='+', type=str, help='Columns to include')

    def handle(self, *args, **options):
        file_path = options['file_path']
        columns_to_include = options['columns'] or []

        # Read CSV using pandas
        df = pd.read_csv(file_path)
        for index, row in df.iterrows():
            df.loc[index, 'Approved'] = pd.Timestamp('0001-01-01 00:00:00') if pd.isna(row['Approved']) else pd.to_datetime(row['Approved'], format='%m/%d/%Y %I:%M:%S %p')
            df.loc[index, 'ExpirationDate'] = pd.Timestamp('0001-01-01 00:00:00') if pd.isna(row['ExpirationDate']) else pd.to_datetime(row['ExpirationDate'], format='%m/%d/%Y %I:%M:%S %p')
            df.loc[index, 'ZipCodes'] = 0 if pd.isna(row['ZipCodes']) else row['ZipCodes']

        for index, row in df.iterrows():
            filtered_row = {col: row[col] for col in columns_to_include}
            filtered_row['file_name'] = file_path  # Add the file name to the row

            FoodTruck.objects.create(**filtered_row)
