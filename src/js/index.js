import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";
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

/***********recipe controller *******************/
const controlRecipe = async () => {
  //Get the id from url
  const id = window.location.hash.replace("#", "");

  if (id) {
    //prepare ui for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    //highlight the selected search item
    if (state.search) searchView.highlightSelected(id);

    //create new recipe object
    state.recipe = new Recipe(id);
    window.r = state.recipe;
    //get recipe data
    try {
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();
      //Calculate servings and time
      state.recipe.calculateTime();
      state.recipe.calculateServings();

      //render recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
    } catch (err) {
      alert("error processing recipe:" + err);
    }
  }
};

/*********List Controller ********/
const controlList = () => {
  //create a new list if not there
  if (!state.list) state.list = new List();

  //Add each ingredient to the list and UI
  state.recipe.ingredients.forEach((el) => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};

const controlLikes = () => {
  if (!state.likes) state.likes = new Likes();
  const currentID = state.recipe.id;

  //User has not yet likes current recipe
  if (!state.likes.isLiked(currentID)) {
    //Add like to the state
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );

    //toggle the like button
    likesView.toggleLikeBtn(true);

    //Add like to UI list
    likesView.renderLike(newLike);
  } else {
    //remove like from state
    state.likes.deleteLikes(currentID);
    //toggle the like button
    likesView.toggleLikeBtn(false);
    //Remove like from UI list
    likesView.deleteLike(currentID);
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
};

//handle delete and update list item events
elements.shoppingList.addEventListener("click", (e) => {
  const id = e.target.closest(".shopping__item").dataset.itemid;

  //handle the delete button
  if (e.target.matches(".shopping__delete, .shopping__delete *")) {
    //delete from the state
    state.list.deleteItem(id);
    //delete from UI
    listView.deleteItem(id);
  } else if (e.target.matches(".shopping__count-value")) {
    const val = parseFloat(e.target.value);
    state.list.updateCount(id, val);
  }
});

["hashchange", "load"].forEach((event) =>
  window.addEventListener(event, controlRecipe)
);

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

//Handling recipe button clicks
elements.recipe.addEventListener("click", (e) => {
  if (e.target.matches(".btn-decrease, .btn-decrease *")) {
    //Decrease button is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings("dec");
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches(".btn-increase, .btn-increase *")) {
    //Increase button is clicked
    state.recipe.updateServings("inc");
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches(".recipe__btn--add, .recipe__btn--add *")) {
    controlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    controlLikes();
  }
});

window.addEventListener("load", () => {
  state.likes = new Likes();
  state.likes.readStorage();

  likesView.toggleLikeMenu(state.likes.getNumLikes());

  state.likes.likes.forEach((like) => likesView.renderLike(like));
});
