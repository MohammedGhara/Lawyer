from rest_framework import serializers
from .models import Case, CaseDocument, Appointment


class CaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Case
        fields = [
            'id',
            'client_name',
            'client_id_number',
            'phone',
            'email',
            'claim_type',
            'start_date',
            'end_date',
            'last_salary',
            'had_hearing',
            'has_contract',
            'notes_from_chatbot',
            'status',
            'created_at',
        ]
        read_only_fields = ['id', 'status', 'notes_from_chatbot', 'created_at']


class CaseDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseDocument
        fields = ['id', 'case', 'file', 'document_type', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


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
