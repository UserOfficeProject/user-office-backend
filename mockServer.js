import fs from 'fs';

import { logger } from '@user-office-software/duo-logger';
import { mockServerClient } from 'mockserver-client';
// import { start_mockserver, stop_mockserver } from 'mockserver-node';
async function mockserver() {
  const isTestingMode = process.env.NODE_ENV === 'test';
  // await stop_mockserver({
  //   serverPort: 1080,
  // }).then(logger.logInfo('server stopped', {}));
  // logger.logInfo('About to start mockserver');
  // await start_mockserver({
  //   serverPort: 1080,
  //   //verbose: true,
  //   trace: true,
  // }).then(logger.logInfo('server running', {}));
  logger.logInfo('MockServer File testing');

  if (isTestingMode) {
    logger.logInfo('MockServer File testing, should not');
    await mockServerClient('172.17.0.1', 1080)
      .mockAnyResponse({
        httpRequest: {
          path: '/ws/UserOfficeWebService',
        },
        // times: {
        //   unlimited: true,
        // },
        // timeToLive: {
        //   unlimited: true,
        // },
        httpOverrideForwardedRequest: {
          httpRequest: {
            path: '/ws/UserOfficeWebService',
            headers: {
              Host: ['devapis.facilities.rl.ac.uk'],
            },
          },
        },
      })
      .then(
        function () {
          logger.logInfo('expectation created, mockserver!', {});
        },
        function (error) {
          logger.logInfo('error, catch block', error);
        }
      );
  }
  if (!isTestingMode) {
    logger.logInfo('MockServer File testing in if sTATEMENT');
    var callback = function (request) {
      if (request.method === 'POST') {
        logger.logInfo('testing thsi log statement');
        const name = String(request.body.xml);
        //maybe have responses for each role have seperate folders for those files
        //somehow get role name folders based on those roles and navigate to that folder to get that response
        //if name contains getDetailsfromsessId remove local storage ans set new local storage? local storage can be role?
        //request will sessID so we can if statement 3 sessID set and remove local storage with role?
        let regexp = '<tns:(.*?)>';
        const test = name.match(regexp);
        const method = test[1];
        logger.logInfo(
          'the method name is:' + name + test + 'yo ' + method,
          {}
        );

        if (
          name.includes('getBasicPersonDetailsFromUserNumber') ||
          name.includes('getSearchableBasicPeopleDetailsFromUserNumbers')
        ) {
          let calls = '';
          name.includes('getSearchableBasicPeopleDetailsFromUserNumbers')
            ? (calls = '<UserNumbers>(.*?)<')
            : (calls = '<UserNumber>(.*?)<');
          const match = name.match(calls);
          logger.logInfo('match is' + match[1], {});

          const file = JSON.parse(
            fs.readFileSync(
              'responses/user/' + method + match[1] + '.txt',
              'utf8'
            )
          );
          //const test = JSON.parse(file);
          const request1 = file.body.xml;

          return {
            body: request1,
          };
        }
        const file = JSON.parse(
          fs.readFileSync('responses/user/' + method + '.txt', 'utf8')
        );
        //const test = JSON.parse(file);
        const request1 = file.body.xml;

        return {
          body: request1,
        };
        // if (
        //   String(request.body.xml).includes('getPersonDetailsFromSessionId')
        // ) {
        //   const name = String(request.body.xml);
        //   let regexp = '<tns:(.*?)>';
        //   const test = name.match(regexp);
        //   const method = test[1];
        //   logger.logInfo(
        //     'the method name is:' + name + test + 'yo ' + method,
        //     {}
        //   );
        //   const file = JSON.parse(
        //     fs.readFileSync('C: Users wdo36736 Desktop testing.txt', 'utf8')
        //   );
        //   //const test = JSON.parse(file);
        //   const request1 = file.httpResponse.body.xml;
        //   return {
        //     body: request1,
        //   };
        // } else if (String(request.body.xml).includes('getRolesForUser')) {
        //   const name = String(request.body.xml);
        //   let regexp = '<tns:(.*?)>';
        //   const test = name.match(regexp);
        //   const method = test[1];
        //   logger.logInfo(
        //     'the method name is:' + name + test + 'yo' + method,
        //     {}
        //   );
        //   const file = JSON.parse(fs.readFileSync('roles.txt', 'utf8'));
        //   //const test = JSON.parse(file);
        //   const request1 = file.body.xml;
        //   return {
        //     body: request1,
        //   };
        // } else if (
        //   String(request.body.xml).includes(
        //     'getBasicPersonDetailsFromUserNumber'
        //   )
        // ) {
        //   const name = String(request.body.xml);
        //   let regexp = '<tns:(.*?)>';
        //   const test = name.match(regexp);
        //   const method = test[1];
        //   logger.logInfo(
        //     'the method name is:' + name + test + 'yo' + method,
        //     {}
        //   );
        //   const file = JSON.parse(fs.readFileSync('userNumber.txt', 'utf8'));
        //   //const test = JSON.parse(file);
        //   const request1 = file.body.xml;
        //   return {
        //     body: request1,
        //   };
        // } else if (String(request.body.xml).includes('isTokenValid')) {
        //   const name = String(request.body.xml);
        //   let regexp = '<tns:(.*?)>';
        //   const test = name.match(regexp);
        //   const method = test[1];
        //   logger.logInfo('the method name isp:' + test, {});
        //   const file = JSON.parse(fs.readFileSync('valid.txt'));
        //   //const test = JSON.parse(file);
        //   const request1 = file.body.xml;
        //   return {
        //     body: request1,
        //   };
        // } else {
        //   return {
        //     statusCode: 401,
        //   };
        // }
      }
    };
    mockServerClient('172.17.0.1', 1080)
      .mockWithCallback(
        {
          method: 'POST',
          path: '/ws/UserOfficeWebService',
        },
        callback,
        {
          unlimited: true,
        }
      )
      .then(
        function () {
          logger.logInfo('expectation created, callabck', {});
        },
        function (error) {
          logger.logInfo('error callback', {});
        }
      );

    mockServerClient('172.17.0.1', 1080)
      .mockAnyResponse({
        httpRequest: {
          method: 'GET',
          path: '/ws/UserOfficeWebService',
        },
        times: {
          unlimited: true,
        },
        timeToLive: {
          unlimited: true,
        },
        httpOverrideForwardedRequest: {
          httpRequest: {
            path: '/ws/UserOfficeWebService',
            headers: {
              Host: ['devapis.facilities.rl.ac.uk'],
            },
          },
        },
      })
      .then(
        function () {
          logger.logInfo('expectation created, mock any response', {});
        },
        function (error) {
          logger.logInfo('error mock any response', {});
        }
      );
  }
}
export { mockserver };
