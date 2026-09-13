function doPost(e) {
  try {
    const data = e.postData && e.postData.contents
      ? JSON.parse(e.postData.contents)
      : e.parameter;
    const project = {
      client_name: String(data.name || '').trim(),
      email: String(data.email || '').trim(),
      whatsapp: String(data.whatsapp || '').trim(),
      service: String(data.service || 'Other').trim(),
      details: String(data.details || '').trim(),
      deadline: data.preferred_deadline || null
    };

    if (!project.client_name || !project.details) {
      return jsonResponse({ ok: false, error: 'Name and project details are required.' }, 400);
    }

    insertProject(project);
    MailApp.sendEmail({
      to: PropertiesService.getScriptProperties().getProperty('NOTIFICATION_EMAIL'),
      subject: 'Pesanan desain baru: ' + project.service,
      htmlBody: '<strong>' + escapeHtml(project.client_name) + '</strong><br>' +
        'Email: ' + escapeHtml(project.email) + '<br>' +
        'WhatsApp: ' + escapeHtml(project.whatsapp) + '<br>' +
        'Layanan: ' + escapeHtml(project.service) + '<br><br>' +
        escapeHtml(project.details)
    });

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message }, 500);
  }
}

function insertProject(project) {
  const properties = PropertiesService.getScriptProperties();
  const supabaseUrl = properties.getProperty('SUPABASE_URL');
  const serviceRoleKey = properties.getProperty('SUPABASE_SERVICE_ROLE_KEY');
  const response = UrlFetchApp.fetch(supabaseUrl + '/rest/v1/projects', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      apikey: serviceRoleKey,
      Authorization: 'Bearer ' + serviceRoleKey,
      Prefer: 'return=minimal'
    },
    payload: JSON.stringify(project),
    muteHttpExceptions: true
  });

  if (response.getResponseCode() >= 300) {
    throw new Error('Supabase rejected the project: ' + response.getContentText());
  }
}

function jsonResponse(body, status) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, function (character) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character];
  });
}
