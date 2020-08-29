import Search from "./models/Search";
import * as searchView from "./views/searchView";
import { elements } from "./views/base";
/*Global state of the app 
- search object
- current recipe object
- shopping list object
- Liked recipe
*/

const state = {};

const controlSearch = async () => {
  // 1) Get the query from the view
  const query = searchView.getInput();
  console.log(query);

  if (query) {
    //2) new search object and add to state
    state.search = new Search(query);

    //3) Prepare UI for results
    searchView.clearInput();
    searchView.clearResult();

    //4) Search for recipes
    await state.search.getResult();

    //5) render results on UI
    searchView.renderResults(state.search.result);
  }
};

elements.searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  controlSearch();
});
