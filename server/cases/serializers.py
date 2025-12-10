from rest_framework import serializers
from .models import Case, CaseDocument, Appointment, LegalDomain, WhatsAppMessage


class CaseDocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = CaseDocument
        fields = ['id', 'case', 'file', 'file_url', 'document_type', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at', 'file_url']
    
    def get_file_url(self, obj):
        """Return the full URL for the document file"""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            # Fallback if no request context
            return f"http://127.0.0.1:8000{obj.file.url}"
        return None


class CaseSerializer(serializers.ModelSerializer):
    # Optional: Show domain name in read operations
    legal_domain_name = serializers.CharField(source='legal_domain.name', read_only=True)
    # Include documents in the case serializer
    documents = CaseDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = Case
        fields = [
            'id',
            'client_name',
            'client_id_number',
            'phone',
            'email',
            'claim_type',
            'legal_domain',
            'legal_domain_name',  # Read-only field for convenience
            'start_date',
            'end_date',
            'last_salary',
            'had_hearing',
            'has_contract',
            'notes_from_chatbot',
            'status',
            'created_at',
            'documents',  # Include documents
        ]
        read_only_fields = ['id', 'status', 'notes_from_chatbot', 'created_at', 'legal_domain_name', 'documents']


class AppointmentSerializer(serializers.ModelSerializer):
    # חשוב: ה־case נקבע ע"י ה־view (לפי ה־case_id ב־URL),
    # ולכן הוא read_only ולא חובה בבקשה מהלקוח.
    case = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id',
            'case',
            'requested_datetime',
            'approved_datetime',
            'status',
            'created_at',
        ]
        read_only_fields = ['id', 'status', 'created_at']

from .models import LegalDomain

class LegalDomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = LegalDomain
        fields = "__all__"

# cases/serializers.py
from .models import BotMessage

class BotMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = BotMessage
        fields = [
            "id",
            "domain",
            "title",
            "text",
            "order",
            "is_active",
            "created_at",
            "updated_at",
        ]

class WhatsAppMessageSerializer(serializers.ModelSerializer):
    case_client_name = serializers.CharField(source='case.client_name', read_only=True)
    
    class Meta:
        model = WhatsAppMessage
        fields = [
            'id',
            'case',
            'case_client_name',
            'message_id',
            'from_number',
            'to_number',
            'message_text',
            'is_from_lawyer',
            'timestamp',
            'message_type',
            'has_media',
            'media_url',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'case': {'required': False}  # Case will be set by the view
        }
