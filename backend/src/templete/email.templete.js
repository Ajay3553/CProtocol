export const verificationEmailTemplete = (verificationCode) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Email – CProtocol</title>
</head>
<body style="margin:0; padding:0; background-color:#f0edf6; font-family:'Segoe UI', Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0edf6; padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(109,40,217,0.10); border:1px solid #e9e3f5;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding:36px 32px; text-align:center;">
              <div style="font-size:28px; font-weight:800; color:#ffffff; letter-spacing:-0.5px;">
                🔐 CProtocol
              </div>
              <div style="color:#e9d5ff; font-size:14px; margin-top:6px; letter-spacing:0.5px; text-transform:uppercase;">
                Email Verification
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 36px 28px; color:#1e1b2e;">
              <p style="margin:0 0 12px; font-size:16px; color:#4b5563;">Hello,</p>
              <p style="margin:0 0 24px; font-size:15px; color:#4b5563; line-height:1.7;">
                Thank you for joining <strong style="color:#7c3aed;">CProtocol</strong>. To activate your account, please enter the verification code below:
              </p>

              <!-- OTP Box -->
              <div style="margin:28px 0; text-align:center;">
                <div style="display:inline-block; background:linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border:2px dashed #7c3aed; border-radius:12px; padding:20px 40px;">
                  <div style="font-size:36px; font-weight:900; color:#7c3aed; letter-spacing:10px; font-family:'Courier New', monospace;">
                    ${verificationCode}
                  </div>
                  <div style="font-size:12px; color:#9ca3af; margin-top:8px; letter-spacing:0.3px;">
                    This code expires in <strong>10 minutes</strong>
                  </div>
                </div>
              </div>

              <p style="margin:0 0 12px; font-size:14px; color:#6b7280; line-height:1.7;">
                If you did not create a CProtocol account, you can safely ignore this email.
              </p>
              <p style="margin:0; font-size:14px; color:#6b7280;">
                Need help? Reply to this email or contact our support team.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 36px;">
              <div style="height:1px; background:linear-gradient(90deg, transparent, #e9d5ff, transparent);"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px; text-align:center; background:#faf9ff;">
              <p style="margin:0 0 6px; font-size:12px; color:#9ca3af;">
                🛡️ This is an automated security email from CProtocol. Do not reply.
              </p>
              <p style="margin:0; font-size:12px; color:#c4b5fd;">
                &copy; ${new Date().getFullYear()} CProtocol. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;


export const welcomeEmailTemplete = (name) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to CProtocol</title>
</head>
<body style="margin:0; padding:0; background-color:#f0edf6; font-family:'Segoe UI', Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0edf6; padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(109,40,217,0.10); border:1px solid #e9e3f5;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding:36px 32px; text-align:center;">
              <div style="font-size:40px; margin-bottom:8px;">🎉</div>
              <div style="font-size:26px; font-weight:800; color:#ffffff; letter-spacing:-0.5px;">
                Welcome to CProtocol!
              </div>
              <div style="color:#e9d5ff; font-size:14px; margin-top:6px;">
                Your account is ready to go
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 36px 28px; color:#1e1b2e;">
              <p style="margin:0 0 12px; font-size:16px; color:#4b5563;">
                Hello <strong style="color:#7c3aed;">${name}</strong> 👋
              </p>
              <p style="margin:0 0 24px; font-size:15px; color:#4b5563; line-height:1.7;">
                We're thrilled to have you on board. Your CProtocol account is now fully verified and ready to use. Here's what you can do next:
              </p>

              <!-- Feature cards -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="padding:12px 16px; background:#f5f3ff; border-radius:10px; margin-bottom:10px; border-left:4px solid #7c3aed;">
                    <div style="display:block; margin-bottom:16px;">
                      <span style="font-size:18px;">💬</span>
                      <strong style="color:#5b21b6; font-size:14px; margin-left:8px;">Join or Create Channels</strong>
                      <p style="margin:4px 0 0 26px; font-size:13px; color:#6b7280;">Group channels and private 1:1 conversations</p>
                    </div>
                    <div style="display:block; margin-bottom:16px;">
                      <span style="font-size:18px;">⏱️</span>
                      <strong style="color:#5b21b6; font-size:14px; margin-left:8px;">Self-Destructing Messages</strong>
                      <p style="margin:4px 0 0 26px; font-size:13px; color:#6b7280;">Set TTL on messages — they auto-vanish after expiry</p>
                    </div>
                    <div style="display:block;">
                      <span style="font-size:18px;">🛡️</span>
                      <strong style="color:#5b21b6; font-size:14px; margin-left:8px;">Role-Based Access Control</strong>
                      <p style="margin:4px 0 0 26px; font-size:13px; color:#6b7280;">Granular permissions for Admin, Operations, Agent & Observer</p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <div style="text-align:center; margin:28px 0 20px;">
                <a href="#" style="display:inline-block; background:linear-gradient(135deg, #7c3aed, #a855f7); color:#ffffff; text-decoration:none; padding:14px 36px; border-radius:8px; font-size:15px; font-weight:700; letter-spacing:0.3px; box-shadow:0 4px 14px rgba(124,58,237,0.4);">
                  Open CProtocol →
                </a>
              </div>

              <p style="margin:0; font-size:13px; color:#9ca3af; text-align:center;">
                If you need any help, our support team is always available.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 36px;">
              <div style="height:1px; background:linear-gradient(90deg, transparent, #e9d5ff, transparent);"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px; text-align:center; background:#faf9ff;">
              <p style="margin:0 0 6px; font-size:12px; color:#9ca3af;">
                You're receiving this because you just signed up for CProtocol.
              </p>
              <p style="margin:0; font-size:12px; color:#c4b5fd;">
                &copy; ${new Date().getFullYear()} CProtocol. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;


export const Login_Alert_Email_Template = (name, device, location, time) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Login Detected – CProtocol</title>
</head>
<body style="margin:0; padding:0; background-color:#f0edf6; font-family:'Segoe UI', Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0edf6; padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(109,40,217,0.10); border:1px solid #e9e3f5;">

          <!-- Header — red warning tone -->
          <tr>
            <td style="background:linear-gradient(135deg, #1e1b2e 0%, #3b1f6b 100%); padding:36px 32px; text-align:center;">
              <div style="font-size:36px; margin-bottom:8px;">🔔</div>
              <div style="font-size:24px; font-weight:800; color:#ffffff; letter-spacing:-0.5px;">
                New Login Detected
              </div>
              <div style="color:#c4b5fd; font-size:13px; margin-top:6px; text-transform:uppercase; letter-spacing:0.5px;">
                CProtocol Security Alert
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 36px 28px; color:#1e1b2e;">
              <p style="margin:0 0 12px; font-size:15px; color:#4b5563;">
                Hello <strong style="color:#7c3aed;">${name || 'User'}</strong>,
              </p>
              <p style="margin:0 0 24px; font-size:15px; color:#4b5563; line-height:1.7;">
                We detected a new login to your CProtocol account. If this was you, no action is needed.
              </p>

              <!-- Login Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px; background:#f5f3ff; border-radius:12px; border:1px solid #e9d5ff; overflow:hidden;">
                <tr>
                  <td style="padding:16px 20px; border-bottom:1px solid #ede9fe;">
                    <span style="font-size:13px; color:#6b7280; display:block; margin-bottom:2px; text-transform:uppercase; letter-spacing:0.5px;">Device</span>
                    <span style="font-size:14px; color:#1e1b2e; font-weight:600;">💻 ${device || 'Unknown device'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px; border-bottom:1px solid #ede9fe;">
                    <span style="font-size:13px; color:#6b7280; display:block; margin-bottom:2px; text-transform:uppercase; letter-spacing:0.5px;">Location</span>
                    <span style="font-size:14px; color:#1e1b2e; font-weight:600;">📍 ${location || 'Unknown location'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;">
                    <span style="font-size:13px; color:#6b7280; display:block; margin-bottom:2px; text-transform:uppercase; letter-spacing:0.5px;">Time</span>
                    <span style="font-size:14px; color:#1e1b2e; font-weight:600;">🕐 ${time || new Date().toLocaleString()}</span>
                  </td>
                </tr>
              </table>

              <!-- Warning Banner -->
              <div style="background:#fff1f2; border:1px solid #fecdd3; border-radius:10px; padding:14px 18px; margin-bottom:24px;">
                <p style="margin:0; font-size:14px; color:#be123c; font-weight:600;">
                  ⚠️ If this wasn't you, please change your password immediately.
                </p>
              </div>

              <!-- CTA -->
              <div style="text-align:center; margin-bottom:8px;">
                <a href="#" style="display:inline-block; background:linear-gradient(135deg, #7c3aed, #a855f7); color:#ffffff; text-decoration:none; padding:13px 32px; border-radius:8px; font-size:14px; font-weight:700; box-shadow:0 4px 14px rgba(124,58,237,0.35);">
                  Review Account Activity →
                </a>
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 36px;">
              <div style="height:1px; background:linear-gradient(90deg, transparent, #e9d5ff, transparent);"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px; text-align:center; background:#faf9ff;">
              <p style="margin:0 0 6px; font-size:12px; color:#9ca3af;">
                🛡️ This is an automated security alert from CProtocol. Do not reply.
              </p>
              <p style="margin:0; font-size:12px; color:#c4b5fd;">
                &copy; ${new Date().getFullYear()} CProtocol Security System. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;