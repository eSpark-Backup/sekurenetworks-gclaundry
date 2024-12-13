export const getDefaultSurvey = (macId: string) => {
  return [
    {
      kioskId: macId,
      question: "Which stains are better removed with cold water?",
      options: [
        {
          "option": "Food",
          "is_valid": false
        },
        {
          "option": "Blood",
          "is_valid": false
        },
        {
          "option": "Beverage",
          "is_valid": false
        },
        {
          "option": "All of the above",
          "is_valid": true
        }
      ]
    },
    {
      kioskId: macId,
      question: "How much energy is saved using cold versus hot water",
      options: [
        {
          "option": "27%",
          "is_valid": false
        },
        {
          "option": "66%",
          "is_valid": false
        },
        {
          "option": "50%",
          "is_valid": false
        },
        {
          "option": "93%",
          "is_valid": true
        }
      ]
    },
    {
      kioskId: macId,
      question: "What fabrics are best preserved by using a drying rack (air dry) instead of a dryer cycle? ",
      options: [
        {
          "option": "Knitted/Woven fabrics (sweaters, cardigans, wool)",
          "is_valid": false
        },
        {
          "option": "Leather, Suede, Faux Leather, Natural or Faux Fur",
          "is_valid": false
        },
        {
          "option": "Silk, Lingerie, Delicate Fabrics, Spandex/Lycra",
          "is_valid": false
        },
        {
          "option": "All of the above",
          "is_valid": true
        }
      ]
    }
  ]
}

export const getDefaultMsgs = (macId: string) => {
  return [
    {
      kioskId: macId,
      quote: "If 2 out of 3 people refill Generation Conscious sheets instead of using pods or liquid detergent then we can achieve a 45% carbon reduction pathway in the laundry detergent category"
    },
    {
      kioskId: macId,
      quote: "Hygiene Security: Did you know 1 in 5 U.S. citizens cuts back on food to buy hygiene products",
    },
    {
      kioskId: macId,
      quote: "Eco-Classism is where \"sustainable\" products are only accessible to upper-middle class people. ",
    }
  ]
}