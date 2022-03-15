require('dotenv').config();
const { GoogleSpreadsheet } = require('google-spreadsheet');
exports.handler = async (event) => {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID);
  try {
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const data = JSON.parse(event.body);
    const name = data.payload.data.name;
    const email = data.payload.data.email;
    const message = data.payload.data.message;
    const newRow = [name, email, message];
    await sheet.addRow(newRow);
    const response = {
      statusCode: 200,
      body: 'Thank you, your subscription has been completed!',
    };
    return response;
  } catch (err) {
    console.error(err);
    const response = {
      statusCode: 500,
      body: 'Error, maybe the problem will be resolved later',
    };
    return response;
  }
};
