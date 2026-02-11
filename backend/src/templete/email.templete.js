export const verificationEmailTemplete = (verificationCode) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Email</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:20px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:8px; overflow:hidden; border:1px solid #ddd;">
          
          <tr>
            <td style="background-color:#4CAF50; color:#ffffff; text-align:center; padding:20px; font-size:24px; font-weight:bold;">
              Verify Your Email
            </td>
          </tr>

          <tr>
            <td style="padding:25px; color:#333333; font-size:16px; line-height:1.6;">
              <p style="margin:0 0 15px;">Hello,</p>
              <p style="margin:0 0 15px;">Thank you for signing up! Please confirm your email address by entering the code below:</p>

              <div style="margin:20px 0; font-size:22px; color:#4CAF50; background:#e8f5e9; border:1px dashed #4CAF50; padding:12px; text-align:center; border-radius:5px; font-weight:bold; letter-spacing:3px;">
                ${verificationCode}
              </div>

              <p style="margin:0 0 15px;">If you did not create an account, no further action is required.</p>
              <p style="margin:0;">Need help? Contact our support team anytime.</p>
            </td>
          </tr>

          <tr>
            <td style="background-color:#f4f4f4; text-align:center; padding:15px; font-size:12px; color:#777777;">
              &copy; ${new Date().getFullYear()} CProtocol. All rights reserved.
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
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to CProtocol</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:20px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:8px; overflow:hidden; border:1px solid #ddd;">
          
          <tr>
            <td style="background-color:#007BFF; color:#ffffff; text-align:center; padding:20px; font-size:24px; font-weight:bold;">
              Welcome to CProtocol!
            </td>
          </tr>

          <tr>
            <td style="padding:25px; color:#333333; font-size:16px; line-height:1.6;">
              <p style="margin:0 0 15px;">Hello ${name},</p>
              <p style="margin:0 0 15px;">We're excited to have you onboard. Your account has been successfully created.</p>

              <p style="margin:0 0 15px;">Here’s what you can do next:</p>
              <ul style="padding-left:20px; margin:0 0 15px;">
                <li>Set up your profile and security preferences</li>
                <li>Explore secure messaging features</li>
                <li>Connect with your team channels</li>
              </ul>

              <div style="text-align:center; margin:25px 0;">
                <a href="#" style="background-color:#007BFF; color:#ffffff; text-decoration:none; padding:12px 25px; border-radius:5px; font-weight:bold; display:inline-block;">
                  Get Started
                </a>
              </div>

              <p style="margin:0;">If you need assistance, our support team is always here to help.</p>
            </td>
          </tr>

          <tr>
            <td style="background-color:#f4f4f4; text-align:center; padding:15px; font-size:12px; color:#777777;">
              &copy; ${new Date().getFullYear()} CProtocol. All rights reserved.
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
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>New Login Detected</title>
<style>
  body {
    margin: 0;
    padding: 0;
    font-family: Arial, Helvetica, sans-serif;
    background-color: #f4f6f8;
  }
  .container {
    max-width: 600px;
    margin: 30px auto;
    background: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    border: 1px solid #e0e0e0;
  }
  .header {
    background-color: #1e293b;
    color: white;
    text-align: center;
    padding: 20px;
    font-size: 22px;
    font-weight: bold;
  }
  .content {
    padding: 25px;
    color: #333;
    line-height: 1.7;
    font-size: 15px;
  }
  .details {
    background: #f1f5f9;
    border-left: 4px solid #2563eb;
    padding: 12px 15px;
    margin: 20px 0;
    border-radius: 4px;
  }
  .details p {
    margin: 6px 0;
    font-size: 14px;
  }
  .warning {
    color: #b91c1c;
    font-weight: bold;
    margin-top: 15px;
  }
  .button {
    display: inline-block;
    margin: 20px 0;
    padding: 12px 22px;
    background-color: #2563eb;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    font-size: 14px;
    font-weight: bold;
  }
  .footer {
    background-color: #f4f6f8;
    text-align: center;
    padding: 15px;
    font-size: 12px;
    color: #777;
    border-top: 1px solid #e0e0e0;
  }
  @media (max-width: 600px) {
    .content {
      padding: 18px;
    }
    .header {
      font-size: 18px;
    }
  }
</style>
</head>
<body>
  <div class="container">
    <div class="header">New Login Detected</div>
    <div class="content">
      <p>Hello ${name || "User"},</p>
      <p>We detected a new login to your account. If this was you, you can safely ignore this message.</p>

      <div class="details">
        <p><strong>Device:</strong> ${device || "Unknown device"}</p>
        <p><strong>Location:</strong> ${location || "Unknown location"}</p>
        <p><strong>Time:</strong> ${time || new Date().toLocaleString()}</p>
      </div>

      <p class="warning">If this wasn’t you, please secure your account immediately.</p>

      <a href="#" class="button">Review Account Activity</a>

      <p>For security reasons, we recommend changing your password if you don’t recognize this login.</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} CProtocol Security System. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

