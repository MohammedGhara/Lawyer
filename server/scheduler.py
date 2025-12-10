# cases/scheduler.py
import threading
import time
from django.core.management import call_command

_scheduler_started = False  


def _run_scheduler():
    while True:
        try:
            print("[Scheduler] Running send_appointment_reminders...")
            call_command("send_appointment_reminders")
        except Exception as e:
            print("[Scheduler] Error:", e)

        time.sleep(60)


def start_scheduler():
    global _scheduler_started
    if _scheduler_started:
        return 

    _scheduler_started = True
    t = threading.Thread(target=_run_scheduler, daemon=True)
    t.start()
    print("[Scheduler] Appointment reminder scheduler started")
