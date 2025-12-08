from django.contrib import admin
from .models import Case, CaseDocument, Appointment, LegalDomain, BotMessage

admin.site.register(Case)
admin.site.register(CaseDocument)
admin.site.register(Appointment)
admin.site.register(LegalDomain)
admin.site.register(BotMessage)
