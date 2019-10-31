const { ErrorReporting } = require('@google-cloud/error-reporting');
const errors = new ErrorReporting({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

export = {
  reportError: (error: Error) => {
    errors.report(error);
  }
}
