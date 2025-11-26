from django.urls import path
from .views import (
    CaseCreateAPIView,
    CaseListAPIView,
    CaseDetailAPIView,
    CaseChatSummaryAPIView,
    CaseDocumentUploadAPIView,
    CaseAppointmentsAPIView,

    AppointmentCreateAPIView,
    AppointmentListAPIView,
    AppointmentApproveAPIView,
    AppointmentRejectAPIView,
    AppointmentSuggestAPIView,
    CaseStatusUpdateAPIView,
    lawyer_login,
    
)

urlpatterns = [
    # ----- תיקים -----
    path('cases/', CaseCreateAPIView.as_view(), name='case-create'),
    path('cases/list/', CaseListAPIView.as_view(), name='case-list'),
    path('cases/<int:pk>/', CaseDetailAPIView.as_view(), name='case-detail'),
    path('cases/<int:case_id>/chat/', CaseChatSummaryAPIView.as_view(), name='case-chat-summary'),
    path('cases/<int:case_id>/documents/', CaseDocumentUploadAPIView.as_view(), name='case-documents-upload'),

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
]
