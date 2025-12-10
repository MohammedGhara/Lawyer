from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils.dateparse import parse_datetime
from django.shortcuts import get_object_or_404
from rest_framework import permissions
from rest_framework.decorators import api_view
from rest_framework import viewsets
from django.core.mail import send_mail
from .ai_service import ask_ai
from django.utils.timezone import localtime

from .models import Case, CaseDocument, Appointment, LegalDomain, WhatsAppMessage
from .serializers import (
    CaseSerializer,
    CaseDocumentSerializer,
    AppointmentSerializer,
    LegalDomainSerializer,
    WhatsAppMessageSerializer,
)

# -------------------------------------------------------
# 🔵 תיקים
# -------------------------------------------------------

from django.shortcuts import get_object_or_404
from rest_framework import permissions
LAWYER_PASSWORD = "1234"   # 👈 you can change here in the future

@api_view(["POST"])
def lawyer_login(request):
    password = (request.data.get("password") or "").strip()

    if password == LAWYER_PASSWORD:
        return Response({"ok": True})

    return Response({"ok": False, "detail": "wrong password"}, status=400)
class CaseStatusUpdateAPIView(APIView):
    """
    PATCH /api/cases/<case_id>/status/
    עורך הדין משנה סטטוס תיק: new / in_review / closed
    payload: {"status": "in_review"}
    """

    permission_classes = [permissions.AllowAny]  # אפשר להקשיח בהמשך

    def patch(self, request, case_id):
        case = get_object_or_404(Case, pk=case_id)
        new_status = (request.data.get("status") or "").strip()

        valid_statuses = dict(Case.STATUS_CHOICES).keys()
        if new_status not in valid_statuses:
            return Response(
                {"detail": f"סטטוס לא חוקי. הערכים האפשריים: {', '.join(valid_statuses)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        case.status = new_status
        case.save(update_fields=["status"])

        return Response(CaseSerializer(case).data, status=status.HTTP_200_OK)
        
from rest_framework import generics

class CaseCreateAPIView(generics.ListCreateAPIView):
    """
    GET  /api/cases/   → يرجّع قائمة بكل التّيكيم (cases)
    POST /api/cases/   → ينشئ תיק جديد
    """
    queryset = Case.objects.all().order_by("-created_at")
    serializer_class = CaseSerializer
    
    def get_serializer_context(self):
        """Add request to serializer context for building absolute URLs"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    
class CaseStatusUpdateAPIView(APIView):
    """
    PATCH /api/cases/<pk>/status/
    גוף הבקשה: {"status": "new" | "in_review" | "closed"}
    """

    def patch(self, request, pk):
        # למצוא את התיק
        try:
            case = Case.objects.get(pk=pk)
        except Case.DoesNotExist:
            return Response({"detail": "Case not found"}, status=404)

        # לקרוא את הסטטוס החדש מה־JSON
        new_status = (request.data.get("status") or "").strip()

        # לוודא שהסטטוס חוקי לפי המודל
        valid_statuses = {code for code, _ in Case.STATUS_CHOICES}
        if new_status not in valid_statuses:
            return Response(
                {"detail": "Invalid status value"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # לשמור ולעדכן
        case.status = new_status
        case.save()

        return Response(CaseSerializer(case).data, status=status.HTTP_200_OK)

class CaseListAPIView(generics.ListAPIView):
    """ רשימת התיקים – לדשבורד עו״ד """
    queryset = Case.objects.all().order_by('-created_at')
    serializer_class = CaseSerializer
    
    def get_serializer_context(self):
        """Add request to serializer context for building absolute URLs"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class CaseDetailAPIView(generics.RetrieveAPIView):
    """ שליפת תיק לפי ID """
    queryset = Case.objects.all()
    serializer_class = CaseSerializer
    
    def get_serializer_context(self):
        """Add request to serializer context for building absolute URLs"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class CaseChatSummaryAPIView(APIView):
    """ שמירת סיכום הצ'אט לתיק """

    def post(self, request, case_id):
        try:
            case = Case.objects.get(pk=case_id)
        except Case.DoesNotExist:
            return Response({"detail": "Case not found"}, status=404)

        summary = request.data.get("summary", "").strip()
        if not summary:
            return Response({"detail": "Summary is required"}, status=400)

        case.notes_from_chatbot = summary
        case.save()

        return Response({"detail": "Summary saved"}, status=200)


class CaseDocumentUploadAPIView(APIView):
    """ העלאת PDF לתיק קיים + שליפת מסמכים """
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, case_id):
        """ GET /api/cases/<case_id>/documents/ - שליפת כל המסמכים של תיק """
        try:
            case = Case.objects.get(pk=case_id)
        except Case.DoesNotExist:
            return Response({"detail": "Case not found"}, status=404)

        documents = CaseDocument.objects.filter(case=case).order_by('-uploaded_at')
        serializer = CaseDocumentSerializer(documents, many=True, context={'request': request})
        return Response(serializer.data, status=200)

    def post(self, request, case_id):
        """ POST /api/cases/<case_id>/documents/ - העלאת מסמכים """
        try:
            case = Case.objects.get(pk=case_id)
        except Case.DoesNotExist:
            return Response({"detail": "Case not found"}, status=404)

        created_docs = []

        # חוזה
        contract = request.FILES.get('contract')
        if contract:
            created_docs.append(
                CaseDocument.objects.create(
                    case=case, file=contract, document_type='contract'
                )
            )

        # תלושים
        for f in request.FILES.getlist('payslips'):
            created_docs.append(
                CaseDocument.objects.create(
                    case=case, file=f, document_type='pay_slip'
                )
            )

        # מסמכים אחרים
        for f in request.FILES.getlist('other_documents'):
            created_docs.append(
                CaseDocument.objects.create(
                    case=case, file=f, document_type='other'
                )
            )

        serializer = CaseDocumentSerializer(created_docs, many=True, context={'request': request})
        return Response(serializer.data, status=201)


class CaseDocumentDeleteAPIView(APIView):
    """ מחיקת מסמך """
    
    def delete(self, request, document_id):
        """ DELETE /api/documents/<document_id>/ - מחיקת מסמך """
        try:
            document = CaseDocument.objects.get(pk=document_id)
        except CaseDocument.DoesNotExist:
            return Response({"detail": "Document not found"}, status=404)
        
        # Delete the file from storage
        if document.file:
            document.file.delete(save=False)
        
        # Delete the document record
        document.delete()
        
        return Response({"detail": "Document deleted successfully"}, status=200)


class CaseAppointmentsAPIView(APIView):
    """
    GET  /api/cases/<case_id>/appointments/
    POST /api/cases/<case_id>/appointments/
    """

    def get(self, request, case_id):
        qs = Appointment.objects.filter(case_id=case_id).order_by("-created_at")
        serializer = AppointmentSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request, case_id):
        # יצירת פגישה חדשה לעובד עבור תיק מסוים
        try:
            case = Case.objects.get(pk=case_id)
        except Case.DoesNotExist:
            return Response({"detail": "Case not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = AppointmentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        appt = serializer.save(case=case, status="pending")
        return Response(AppointmentSerializer(appt).data, status=status.HTTP_201_CREATED)


# -------------------------------------------------------
# 🔵 פגישות – צד עו״ד
# -------------------------------------------------------


class AppointmentCreateAPIView(generics.CreateAPIView):
    """
    יצירת פגישה (לא חובה להשתמש – אנחנו עובדים בעיקר דרך CaseAppointmentsAPIView).
    """
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer


class AppointmentListAPIView(generics.ListAPIView):
    """
    עורך הדין רואה את כל הפגישות (לצורך הדשבורד).
    """
    queryset = Appointment.objects.all().order_by('-created_at')
    serializer_class = AppointmentSerializer


class AppointmentApproveAPIView(APIView):
    """
    עו״ד מאשר פגישה.
    אם לא מתקבל approved_datetime – נשתמש ב-requested_datetime.
    """

    def post(self, request, appointment_id):
        try:
            appt = Appointment.objects.get(pk=appointment_id)
        except Appointment.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        approved_str = request.data.get("approved_datetime", "").strip()

        if approved_str:
            dt = parse_datetime(approved_str)
            if not dt:
                return Response(
                    {"detail": "approved_datetime must be ISO 8601"},
                    status=400,
                )
            appt.approved_datetime = dt
        else:
            if appt.requested_datetime:
                appt.approved_datetime = appt.requested_datetime

        appt.status = "approved"
        appt.save()

        local_dt = localtime(appt.approved_datetime)
        date_str = local_dt.strftime("%d/%m/%Y %H:%M")

        send_mail(
            "אישור פגישה – משרד עורכי דין",
            f"""לכבוד הלקוח/ה,

ברצוננו להודיעך כי הפגישה אשר נקבעה במסגרת הטיפול בתיקך
אושרה על ידי עורך הדין.

פרטי הפגישה:
תאריך ושעה: {date_str}
במידה ויש צורך בעדכון נוסף או בשאלה כלשהי,
נשמח לעמוד לרשותך.

בברכה,
משרד עורכי דין
""",
            None,
            [appt.case.email],
            fail_silently=False,
        )

        return Response(AppointmentSerializer(appt).data, status=200)


class AppointmentRejectAPIView(APIView):
    """
    עו״ד דוחה פגישה (בלי מועד חדש).
    """

    def post(self, request, appointment_id):
        try:
            appt = Appointment.objects.get(pk=appointment_id)
        except Appointment.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        appt.status = "rejected"
        appt.save()

        # ✅ שליחת אימייל מקצועי
        send_mail(
            "עדכון בנוגע לבקשת הפגישה – משרד עורכי דין",
            """לכבוד הלקוח/ה,

לאחר בחינת בקשתך, לצערנו לא ניתן לאשר את מועד הפגישה המבוקש.
ניתן להגיש בקשה חדשה למועד אחר דרך המערכת בכל עת.

לכל שאלה נוספת, אנו עומדים לרשותך.

בברכה,
משרד עורכי דין
""",
            None,
            [appt.case.email],
            fail_silently=False,
        )

        return Response(AppointmentSerializer(appt).data, status=200)


class AppointmentSuggestAPIView(APIView):
    """
    עו״ד מציע מועד חדש (status = suggested).
    כאן חייבים לקבל suggested_datetime.
    """

    def post(self, request, appointment_id):
        try:
            appt = Appointment.objects.get(pk=appointment_id)
        except Appointment.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        suggested_str = request.data.get("suggested_datetime", "").strip()
        if not suggested_str:
            return Response(
                {"detail": "suggested_datetime required"},
                status=400,
            )

        dt = parse_datetime(suggested_str)
        if not dt:
            return Response(
                {"detail": "suggested_datetime must be ISO 8601"},
                status=400,
            )

        appt.status = "suggested"
        appt.approved_datetime = dt
        appt.save()
        local_dt = localtime(dt)
        date_str = local_dt.strftime("%d/%m/%Y %H:%M")
        send_mail(
            "הצעת מועד חדש לפגישה – משרד עורכי דין",
            f"""לכבוד הלקוח/ה,

בהמשך לבקשתך לקביעת פגישה, עורך הדין הציע מועד חדש לפגישה.

פרטי המועד המוצע:
תאריך ושעה: {date_str}
אנא התחבר/י למערכת על מנת לאשר או לדחות את המועד.

בברכה,
משרד עורכי דין
""",
            None,
            [appt.case.email],
            fail_silently=False,
        )

        return Response(AppointmentSerializer(appt).data, status=200)

    
class LegalDomainViewSet(viewsets.ModelViewSet):
    """
    ניהול תחומים משפטיים + מאגר מידע לכל תחום.
    GET    /api/domains/
    POST   /api/domains/
    PATCH  /api/domains/<id>/
    DELETE /api/domains/<id>/
    """
    queryset = LegalDomain.objects.all().order_by("name")
    serializer_class = LegalDomainSerializer
    permission_classes = [permissions.AllowAny]  # אפשר להקשיח לסיסמת עו״ד

# cases/views.py
from rest_framework import viewsets
from .models import BotMessage
from .serializers import BotMessageSerializer

class BotMessageViewSet(viewsets.ModelViewSet):
    """
    CRUD על הודעות צ'אט לכל תחום.
    אפשר לסנן לפי ?domain=<id>
    """
    queryset = BotMessage.objects.all()
    serializer_class = BotMessageSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        domain_id = self.request.query_params.get("domain")
        if domain_id:
            qs = qs.filter(domain_id=domain_id)
        return qs


class ChatbotAPIView(APIView):
    def post(self, request):
        messages = request.data.get("messages")

        if not messages:
            return Response(
                {"detail": "messages is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            result = ask_ai(messages) 
            return Response(result, status=200)
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=500
            )


# -------------------------------------------------------
# 🔵 WhatsApp Messages
# -------------------------------------------------------

class WhatsAppMessageListCreateAPIView(APIView):
    """
    POST /api/whatsapp/messages/ - Save a WhatsApp message (called by Node.js service)
    GET  /api/whatsapp/messages/?case_id=<id> - Get messages for a case
    """
    permission_classes = [permissions.AllowAny]  # Node.js service needs access
    
    def post(self, request):
        """Save a WhatsApp message from the Node.js service"""
        try:
            case_id = request.data.get('case_id')
            if not case_id:
                return Response(
                    {"detail": "case_id is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            case = get_object_or_404(Case, pk=case_id)
            
            # Check if message already exists (prevent duplicates)
            message_id = request.data.get('message_id')
            if message_id:
                existing = WhatsAppMessage.objects.filter(message_id=message_id).first()
                if existing:
                    return Response(
                        WhatsAppMessageSerializer(existing).data,
                        status=status.HTTP_200_OK
                    )
            
            serializer = WhatsAppMessageSerializer(data=request.data)
            if serializer.is_valid():
                # Save with case (view sets it, not from request data)
                serializer.save(case=case)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            # Return detailed validation errors
            return Response(
                {"detail": "Validation error", "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get(self, request):
        """Get WhatsApp messages for a case"""
        case_id = request.query_params.get('case_id')
        if not case_id:
            return Response(
                {"detail": "case_id query parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            case = get_object_or_404(Case, pk=case_id)
            messages = WhatsAppMessage.objects.filter(case=case).order_by('timestamp', 'created_at')
            serializer = WhatsAppMessageSerializer(messages, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CaseWhatsAppMessagesAPIView(APIView):
    """
    GET /api/cases/<case_id>/whatsapp/ - Get all WhatsApp messages for a case
    """
    def get(self, request, case_id):
        try:
            case = get_object_or_404(Case, pk=case_id)
            messages = WhatsAppMessage.objects.filter(case=case).order_by('timestamp', 'created_at')
            serializer = WhatsAppMessageSerializer(messages, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
