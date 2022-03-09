import SDK from "../../lib/main.js";
const $ = document.querySelector.bind(document);

$("#form").addEventListener("submit", (e) => {
  e.preventDefault();

  const form = new FormData(e.target);
  const username = form.get("username");
  const password = form.get("password");
  const accountName = form.get("account");
  const serverUrl = form.get("server-url");

  const sdk = SDK({
    host: serverUrl,
  });

  window.sdk = sdk;

  sdk.Auth$.subscribe((data) => {
    $("#form").style.display = data.authToken ? "none" : "block";
    $("#auth-status").innerHTML = data.authToken
      ? "Authenticated"
      : "Unauthenticated";
  });

  sdk.authenticate(username, password, accountName);
});
