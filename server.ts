import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { OAuth2Client } from "google-auth-library";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

const ADMIN_EMAIL = "selene.jimenez.id@gmail.com";

// Helper to construct Google OAuth2 Client
function getOAuth2Client(req: express.Request) {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers["x-forwarded-host"] || req.get("host");
  const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.OAUTH_CLIENT_ID || process.env.CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.OAUTH_CLIENT_SECRET || process.env.CLIENT_SECRET;

  return {
    client: new OAuth2Client(clientId, clientSecret, redirectUri),
    redirectUri,
    clientId,
    clientSecret,
  };
}

// Endpoint to check Google OAuth configuration status
app.get("/api/auth/google/config", (req, res) => {
  const { clientId } = getOAuth2Client(req);
  res.json({
    configured: !!clientId,
    adminEmail: ADMIN_EMAIL,
  });
});

// Endpoint to initiate Google OAuth Login
app.get("/api/auth/google/login", (req, res) => {
  const { client, clientId } = getOAuth2Client(req);

  if (!clientId) {
    return res.status(500).send("Google OAuth Client ID no está configurado en las variables de entorno.");
  }

  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "openid",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile"
    ],
    prompt: "select_account"
  });

  res.redirect(authUrl);
});

// Callback endpoint for Google OAuth
app.get("/api/auth/google/callback", async (req, res) => {
  const code = req.query.code as string;
  const error = req.query.error as string;

  if (error || !code) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 40px;">
          <h3>Autenticación Cancelada</h3>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: 'El inicio de sesión fue cancelado o denegado.' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
        </body>
      </html>
    `);
  }

  try {
    const { client } = getOAuth2Client(req);
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    let userEmail = "";

    if (tokens.id_token) {
      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
      });
      const payload = ticket.getPayload();
      userEmail = payload?.email || "";
    } else if (tokens.access_token) {
      const oauth2Res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const userInfo = await oauth2Res.json();
      userEmail = userInfo.email || "";
    }

    if (userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      return res.send(`
        <!DOCTYPE html>
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 40px; color: #15803d;">
            <h2>¡Autenticación Exitosa!</h2>
            <p>Bienvenida administradora (${userEmail}). Cerrando ventana...</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', email: '${userEmail}' }, '*');
                setTimeout(() => window.close(), 1000);
              } else {
                window.location.href = '/';
              }
            </script>
          </body>
        </html>
      `);
    } else {
      return res.send(`
        <!DOCTYPE html>
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 40px; color: #b91c1c;">
            <h2>Acceso Denegado</h2>
            <p>La cuenta <strong>${userEmail}</strong> no está autorizada como administradora.</p>
            <p>Solo la cuenta <strong>${ADMIN_EMAIL}</strong> puede reiniciar los intentos de la demo.</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'GOOGLE_AUTH_ERROR', 
                  error: 'Acceso denegado: La cuenta ' + ${JSON.stringify(userEmail)} + ' no tiene permisos de administradora. Inicia sesión con la cuenta oficial.' 
                }, '*');
                setTimeout(() => window.close(), 3000);
              }
            </script>
          </body>
        </html>
      `);
    }
  } catch (err: any) {
    console.error("OAuth Token Exchange Error:", err);
    return res.send(`
      <!DOCTYPE html>
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 40px; color: #b91c1c;">
          <h3>Error en Autenticación</h3>
          <p>${err.message || "No se pudo completar el inicio de sesión con Google."}</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: 'Error al verificar con Google: ' + ${JSON.stringify(err.message || 'Error desconocido')} }, '*');
              setTimeout(() => window.close(), 2500);
            }
          </script>
        </body>
      </html>
    `);
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
