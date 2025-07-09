const emailTemplates = {
  // Registration email with QR code
  registration: (userData, qrCodeUrl) => ({
    subject: 'Welcome to Scout - Your Registration is Complete! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Scout</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .qr-section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .qr-code { max-width: 200px; margin: 20px auto; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .user-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #667eea; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Scout!</h1>
            <p>Your registration has been successfully completed</p>
          </div>
          
          <div class="content">
            <h2>Hello ${userData.name},</h2>
            
            <p>Welcome to the Scout community! Your account has been successfully created and you're now part of our duty management system.</p>
            
            <div class="user-info">
              <h3>Your Account Details:</h3>
              <p><strong>User ID:</strong> ${userData._id}</p>
              <p><strong>Name:</strong> ${userData.name}</p>
              <p><strong>Email:</strong> ${userData.email}</p>
              <p><strong>Phone:</strong> ${userData.phoneNumber}</p>
            </div>
            
            <div class="qr-section">
              <h3>📱 Your Personal QR Code</h3>
              <p>Scan this QR code to access your profile and view your duty status:</p>
              <img src="${qrCodeUrl}" alt="Your QR Code" class="qr-code">
              <p><small>Keep this QR code safe - you'll need it to check in and view your profile!</small></p>
            </div>
            
            <h3>🚀 Getting Started:</h3>
            <ul>
              <li>Save your QR code image for easy access</li>
              <li>Use your QR code to check in and out of duty</li>
              <li>Track your duty time and view your progress</li>
              <li>Stay connected with the Scout community</li>
            </ul>
            
            <div style={{ background: '#f0f8ff', padding: 16, borderRadius: 8, margin: '20px 0', border: '1px solid #d6e4ff' }}>
              <h4>🔗 Alternative Access Method</h4>
              <p>If you cannot scan the QR code, you can access your status page using this direct link:</p>
              <div style="{{ 
                background: '#f6ffed', 
                border: '1px solid #b7eb8f', 
                borderRadius: 6, 
                padding: 12, 
                margin: '12px 0',
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                fontSize: '14px'
              }}">
                ${process.env.PUBLIC_BASE_URL || 'http://localhost:3000'}/user/${userData._id}
              </div>
              <p><strong>Simply copy and paste this link in your browser to view your status page.</strong></p>
            </div>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact your administrator.</p>
            
            <p>Best regards,<br>
            <strong>The Scout Team</strong></p>
          </div>
          
          <div class="footer">
            <p>This is an automated message from the Scout Duty Management System.</p>
            <p>© 2024 Scout. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to Scout - Your Registration is Complete!

Hello ${userData.name},

Welcome to the Scout community! Your account has been successfully created and you're now part of our duty management system.

Your Account Details:
- User ID: ${userData._id}
- Name: ${userData.name}
- Email: ${userData.email}
- Phone: ${userData.phoneNumber}

Your Personal QR Code:
A QR code has been attached to this email. Scan this QR code to access your profile and view your duty status.

Alternative Access Method:
If you cannot scan the QR code, use this direct link:
${process.env.PUBLIC_BASE_URL || 'http://localhost:3000'}/user/${userData._id}

Getting Started:
- Save your QR code image for easy access
- Use your QR code to check in and out of duty
- Track your duty time and view your progress
- Stay connected with the Scout community
- Use the direct link if QR scanning is not possible

If you have any questions or need assistance, please don't hesitate to contact your administrator.

Best regards,
The Scout Team

This is an automated message from the Scout Duty Management System.
© 2024 Scout. All rights reserved.
    `
  }),

  // Profile update email
  profileUpdate: (userData, updatedFields) => ({
    subject: 'Your Scout Profile Has Been Updated ✅',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Profile Updated</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .update-section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .field { margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Profile Updated Successfully</h1>
            <p>Your Scout profile has been modified</p>
          </div>
          
          <div class="content">
            <h2>Hello ${userData.name},</h2>
            
            <p>Your Scout profile has been successfully updated by an administrator. Here are the details of the changes made:</p>
            
            <div class="update-section">
              <h3>📝 Updated Information:</h3>
              ${Object.entries(updatedFields).map(([field, value]) => `
                <div class="field">
                  <strong>${field.charAt(0).toUpperCase() + field.slice(1)}:</strong> ${value || 'Not specified'}
                </div>
              `).join('')}
            </div>
            
            <h3>🔍 Current Profile Details:</h3>
            <div class="update-section">
              <p><strong>User ID:</strong> ${userData._id}</p>
              <p><strong>Name:</strong> ${userData.name}</p>
              <p><strong>Email:</strong> ${userData.email}</p>
              <p><strong>Phone:</strong> ${userData.phoneNumber}</p>
              <p><strong>NIC:</strong> ${userData.nic}</p>
            </div>
            
            <p>If you notice any discrepancies or have questions about these changes, please contact your administrator immediately.</p>
            
            <p>Your QR code and login credentials remain unchanged.</p>
            
            <p>Best regards,<br>
            <strong>The Scout Team</strong></p>
          </div>
          
          <div class="footer">
            <p>This is an automated message from the Scout Duty Management System.</p>
            <p>© 2024 Scout. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Your Scout Profile Has Been Updated

Hello ${userData.name},

Your Scout profile has been successfully updated by an administrator. Here are the details of the changes made:

Updated Information:
${Object.entries(updatedFields).map(([field, value]) => `${field.charAt(0).toUpperCase() + field.slice(1)}: ${value || 'Not specified'}`).join('\n')}

Current Profile Details:
- User ID: ${userData._id}
- Name: ${userData.name}
- Email: ${userData.email}
- Phone: ${userData.phoneNumber}
- NIC: ${userData.nic}

If you notice any discrepancies or have questions about these changes, please contact your administrator immediately.

Your QR code and login credentials remain unchanged.

Best regards,
The Scout Team

This is an automated message from the Scout Duty Management System.
© 2024 Scout. All rights reserved.
    `
  }),

  // User deletion email
  userDeletion: (userData, adminEmail) => ({
    subject: 'Your Scout Account Has Been Deactivated ⚠️',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Deactivated</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .warning-section { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .account-info { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Account Deactivated</h1>
            <p>Your Scout account has been permanently removed</p>
          </div>
          
          <div class="content">
            <h2>Hello ${userData.name},</h2>
            
            <div class="warning-section">
              <h3>⚠️ Important Notice</h3>
              <p>Your Scout account has been permanently deactivated and removed from our system by an administrator.</p>
            </div>
            
            <div class="account-info">
              <h3>📋 Account Information:</h3>
              <p><strong>User ID:</strong> ${userData._id}</p>
              <p><strong>Name:</strong> ${userData.name}</p>
              <p><strong>Email:</strong> ${userData.email}</p>
              <p><strong>Phone:</strong> ${userData.phoneNumber}</p>
              <p><strong>NIC:</strong> ${userData.nic}</p>
              <p><strong>Deactivated by:</strong> ${adminEmail}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <h3>🔒 What This Means:</h3>
            <ul>
              <li>You can no longer access the Scout system</li>
              <li>Your QR code is no longer valid</li>
              <li>All your duty records have been removed</li>
              <li>You will not receive any further communications from Scout</li>
            </ul>
            
            <p>If you believe this action was taken in error or have any questions, please contact your administrator immediately.</p>
            
            <p>Thank you for being part of the Scout community.</p>
            
            <p>Best regards,<br>
            <strong>The Scout Team</strong></p>
          </div>
          
          <div class="footer">
            <p>This is an automated message from the Scout Duty Management System.</p>
            <p>© 2024 Scout. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Your Scout Account Has Been Deactivated

Hello ${userData.name},

IMPORTANT NOTICE: Your Scout account has been permanently deactivated and removed from our system by an administrator.

Account Information:
- User ID: ${userData._id}
- Name: ${userData.name}
- Email: ${userData.email}
- Phone: ${userData.phoneNumber}
- NIC: ${userData.nic}
- Deactivated by: ${adminEmail}
- Date: ${new Date().toLocaleDateString()}

What This Means:
- You can no longer access the Scout system
- Your QR code is no longer valid
- All your duty records have been removed
- You will not receive any further communications from Scout

If you believe this action was taken in error or have any questions, please contact your administrator immediately.

Thank you for being part of the Scout community.

Best regards,
The Scout Team

This is an automated message from the Scout Duty Management System.
© 2024 Scout. All rights reserved.
    `
  })
};

module.exports = emailTemplates; 