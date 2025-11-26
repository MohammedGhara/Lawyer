from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils.dateparse import parse_datetime
from django.shortcuts import get_object_or_404
from rest_framework import permissions
from .models import Case, CaseDocument, Appointment
from .serializers import (
    CaseSerializer,
    CaseDocumentSerializer,
    AppointmentSerializer,
)

# -------------------------------------------------------
# 🔵 תיקים
# -------------------------------------------------------


class CaseCreateAPIView(generics.CreateAPIView):
    """ יצירת תיק חדש מהטופס הראשוני """
    queryset = Case.objects.all()
    serializer_class = CaseSerializer


class CaseListAPIView(generics.ListAPIView):
    """ רשימת התיקים – לדשבורד עו״ד """
    queryset = Case.objects.all().order_by('-created_at')
    serializer_class = CaseSerializer


class CaseDetailAPIView(generics.RetrieveAPIView):
    """ שליפת תיק לפי ID """
    queryset = Case.objects.all()
    serializer_class = CaseSerializer


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
    """ העלאת PDF לתיק קיים """
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, case_id):
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

        serializer = CaseDocumentSerializer(created_docs, many=True)
        return Response(serializer.data, status=201)


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
            # אם לא התקבל תאריך חדש – נאשר לפי הזמן שביקש העובד
            if appt.requested_datetime:
                appt.approved_datetime = appt.requested_datetime

        appt.status = "approved"
        appt.save()

        return Response(AppointmentSerializer(appt).data, status=200)


class AppointmentRejectAPIView(APIView):
    """
    עו״ד דוחה פגישה (בלי מועד חדש).
    אם את לא משתמשת בזה – זה פשוט קובע סטטוס rejected.
    """

    def post(self, request, appointment_id):
        try:
            appt = Appointment.objects.get(pk=appointment_id)
        except Appointment.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        appt.status = "rejected"
        appt.save()

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

        return Response(AppointmentSerializer(appt).data, status=200)
