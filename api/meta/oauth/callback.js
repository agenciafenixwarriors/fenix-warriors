export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const error = req.query?.error;
  const errorDescription = req.query?.error_description;
  const code = req.query?.code;

  if (error) {
    return res.status(400).send(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fênix Social Publisher</title><body style="font-family:system-ui;background:#0b0b0d;color:#fff;padding:32px"><h1>Autorização não concluída</h1><p>${escapeHtml(errorDescription || String(error))}</p><p>Você pode fechar esta janela e tentar novamente pelo FÊNIX OS.</p></body></html>`);
  }

  if (!code) {
    return res.status(200).send('<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fênix Social Publisher</title><body style="font-family:system-ui;background:#0b0b0d;color:#fff;padding:32px"><h1>FÊNIX Social Publisher</h1><p>Endpoint OAuth ativo. Use o fluxo de conexão do Instagram para autorizar a conta.</p></body></html>');
  }

  // The authorization code is deliberately not exposed or logged.
  // Token exchange will be enabled in the server-side connection flow after
  // Meta app review/business login configuration is finalized.
  return res.status(200).send('<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fênix Social Publisher</title><body style="font-family:system-ui;background:#0b0b0d;color:#fff;padding:32px"><h1>Autorização recebida</h1><p>O Instagram retornou a autorização ao FÊNIX OS com segurança.</p><p>Você pode fechar esta janela e retornar ao sistema.</p></body></html>');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'\"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}
