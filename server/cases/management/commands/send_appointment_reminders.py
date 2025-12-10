from datetime import timedelta
from django.utils import timezone
from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from cases.models import Appointment


class Command(BaseCommand):
    help = "Send email reminders 24 hours before approved appointments"

    def handle(self, *args, **options):
        now = timezone.now()
        in_24_hours = now + timedelta(hours=24)

        appointments = Appointment.objects.filter(
            approved_datetime__isnull=False,
            approved_datetime__gt=now,
            approved_datetime__lte=in_24_hours,
            status="approved",
            reminder_sent=False,  
        ).select_related("case")

        for appt in appointments:
            client = appt.case
            client_email = client.email
            if not client_email:
                continue

            date_str = timezone.localtime(appt.approved_datetime).strftime("%d/%m/%Y %H:%M")

            print(f"Sending reminder to {client_email} for appointment #{appt.id}")

            send_mail(
                subject="תזכורת לפגישה עם עורך הדין",
                message=(
                    f"שלום {client.client_name},\n\n"
                    f"זוהי תזכורת לפגישה שנקבעה עבורך עם עורך הדין.\n"
                    f"מועד הפגישה: {date_str}\n\n"
                    f"בברכה,\nמשרד עורך הדין"
                ),
                from_email=None,
                recipient_list=[client_email],
                fail_silently=False,
            )

            appt.reminder_sent = True   
            appt.save()

            print("Reminder sent!")
