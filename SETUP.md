# Monthly Plan setup

## 1. Supabase

1. Create a Supabase project.
2. Open **SQL Editor** and run `supabase-schema.sql`.
3. Open **Authentication > Providers > Email** and enable email login.
4. Open **Project Settings > API** and copy the Project URL and anon key.
5. Put those two public values into `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `index.html`.
6. Add your own email under **Authentication > Users** if you want to restrict access to an existing account.

The dashboard uses email magic links. Project status changes and uploads require an authenticated session.

## 2. Google Apps Script

1. Open [script.google.com](https://script.google.com) and create a project.
2. Copy the contents of `apps-script/Code.gs` into the Apps Script editor.
3. Open **Project Settings > Script properties** and add:
   - `SUPABASE_URL`: Supabase Project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase service-role key
   - `NOTIFICATION_EMAIL`: email address that receives new order notifications
4. Deploy as **Web app**.
5. Set **Execute as** to yourself and **Who has access** to anyone.
6. Copy the Web app URL.

Keep the service-role key only in Script Properties. Never put it in `index.html` or the public portfolio repository.

## 3. Portfolio form

Replace the Formspree action with the Apps Script Web app URL and use a normal HTML `POST` form. Use these field names:

```html
<form action="YOUR_APPS_SCRIPT_WEB_APP_URL" method="post">
  <input name="name" required>
  <input name="email" type="email">
  <input name="whatsapp">
  <select name="service" required></select>
  <textarea name="details" required></textarea>
  <input name="preferred_deadline" type="date">
  <button type="submit">Send Message</button>
</form>
```

The Apps Script endpoint saves the order to Supabase and sends the notification email. The existing Formspree endpoint is no longer part of this flow.

## 4. Portfolio results

The portfolio can query the `projects` table with the public anon key and show rows where:

- `published = true`
- `status = 'done'`
- `result_url` is not empty

The Monthly Plan upload button stores the image in the `project-results` bucket, marks the project as done, and sets `published` to true.
