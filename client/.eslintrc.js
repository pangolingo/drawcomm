module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": [
        "airbnb-base"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint",
        "import"
    ],
    "rules": {
        // make sure Typescript imports don't get flagged as unused vars
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "error",
        // avoid errors about no file extension in imports
        "import/extensions": "off",
        "class-methods-use-this": "off",
        "no-param-reassign": ["error", { "props": false }]
    },
    "settings": {
        "import/resolver": {
          "typescript": {}
        }
      },
};