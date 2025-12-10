from django.db import models
from django.utils import timezone


class Case(models.Model):
    """
    מייצג תיק משפטי שנפתח על ידי עובד.
    כולל פרטי עובד, סוג פניה, מסמכים, פרטי צ'אט,
    וסטטוס התקדמות הטיפול.
    """

    CLAIM_TYPES = [
        ('dismissal', 'פיטורים שלא כדין'),
        ('salary', 'אי תשלום שכר / הלנת שכר'),
        ('overtime', 'שעות נוספות'),
        ('rights', 'פגיעה בזכויות סוציאליות'),
    ]

    STATUS_CHOICES = [
        ('new', 'חדש'),
        ('in_review', 'בבדיקה'),
        ('closed', 'נסגר'),
    ]

    # פרטי עובד
    client_name = models.CharField(max_length=255)
    client_id_number = models.CharField(max_length=20)
    phone = models.CharField(max_length=30)
    email = models.EmailField()

    # סוג הפנייה (לא חובה - ניתן להשתמש ב-legal_domain במקום)
    claim_type = models.CharField(max_length=20, choices=CLAIM_TYPES, blank=True, null=True)

    # תחום משפטי (קישור לתחום שהוגדר על ידי מנהל)
    legal_domain = models.ForeignKey(
        'LegalDomain',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cases',
        help_text="התחום המשפטי שנבחר בטופס - משמש לטעינת הודעות בוט"
    )

    # נתונים שנאספים מהצ'אט
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    last_salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    had_hearing = models.BooleanField(default=False)     # האם נערך שימוע
    has_contract = models.BooleanField(default=False)    # האם יש חוזה (ממסמכים)

    notes_from_chatbot = models.TextField(blank=True)    # סיכום שיחה אוטומטי

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client_name} - {self.get_claim_type_display()}"


class CaseDocument(models.Model):
    """
    מסמך שמעלה העובד עבור תיק מסוים – חוזה,
    תלושי שכר, מכתב פיטורים, מסמך נוסף וכו'.
    """

    DOC_TYPES = [
        ('contract', 'חוזה עבודה'),
        ('pay_slip', 'תלוש שכר'),
        ('termination_letter', 'מכתב פיטורים/התפטרות'),
        ('other', 'אחר'),
    ]

    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='documents')
    file = models.FileField(upload_to='case_documents/')
    document_type = models.CharField(max_length=30, choices=DOC_TYPES)

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Document for case #{self.case_id} ({self.document_type})"


class Appointment(models.Model):
    """
    פגישה בין העובד לבין עורך הדין.
    העובד מבקש מועד – עורך הדין מאשר/דוחה/מציע זמן חדש.
    """

    STATUS_CHOICES = [
        ('pending', 'ממתין לאישור'),
        ('approved', 'אושר'),
        ('rejected', 'נדחה'),
        ('suggested', 'הוצע מועד חדש'),
    ]

    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='appointments')

    # המועד שהעובד ביקש
    requested_datetime = models.DateTimeField()

    # המועד שעורך הדין אישר (אם יש)
    approved_datetime = models.DateTimeField(null=True, blank=True)

    # סטטוס הפגישה
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    created_at = models.DateTimeField(auto_now_add=True)
    reminder_sent = models.BooleanField(default=False)
    def __str__(self):
        return f"Appointment for case #{self.case_id} - {self.status}"

class LegalDomain(models.Model):
    """
    תחום משפטי + מקור מידע עיקרי בווב (מאגר).
    למשל: שם: דיני עבודה, source_url: https://www.kolzchut.org.il/...
    """
    name = models.CharField(max_length=200, unique=True)        # דיני עבודה, תאונות דרכים...
    description = models.TextField(blank=True)                  # תיאור קצר, אופציונלי
    source_url = models.URLField(max_length=1000, help_text="כתובת אתר של מאגר הידע")  # Increased to 1000 for long URLs
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Legal domain"
        verbose_name_plural = "Legal domains"

    def __str__(self):
        return self.name

class BotMessage(models.Model):
    domain = models.ForeignKey(
        LegalDomain,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    title = models.CharField(max_length=200, blank=True)  # כותרת פנימית / תיאור קצר
    text = models.TextField()  # תוכן ההודעה שהצ'אטבוט ישתמש בו
    order = models.PositiveIntegerField(default=1)  # סדר ההודעה בתסריט
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.domain.name} – {self.title or self.text[:30]}"


class WhatsAppMessage(models.Model):
    """
    שמירת הודעות WhatsApp בין עורך הדין ללקוח.
    """
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name='whatsapp_messages',
        help_text="התיק הקשור לשיחה"
    )
    
    # פרטי ההודעה
    message_id = models.CharField(max_length=255, unique=True, help_text="ID ייחודי של ההודעה מ-WhatsApp")
    from_number = models.CharField(max_length=30, help_text="מספר השולח")
    to_number = models.CharField(max_length=30, help_text="מספר הנמען")
    message_text = models.TextField(help_text="תוכן ההודעה")
    is_from_lawyer = models.BooleanField(default=False, help_text="האם ההודעה נשלחה מעורך הדין")
    timestamp = models.DateTimeField(help_text="זמן שליחת ההודעה")
    
    # מטא-דאטה
    message_type = models.CharField(
        max_length=20,
        default='text',
        help_text="סוג ההודעה (text, image, document, etc.)"
    )
    has_media = models.BooleanField(default=False)
    media_url = models.URLField(blank=True, null=True, help_text="קישור למדיה אם יש")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp', '-created_at']
        indexes = [
            models.Index(fields=['case', '-timestamp']),
            models.Index(fields=['from_number', '-timestamp']),
        ]
    
    def __str__(self):
        direction = "←" if self.is_from_lawyer else "→"
        return f"{direction} {self.case.client_name} - {self.message_text[:50]}"