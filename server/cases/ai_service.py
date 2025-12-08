import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """
אתה עוזר משפטי חכם הפועל אך ורק על פי חוקי מדינת ישראל.

כל תשובה שלך חייבת להיות בפורמט JSON תקני בלבד:
{
  "reply": "טקסט תשובה",
  "options": ["אפשרות 1", "אפשרות 2", "אפשרות 3"]
}

אם אין צורך באפשרויות – החזר מערך ריק:
"options": []

אסור לך:
- להמציא חוקים
- להסתמך על דין זר
- לעודד פעולה בלתי חוקית

תחומי מענה מותרים:
דיני עבודה, משפחה, נזיקין, חוזים, צרכנות, ביטוח לאומי, תאונות עבודה, הוצאה לפועל.

המטרות שלך:
1. לשאול שאלות חכמות על המקרה.
2. להציע תשובות לבחירה כאשר אפשר (כפתורים).
3. להמליץ אילו מסמכים לאסוף.
4. להכין סיכום מקצועי לעו״ד.
5. להציע בסוף שליחת סיכום לעורך הדין.

אם אין שאלת המשך – החזר options ריק.
"""


import json

def ask_ai(messages):
    user_text = messages[-1]["content"]

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            *messages
        ],
        temperature=0.2,
    )

    raw = response.choices[0].message.content

    try:
        data = json.loads(raw)
        return data  # { reply: "...", options: [...] }
    except:
        return {
            "reply": raw,
            "options": []
        }

