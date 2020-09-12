import Search from "./models/Search";
import Recipe from "./models/Recipe";
import * as searchView from "./views/searchView";
import { elements, renderLoader, clearLoader } from "./views/base";
/*Global state of the app 
- search object
- current recipe object
- shopping list object
- Liked recipe
*/

const state = {};

/***********search controller *******************/
const controlSearch = async () => {
  // 1) Get the query from the view
  const query = searchView.getInput();

  if (query) {
    //2) new search object and add to state
    state.search = new Search(query);

    //3) Prepare UI for results
    searchView.clearInput();
    searchView.clearResult();
    renderLoader(elements.searchRes);

    try {
      //4) Search for recipes
      await state.search.getResult();

      //5) render results on UI
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (err) {
      alert(err);
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-inline");
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResult();
    searchView.renderResults(state.search.result, goToPage);
  }
});

/***********recipe controller *******************/
const controlRecipe = async () => {
  //Get the id from url
  const id = window.location.hash.replace("#", "");

  if (id) {
    //prepare ui for changes

    //create new recipe object
    state.recipe = new Recipe(id);
    window.r = state.recipe;
    //get recipe data
    try {
      await state.recipe.getRecipe();

      //Calculate servings and time
      state.recipe.calculateTime();
      state.recipe.calculateServings();

      //render recipe
      console.log(state.recipe);
    } catch (err) {
      alert("error processing recipe");
    }
  }
};

["hashchange", "load"].forEach((event) =>
  window.addEventListener(event, controlRecipe)
);
