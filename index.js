import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import prettyBytes from "pretty-bytes";
import editors from "./editor";

//Select the html fields
const form = document.querySelector("[data-form]");
const queryParamsContainer = document.querySelector("[data-queryParams]");
const requestHeadersContainer = document.querySelector("[data-requestHeaders]");
const keyValueTemplate = document.querySelector("[data-keyValueTemplate");
const responseHeadersContainer = document.querySelector(
  "[data-responseHeaders]"
);

//By defualt, both query params and request headers have one input pair after the intial load
queryParamsContainer.append(createKeyValuePair());
requestHeadersContainer.append(createKeyValuePair());

const { requestEditor, updateResponseEditor } = editors();

//Listener for the submit on the form
form.addEventListener("submit", (e) => {
  e.preventDefault();

  let data;
  try {
    data = JSON.parse(requestEditor.state.doc.toString() || null);
  } catch (e) {
    alert("Invalid JSON");
  }

  axios({
    url: document.querySelector("[data-url]").value,
    method: document.querySelector("[data-method]").value,
    params: keyValuePairsToObjects(queryParamsContainer),
    headers: keyValuePairsToObjects(requestHeadersContainer),
    data,
  })
    .catch((e) => e)
    .then((response) => {
      //Show the response field when the request is answered and update the fields
      document
        .querySelector("[data-ResponseSection]")
        .classList.remove("d-none");
      updateResponseDetails(response);
      updateResponseEditor(response.data);
      updateResponseHeaders(response.headers);
    });
});

//Intercepts the axios request and save the current time to calculate later how much time the axios call took
axios.interceptors.request.use((request) => {
  request.customData = request.customData || {};
  request.customData.startTime = new Date().getTime();
  return request;
});

//Intercepts the axios response and save the current time to calculate how much time the axios call took (difference with the request)
axios.interceptors.response.use(updateEndTime, (e) => {
  return Promise.reject(updateEndTime(e.response));
});

//Takes and defaulting the response and calculates the time
function updateEndTime(response) {
  response.customData = response.customData || {};
  response.customData.time =
    new Date().getTime() - response.config.customData.startTime;
  return response;
}

//Listener for adding a new pair in QueryParams
document
  .querySelector("[data-addQueryParamBtn]")
  .addEventListener("click", () => {
    queryParamsContainer.append(createKeyValuePair());
  });

//Listener for adding a new pair in Headers
document
  .querySelector("[data-addRequestHeaderBtn]")
  .addEventListener("click", () => {
    requestHeadersContainer.append(createKeyValuePair());
  });

//Create a new pair based on the bootstrap template
function createKeyValuePair() {
  const element = keyValueTemplate.content.cloneNode(true);

  //Listener for the remove function of the button
  element.querySelector("[data-removeBtn]").addEventListener("click", (e) => {
    e.target.closest("[data-keyValuePair]").remove();
  });
  return element;
}

//Convert the html input for key and value from the pairs into an object to send through axios
function keyValuePairsToObjects(container) {
  const pairs = container.querySelectorAll("[data-keyValuePair]");
  return [...pairs].reduce((data, pair) => {
    const key = pair.querySelector("[data-key]").value;
    const value = pair.querySelector("[data-value]").value;

    //empty pair
    if (key === "") {
      return data;
    }

    return { ...data, [key]: value };
  }, {});
}

//Update funcions after the response
//Update the Headers container: first clean it and iterate the result for adding both key and value into the editor
function updateResponseHeaders(headers) {
  responseHeadersContainer.innerHTML = "";

  Object.entries(headers).forEach(([key, value]) => {
    const keyElement = document.createElement("div");
    keyElement.textContent = key;
    responseHeadersContainer.append(keyElement);

    const valueElement = document.createElement("div");
    valueElement.textContent = value;
    responseHeadersContainer.append(valueElement);
  });
}

//Update the status, time and size info on the response (info formatted with prettyBytes)
function updateResponseDetails(response) {
  document.querySelector("[data-status]").textContent = response.status;
  document.querySelector("[data-time]").textContent = response.customData.time;
  document.querySelector("[data-size]").textContent = prettyBytes(
    JSON.stringify(response.data).length +
      JSON.stringify(response.headers).length
  );
}
