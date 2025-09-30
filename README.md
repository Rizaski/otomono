# Jersey Orders Management System

A comprehensive admin panel for managing jersey orders with customer detail collection and automated notifications.

## Features

### Admin Panel
- **Order Management**: Create, view, and manage jersey orders
- **Statistics Dashboard**: Real-time statistics for total, pending, approved, and rejected orders
- **Order Filtering**: Filter orders by status and search functionality
- **Customer Link Generation**: Generate unique links for customers to submit jersey details
- **Order Approval Workflow**: Approve or reject orders with automated notifications
- **Notification System**: Send email/SMS notifications to customers

### Customer Interface
- **Detail Collection Form**: Customers can submit jersey specifications including:
  - Size (XS to XXXL)
  - Color (Red, Blue, Green, Yellow, Black, White, Purple, Orange, Pink, Gray, Navy)
  - Type (Home, Away, Training, Goalkeeper, Warm-up)
  - Design (Plain, Stripes, Checks, Custom Logo, Numbered, V-neck, Collar)
  - Additional details and special requirements

### Key Features
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful gradient design with smooth animations
- **Data Persistence**: Uses localStorage for data storage (can be easily replaced with a real database)
- **Unique Link System**: Each order gets a unique URL for customer detail collection
- **Automated Notifications**: Auto-send notifications on order approval/rejection
- **Real-time Updates**: Statistics and order lists update in real-time

## File Structure

```
Jersey/
├── index.html              # Main admin panel
├── styles.css              # Admin panel styles
├── script.js               # Admin panel functionality
├── customer.html           # Customer detail collection page
├── customer-styles.css     # Customer page styles
├── customer-script.js      # Customer page functionality
└── README.md              # This documentation
```

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server setup required - runs entirely in the browser

### Installation
1. Download all files to a directory
2. Open `index.html` in your web browser
3. Start creating and managing jersey orders!

## Usage

### Admin Panel Workflow

1. **Create New Order**
   - Click "Add New Order" button
   - Fill in customer details (name, email, phone, quantity, special instructions)
   - Submit to create the order

2. **Generate Customer Link**
   - View order details
   - Click "Generate Customer Link" to create a unique URL
   - Share this link with the customer

3. **Customer Submits Details**
   - Customer clicks the link and fills out jersey specifications
   - Details are automatically saved to the order

4. **Review and Approve**
   - View order details to see customer specifications
   - Approve or reject the order
   - Automated notifications are sent to the customer

### Customer Workflow

1. **Receive Link**
   - Customer receives unique link from admin
   - Link format: `customer.html?order=ORD-123456&action=details`

2. **Submit Details**
   - Customer fills out jersey specifications for each jersey
   - All required fields must be completed
   - Additional details can be provided for special requirements

3. **Confirmation**
   - Customer receives confirmation that details were submitted
   - Admin is notified of the submission

## Technical Details

### Data Storage
- Uses browser localStorage for data persistence
- Orders are stored as JSON objects with the following structure:
```javascript
{
  id: "ORD-1234567890-ABC12",
  customerName: "John Doe",
  customerEmail: "john@example.com",
  customerPhone: "+1234567890",
  jerseyQuantity: 2,
  specialInstructions: "Rush order",
  status: "pending", // pending, details_submitted, approved, rejected
  createdDate: "2024-01-01T12:00:00.000Z",
  customerDetails: [
    {
      size: "L",
      color: "Blue",
      type: "Home Jersey",
      design: "Stripes",
      additionalDetails: "Player name: Smith, Number: 10"
    }
  ],
  uniqueLink: "http://localhost/customer.html?order=ORD-1234567890-ABC12&action=details",
  notifications: [
    {
      id: "NOTIF-1234567890-ABC12",
      type: "email",
      message: "Your order has been approved...",
      sentDate: "2024-01-01T12:30:00.000Z",
      status: "sent"
    }
  ]
}
```

### Notification System
- Simulated email/SMS notifications
- Auto-generated messages for different order states
- Manual notification sending with custom messages
- Notification history tracking

### Security Considerations
- Client-side only application
- No server-side validation
- Suitable for demonstration and small-scale use
- For production use, implement proper server-side security

## Customization

### Adding New Jersey Options
Edit the `generateJerseyDetailsForm()` function in `customer-script.js` to add:
- New sizes
- New colors
- New types
- New designs

### Styling Customization
- Modify `styles.css` for admin panel styling
- Modify `customer-styles.css` for customer page styling
- All colors and styling can be customized through CSS variables

### Adding New Order Statuses
1. Update the status filter options in `index.html`
2. Add new status badge styles in `styles.css`
3. Update the status handling logic in `script.js`

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Future Enhancements

### Potential Improvements
1. **Database Integration**: Replace localStorage with a real database
2. **User Authentication**: Add login system for admin access
3. **Email Integration**: Connect with real email services (SendGrid, Mailgun)
4. **SMS Integration**: Connect with SMS services (Twilio, AWS SNS)
5. **File Uploads**: Allow customers to upload custom designs
6. **Order Tracking**: Add order tracking numbers and status updates
7. **Bulk Operations**: Support for bulk order management
8. **Export Features**: Export orders to CSV/Excel
9. **Analytics**: Add order analytics and reporting
10. **Multi-language Support**: Internationalization

### Production Deployment
1. Set up a web server (Apache, Nginx, or Node.js)
2. Implement server-side API endpoints
3. Add database integration (MySQL, PostgreSQL, MongoDB)
4. Implement proper authentication and authorization
5. Add input validation and sanitization
6. Set up SSL/HTTPS
7. Configure email and SMS services
8. Add logging and monitoring

## Support

For questions or issues:
1. Check the browser console for JavaScript errors
2. Ensure all files are in the same directory
3. Verify browser compatibility
4. Check localStorage is enabled in your browser

## License

This project is open source and available under the MIT License.

---

**Note**: This is a demonstration application. For production use, implement proper security measures, server-side validation, and database integration.
