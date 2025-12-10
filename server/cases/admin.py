from django.contrib import admin
from .models import Case, CaseDocument, Appointment, LegalDomain, BotMessage, WhatsAppMessage

admin.site.register(Case)
admin.site.register(CaseDocument)
admin.site.register(Appointment)
admin.site.register(LegalDomain)
admin.site.register(BotMessage)

@admin.register(WhatsAppMessage)
class WhatsAppMessageAdmin(admin.ModelAdmin):
    list_display = ['case', 'is_from_lawyer', 'message_text_short', 'timestamp', 'created_at']
    list_filter = ['is_from_lawyer', 'message_type', 'timestamp', 'case']
    search_fields = ['message_text', 'case__client_name', 'from_number', 'to_number']
    readonly_fields = ['message_id', 'created_at']
    date_hierarchy = 'timestamp'
    
    def message_text_short(self, obj):
        return obj.message_text[:50] + "..." if len(obj.message_text) > 50 else obj.message_text
    message_text_short.short_description = "Message"
