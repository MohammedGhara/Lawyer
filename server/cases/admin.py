from django.contrib import admin
from .models import Case, CaseDocument, Appointment

admin.site.register(Case)
admin.site.register(CaseDocument)
admin.site.register(Appointment)
