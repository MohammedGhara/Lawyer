import schedule
import time
import os
import sys
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "server.settings")
django.setup()

def run_reminders():
    print("Running reminder task...")
    os.system(f"{sys.executable} manage.py send_appointment_reminders")

schedule.every(1).minutes.do(run_reminders)

print("Reminder scheduler started! Checking every 1 min...")

while True:
    schedule.run_pending()
    time.sleep(1)
