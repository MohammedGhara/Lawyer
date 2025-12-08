from django.urls import path, include
from rest_framework.routers import DefaultRouter   # 👈 مهم
from .views import ChatbotAPIView

from .views import (
    CaseCreateAPIView,
    CaseListAPIView,
    CaseDetailAPIView,
    CaseChatSummaryAPIView,
    CaseDocumentUploadAPIView,
    CaseDocumentDeleteAPIView,
    CaseAppointmentsAPIView,

    AppointmentCreateAPIView,
    AppointmentListAPIView,
    AppointmentApproveAPIView,
    AppointmentRejectAPIView,
    AppointmentSuggestAPIView,
    CaseStatusUpdateAPIView,
    lawyer_login,
    LegalDomainViewSet,
    BotMessageViewSet,
)

router = DefaultRouter()
router.register(r"domains", LegalDomainViewSet, basename="legal-domain")
router.register(r"bot-messages", BotMessageViewSet, basename="bot-message")

urlpatterns = [
    # ----- תיקים -----
    path('cases/', CaseCreateAPIView.as_view(), name='case-create'),
    path('cases/list/', CaseListAPIView.as_view(), name='case-list'),
    path('cases/<int:pk>/', CaseDetailAPIView.as_view(), name='case-detail'),
    path('cases/<int:case_id>/chat/', CaseChatSummaryAPIView.as_view(), name='case-chat-summary'),
    path('cases/<int:case_id>/documents/', CaseDocumentUploadAPIView.as_view(), name='case-documents-upload'),
    path('documents/<int:document_id>/', CaseDocumentDeleteAPIView.as_view(), name='case-document-delete'),
    path("chatbot/", ChatbotAPIView.as_view(), name="chatbot"),

    path('cases/<int:pk>/status/', CaseStatusUpdateAPIView.as_view(), name='case-status-update'),

    # פגישות לפי תיק (צד עובד)
    path('cases/<int:case_id>/appointments/', CaseAppointmentsAPIView.as_view(), name='case-appointments'),
    path("lawyer/login/", lawyer_login),

    # ----- פגישות (צד עו״ד) -----
    path('appointments/', AppointmentCreateAPIView.as_view(), name='appointment-create'),
    path('appointments/list/', AppointmentListAPIView.as_view(), name='appointment-list'),
    path('appointments/<int:appointment_id>/approve/', AppointmentApproveAPIView.as_view(), name='appointment-approve'),
    path('appointments/<int:appointment_id>/reject/', AppointmentRejectAPIView.as_view(), name='appointment-reject'),
    path('appointments/<int:appointment_id>/suggest/', AppointmentSuggestAPIView.as_view(), name='appointment-suggest'),

    # ----- תחומים + מאגרי ידע -----
    path("", include(router.urls)),   # זה מוסיף /api/domains/ וכו'
]
