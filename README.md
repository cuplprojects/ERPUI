# ApexERP Project

## Overview
ApexERP is a comprehensive Enterprise Resource Planning system designed to streamline business operations and enhance productivity.

## Key Features
- Modular architecture for scalability
- Real-time data analytics
- Integrated workflow management
- Multi-user collaboration tools
- Customizable dashboards

## Technology Stack
- Frontend: React with Vite
- Backend: Node.js
- Database: PostgreSQL
- State Management: Zustand
- UI Framework: Ant Design

## Google Sheet Reference
For detailed project planning and documentation, please refer to our [Google Sheet](https://docs.google.com/spreadsheets/d/1YajPg5hwe0ow8eHWkJlVeO5g7RX93A3zy9A3Cl6khts/edit?gid=747833457#gid=747833457).



# Vite Project Build and Deploy Instructions

To successfully build and deploy the ApexERP project using Vite, please follow these steps:

1. Configuration:
   - Open the `vite.config.js` file.
   - Locate the `outDir` setting and update it to point to the shared folder:
     `//192.168.1.24/e/hosted apps/ApexERP`

2. Access Permissions:
   - Ensure you have the necessary permissions to access and write to the shared folder.
   - If you encounter any issues, please contact your system administrator.

3. Build and Deploy:
   - Open your terminal or command prompt.
   - Navigate to the project directory.
   - Run the following command to build and deploy the project:
     ```
     npm run build -- --emptyOutDir
     ```
   - This command will create a production-ready build and place it in the specified shared folder.

4. Accessing the Application:
   - Once the build process is complete, you can access the application through your web browser.
   - Enter the following URL: `http://192.168.1.24:85`

If you encounter any issues during this process, please refer to the project documentation or contact the development team for assistance.
