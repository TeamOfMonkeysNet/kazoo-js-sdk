# kazoo-js-sdk
Kazoo SDK for JavaScript provides integration for your application to easily interact with Kazoo endpoints.

Documentation for the Kazoo API can be found [here](https://docs.2600hz.com/supported/).

## Getting Started

### Install

```bash
yarn install @2600hz/kazoo-js-sdk
```

### Import

```js
import SDK from "@2600hz/kazoo-js-sdk";
```

### Initialize

A server host where Kazoo is accessible from has to be provided:
```js
const sdk = SDK({
    host: "{{KAZOO_SERVER_HOST}}"
});
```

### Authentication

#### Authenticate

```js
const {
    username,
    password,
    accountName
} = getCredentials()

sdk.authenticate(
    username,
    password,
    accountName
);
```
where `getCredentials()` retrieves credentials information from the user.

#### Subscribe

To register a callback on subscription events:
```js
sdk.Auth$.subscribe(({
  credentials,
  authToken,
  userId,
  accountId,
  accountName,
  currentAccountId,
  currentAccountName
}) => {
    // Do something with auth information
});
```

### Resources Access
Accessing Kazoo resources is easy when you know the resource's path (more info [here](https://docs.2600hz.com/supported/#accessing-to-rest-api-resources)) and how Kazoo works. For example, listing `users` when looking at the Kazoo [documentation](https://docs.2600hz.com/supported/applications/crossbar/doc/users/#fetch), we see the following endpoint descriptor:
```
GET /v2/accounts/{ACCOUNT_ID}/users
```
From that, we can deduce the path and method to access that resource and build a query such as:

```js
sdk.
    resources.
    accounts.
    users.
    get().
    then(({
        data: users
    }) => {
        // Do something with users payload
    }).
    catch(console.error)
```

To fetch a specific user, the path descriptor looks like:
```
GET /v2/accounts/{ACCOUNT_ID}/users/{USER_ID}
```
which can be translated to:

```js
sdk.
    resources.
    accounts.
    users.
    get({
        data: {
            user_id: "" // matches {USER_ID} from the path descriptor
        }
    }).
    then(({
        data: user
    }) => {
        // Do something with the user payload
    }).
    catch(console.error)
```

To create/update/patch a document, the data corresponding to this entity should be provided as `body`:

```js
sdk.
    resources.
    accounts.
    users.
    patch({
        data: {
            user_id: "{USER_ID}"
        }
        body: {
            enabled: false
        }
    }).
    then((response) => {
        // Do something with the updated user payload
    }).
    catch(console.error)
```

## SDK Features

### Resources identifiers
When making a request to an endpoint that requires resources identifiers, such information should be provided to the SDK under the `data` object.

For example, when requesting a specific message for a specific voicemail box, the endpoint descriptor [looks](https://docs.2600hz.com/supported/applications/crossbar/doc/voicemail/#fetch-a-message-from-the-voicemail-box) like:
```
GET /v2/accounts/{ACCOUNT_ID}/vmboxes/{VM_BOX_ID}/messages/{VM_MSG_ID}

```
The query to fetch this resource would be:

```js
sdk.
    resources.
    accounts.
    vmboxes.
    messages.
    get({
        data: {
            vm_box_id: "", // matches {VM_BOX_ID} from the path descriptor
            vm_msg_id: "" // matches {VM_MSG_ID} from the path descriptor
        }
    }).
    then((response) => {
        // Do something with the user payload
    }).
    catch(console.error)
```
Notice how each property under the `data` object provided to the `get` method for this endpoint matches the resources identifiers present in the endpoint descriptor, at the exception on `{ACCOUNT_ID}`.

Since Kazoo resources uses a hierarchical structure where most resources require an account ID to access them, the SDK will auto populate `{ACCOUNT_ID}` with the ID of the currently logged in session.

It is possible to override such a behavior on a per request basis by simply providing an `account_id` prop to the `data` object. The previous query could look like:

```js
sdk.
    resources.
    accounts.
    vmboxes.
    messages.
    get({
        data: {
            account_id: ""
            vm_box_id: "",
            vm_msg_id: ""
        }
    }).
    then((response) => {
        // Do something with the user payload
    }).
    catch(console.error)
```



### Sign Out
In the event the current session requires "deauthentication", the following method can be used:

```js
sdk.signOut();
```

Note that calling this method will simply change the state of the SDK to unauthenticated. It will not revoke the validity of the previously used token, as Kazoo does not provide such a facility.

### Query String Parameters
Certain Kazoo endpoints use query string parameters to provide [searching](https://docs.2600hz.com/supported/applications/crossbar/doc/search/#query-string-parameters) abilities.

More broadly, the majority of endpoints provide a powerful filtering system through the use of query string parameters (documentation can be found [here](https://docs.2600hz.com/supported/applications/crossbar/doc/filters/)).

To set query string parameters on any requests, the `params` object can be used, such as:
```js
sdk.
    resources.
    accounts.
    cdrs.
    get({
        params: {
            start_key: "{NEXT_START_KEY}", // request the next page of CDRs
            page_size: "100", // the number of results returned by this request
            filter_presence_id: "0" // only returns with a presence_id prop matching 0
        }
    })
```

### Access Session Data

When information about the current session has to be accessed, the following method can be used:
```js
const {
  credentials,
  authToken,
  userId,
  accountId,
  accountName,
  currentAccountId,
  currentAccountName
} = sdk.Auth$.getValue();
```

## Example Usages

- [Browser](https://github.com/2600hz/kazoo-js-sdk/tree/main/examples/browser): run `yarn run example:browser` to serve it