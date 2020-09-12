import axios from "axios";

export default class Recipe {
  constructor(id) {
    this.id = id;
  }

  async getRecipe() {
    try {
      const res = await axios(
        `https://forkify-api.herokuapp.com/api/get?rId=${this.id}`
      );
      this.title = res.data.recipe.title;
      this.author = res.data.recipe.publisher;
      this.img = res.data.recipe.image_url;
      this.url = res.data.recipe.source_url;
      this.ingredients = res.data.recipe.ingredients;
    } catch (error) {
      console.log(error);
    }
  }

  calculateTime() {
    const numOfIngredient = this.ingredients.length;
    const periods = Math.ceil(numOfIngredient / 3);
    this.time = periods * 15;
  }

  calculateServings() {
    this.servings = 4;
  }

  parseIngredients() {
    const unitsLong = [
      "tablespoons",
      "tablespoon",
      "ounces",
      "ounce",
      "teaspoons",
      "teasppon",
      "cups",
      "pounds",
    ];
    const unitsShort = [
      "tbsp",
      "tbsp",
      "oz",
      "oz",
      "tsp",
      "tsp",
      "cup",
      "pound",
    ];
    const newIngredients = this.ingredients.map((el) => {
      //1. Uniform units
      let ingredient = el.toLowerCase();
      unitsLong.forEach((unit, i) => {
        ingredient = ingredient.replace(unit, unitsShort[i]);
      });
      //2. Remove parentheses
      ingredient = ingredient.replace(/ *\([^)]*\) */g, " ");

      //3. Parse ingredients into count, unit and ingredient
      const arrIngredient = ingredient.split(" ");
      const unitIndex = arrIngredient.findIndex((elem) =>
        unitsShort.includes(elem)
      );

      let objIngredient;

      if (unitIndex > -1) {
        //there is a unit
        //Ex. 4 1/2 cups, arrCount is [4, 1/2] --> eval("4+1/2") --> 4.5
        //Ex.  cups, arrCount is [4]
        const arrCount = arrIngredient.slice(0, unitIndex);

        let count;
        if (arrCount.length === 1) {
          count = eval(arrIngredient[0].replace("-", "+")); //handling 1-1/2 case
        } else {
          count = eval(arrIngredient.slice(0, unitIndex).join("+"));
        }

        //if key and value is same then we can write only the vaue name (new in es6)
        objIngredient = {
          count,
          unit: arrIngredient[unitIndex],
          ingredient: arrIngredient.slice(unitIndex + 1).join(" "),
        };
      } else if (parseInt(arrIngredient[0], 10)) {
        //There is no Unit, but 1st element is number
        objIngredient = {
          count: parseInt(arrIngredient[0], 10),
          unit: "",
          ingredient: arrIngredient.slice(1).join(" "),
        };
      } else if (unitIndex === -1) {
        //there is no unit and no number at first position
        objIngredient = {
          count: 1,
          unit: "",
          ingredient,
        };
      }

      return objIngredient;
    });
    this.ingredients = newIngredients;
  }
}
