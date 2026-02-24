import pandas as pd

INPUT_XLSX = r"D:\Work\Madrasa System\madrasa-management\sample_docs\Staff Details 2026.xlsx"
OUTPUT_CSV = "lecturer.csv"

df = pd.read_excel(INPUT_XLSX, sheet_name=0)

rename_map = {
    "Admission No:": "admission_no",
    "Full Name": "full_name",
    "Name With Initial": "name_with_initial",
    "Date of Birth": "date_of_birth",
    "N.I.C. No:": "nic_no",
    "Address": "address",
    "Distric": "district",
    "City": "city",
    "Mobile No:": "mobile",
    "WhatsApp No:": "whatsapp",
    "Date of Appointment": "date_of_appointment",
    "Your Age on Date of Appointment": "age_at_appointment",
    "Appointment Post": "appointment_post",
    "Graduation Madrasa": "madrasa_name",
    "Madrasa Address": "madrasa_address",
    "Passed out Year": "passed_out_year",
    "Certificate No": "certificate_no",
    "Other Skills": "other_skills",
}
df = df.rename(columns=rename_map)

# Parse dates (your sheet shows formats like 17.03.1984 and 2009.10.05) [file:1]
for c in ["date_of_birth", "date_of_appointment"]:
    if c in df.columns:
        df[c] = pd.to_datetime(df[c], errors="coerce", dayfirst=True).dt.date

out_cols = [
    "admission_no","full_name","name_with_initial","date_of_birth","nic_no",
    "address","district","city","mobile","whatsapp","date_of_appointment",
    "age_at_appointment","appointment_post","madrasa_name","madrasa_address",
    "passed_out_year","certificate_no","other_skills","remarks","signature_name",
    "old_id","user_id"
]
for c in out_cols:
    if c not in df.columns:
        df[c] = None

df[out_cols].to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")
print("Wrote", OUTPUT_CSV)
