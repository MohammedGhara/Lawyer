from django.apps import AppConfig


class CasesConfig(AppConfig):
  default_auto_field = "django.db.models.BigAutoField"
  name = "cases"

  def ready(self):
      import cases.signals
      try:
          from .scheduler import start_scheduler
          start_scheduler()
      except Exception as e:
          print("[CasesConfig.ready] Failed to start scheduler:", e)