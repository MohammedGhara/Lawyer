# server/cases/signals.py
from django.contrib.auth import get_user_model
from django.db.models.signals import post_migrate
from django.dispatch import receiver

# ---- change these two lines if you want different credentials ----
DEFAULT_LAWYER_EMAIL = "lawyer@gmail.com"
DEFAULT_LAWYER_PASSWORD = "1234"
# -----------------------------------------------------------------

User = get_user_model()


@receiver(post_migrate)
def create_default_lawyer(sender, **kwargs):
    """
    Create a default lawyer user after migrations, if it doesn't exist.
    Username = email, so we can login with the email string.
    """
    # We search by email OR by username, just in case
    exists = User.objects.filter(
        email=DEFAULT_LAWYER_EMAIL
    ).exists() or User.objects.filter(
        username=DEFAULT_LAWYER_EMAIL
    ).exists()

    if not exists:
        User.objects.create_user(
            username=DEFAULT_LAWYER_EMAIL,   # username = email
            email=DEFAULT_LAWYER_EMAIL,
            password=DEFAULT_LAWYER_PASSWORD,
            is_staff=True,                   # so he can be treated as "lawyer"
        )
        print("✔ Default lawyer created: "
              f"{DEFAULT_LAWYER_EMAIL} / {DEFAULT_LAWYER_PASSWORD}")
