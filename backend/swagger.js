import swaggerAutogen from "swagger-autogen";
const outputJSON = "./swagger-out.json";
const endpointFiles = ["./index.js"];

const docInfo = {
    info: {
      title: 'POS Backend API',
      version: '1.0.0',
      description: 'API documentation for the Project 3 Backend',
      contact: {
        name: "IDF's Greatest Warriors",
        email: "yahu@mossad.il"
      }
    },
    host: "localhost:5000",
    tags: [
        {
            name: "Menu", description: "Endpoints for handling the Restaurant Menu"
        },
        {
            name: "Employees", description: "Endpoints for handling the Restaurant Employees"
        }

    ]
}
swaggerAutogen(outputJSON, endpointFiles, docInfo);