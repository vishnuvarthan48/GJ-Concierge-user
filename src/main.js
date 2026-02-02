import "./style.css";

document.querySelector("#app").innerHTML = `
  <div>
    <h1>GJ-Concierge-user</h1>
    <button id="counter" type="button">Count: 0</button>
  </div>
`;

let count = 0;
document.querySelector("#counter").addEventListener("click", () => {
  count++;
  document.querySelector("#counter").textContent = `Count: ${count}`;
});
