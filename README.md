# Google Home

The app for managing Propuskator access points through Google Home app.

## Configuration

### Steps to create and configure project

Further: \<hostname\> - a host name of the server where the app should be launched

1) Create a new project as described here(with optional steps): https://github.com/actions-on-google/smart-home-nodejs#create-and-set-up-project-in-actions-console
2) Generate and download JSON file with credentials as described here: https://github.com/actions-on-google/smart-home-nodejs#add-request-sync-and-report-state
3) Rename this file to "smart-home-key.json" and move to composer/system/google-home/config/google/smart-home-key.json. 
**Important**: create this directory structure if it doesn't exist.
4) Navigate to https://console.actions.google.com/ and choose created project
5) From the top menu under "Develop", click "Invocation"(left nav)
6) Enter the display name for your action(it will be displayed in the Google Home app): ![Configure invocation](/docs/screenshots/configure-invocation.png)
7) From the top menu under "Develop", click "Actions"(left nav)
8) Enter the URL for fulfillment(has the form "https://\<hostname\>/api/v1/smarthome/fulfillment") and click "Save": 
![Configure actions](/docs/screenshots/configure-actions.png)
9) From the top menu under "Develop", click "Account linking"(left nav)
10) Generate client ID and client secret for your action, enter "Client ID", "Client secret", "Authorization URL" and
"Token URL" and click "Save": ![Configure account linking](/docs/screenshots/configure-account-linking.png)
Fields description:
    - **Authorization URL** - has the next form "https://\<hostname\>/smarthome/api/v1/oauth/login"
    - **Token URL** - has the next form "https://\<hostname\>/smarthome/api/v1/oauth/token"
11) Set the next environment variables to .env file:
    - **GOOGLE_PROJECT_ID** - a Google project ID, you can retrieve this value from the URL: 
    "https://console.actions.google.com/project/\<project-id\>/actions/smarthome", where "project-id" is what you need
    - **GOOGLE_CLIENT_ID** - a Google client ID you entered when configure "Account linking"
    - **GOOGLE_CLIENT_SECRET** - a Google client secret you entered when configure "Account linking"

### Adding access to new users

If you want to add access to a user so he can test the action using Google Home app, follow the next instruction:

1) Navigate to https://console.cloud.google.com/iam-admin/ and choose your project
3) Click "Add" button: ![IAM add participant](/docs/screenshots/iam-add-participant.png)
4) Enter user email and choose appropriate role("owner" for example)
5) Navigate to https://console.actions.google.com/ under added email and choose your project
6) Go to the "Test" tab and start the testing if it is not already started:
![Configure start testing](/docs/screenshots/configure-start-testing.png)
7) Open Google Home app on a smartphone under added email and start test the integration

## Launching

You need to have host that is open to the world, it is easy to use Ngrok for this task:
```shell
ngrok http 80
```

Then copy https URL and set for the "API_URL" env for the google-home service in docker-compose.yml file.
And change this URL in project console:
- "Develop" tab -> "Actions" -> "Fulfillment URL"
- "Develop" tab -> "Account linking" -> "Authorization URL"
- "Develop" tab -> "Account linking" -> "Token URL"

### Production mode

```shell
# In the directory with cloned google-home project:
docker build -t propuskator/google-home-integration:release .

# In the composer directory:
docker-compose up -d access-nginx access-percona access-backend access-emqx google-home
```

## Release

Release process is described here: https://developers.google.com/assistant/smarthome/develop/launching

## Important notes
- Smart Home docs: https://developers.google.com/assistant/smarthome/overview
- Feel free to set demo server URL for the "MQTT_URI" variable and restore demo database backup locally if you need to
reproduce demo server state locally