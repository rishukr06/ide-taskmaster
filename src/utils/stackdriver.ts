import { ConfigurationOptions } from '@google-cloud/error-reporting/build/src/configuration'

const { ErrorReporting } = require('@google-cloud/error-reporting');

const errors = new ErrorReporting(
  (options => {
    Object.keys(options)
      .forEach(key =>
        (!options[key] && options[key] === undefined) &&
        delete options[key]
      );

    return options
  })(<ConfigurationOptions>{
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    reportMode: "production"
  })
);

export = {
  reportError: (error: Error) => {
    errors.report(error);
  }
}
