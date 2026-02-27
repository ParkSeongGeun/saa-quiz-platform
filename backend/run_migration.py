#!/usr/bin/env python3
"""
Run database migration to update selected_label column
"""
import pymysql
import sys

# Try multiple credential combinations
credentials = [
    ("admin", "phd03280530"),
    ("admin", "phd03280530@"),
    ("saauser", "qwer1234"),  # From .env file
]
db_name = "saa_db"
host = "127.0.0.1"
port = 3307

migration_sql = """
ALTER TABLE user_answers
MODIFY COLUMN selected_label VARCHAR(50) NOT NULL;
"""

verify_sql = "DESCRIBE user_answers;"

success = False
for user, password in credentials:
    try:
        print(f"Attempting connection with user: {user}...")
        connection = pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=db_name,
            charset='utf8mb4'
        )

        with connection.cursor() as cursor:
            # Run migration
            print("Running migration...")
            cursor.execute(migration_sql)
            connection.commit()
            print("✓ Migration executed successfully!")

            # Verify the change
            print("\nVerifying schema change:")
            cursor.execute(verify_sql)
            for row in cursor.fetchall():
                print(row)

        connection.close()
        success = True
        break

    except pymysql.err.OperationalError as e:
        print(f"✗ Connection failed with this password: {e}")
        continue
    except Exception as e:
        print(f"✗ Error: {e}")
        sys.exit(1)

if not success:
    print("\n✗ All connection attempts failed. Please check credentials.")
    sys.exit(1)
else:
    print("\n✅ Migration completed successfully!")
