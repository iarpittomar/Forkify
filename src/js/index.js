import axios from "axios";

async function getResult(query) {
  const res = await axios(
    `https://forkify-api.herokuapp.com/api/search?q=${query}`
  );
  console.log(res);
}

getResult("pizza");
