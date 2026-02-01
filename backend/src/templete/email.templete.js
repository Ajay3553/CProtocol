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
